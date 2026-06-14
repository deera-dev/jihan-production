-- ============================================================================
-- 0013 — Trigger logika bisnis lintas-tabel
--
-- Catatan: trigger di sini fokus pada INTEGRITAS DATA yang harus selalu
-- konsisten di level database (tidak boleh tergantung disiplin client).
-- Pengiriman notifikasi ke user (siapa & lewat kanal apa) tetap menjadi
-- tanggung jawab Edge Function `push-notify` / `notif-digest` — trigger di
-- sini hanya menyiapkan DATA yang melatarbelakangi notifikasi tsb.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- A) Auto-create tracking_produksi saat status kode → 'produksi'
--    4 baris (dipotong, dijahit, finishing, siap_kirim) per kode_ukuran_warna
--    yang sudah ada dari data buku potong.
-- ----------------------------------------------------------------------------
create function public.buat_tracking_produksi_otomatis()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'produksi' and old.status is distinct from 'produksi' then
    insert into public.tracking_produksi (kode_ukuran_warna_id, tahap)
    select kuw.id, tahap.nama
    from public.kode_ukuran ku
    join public.kode_ukuran_warna kuw on kuw.kode_ukuran_id = ku.id
    cross join (values ('dipotong'), ('dijahit'), ('finishing'), ('siap_kirim')) as tahap(nama)
    where ku.kode_id = new.id
    on conflict (kode_ukuran_warna_id, tahap) do nothing;
  end if;

  return new;
end;
$$;

create trigger trg_buat_tracking_produksi_otomatis
  after update on public.kode
  for each row execute function public.buat_tracking_produksi_otomatis();

comment on function public.buat_tracking_produksi_otomatis() is
  'Membuat baris tracking_produksi otomatis (per ukuran, per warna, per tahap) begitu kode memasuki status produksi.';

-- ----------------------------------------------------------------------------
-- B) Auto-catat potongan kasbon saat status kode → 'selesai'
--    nominal = HPP per pcs (frozen, dari snapshot hpp) × jumlahAkhirDikirim
--    (= total pcs dari seluruh pengiriman yang sudah disetujui Jihan)
-- ----------------------------------------------------------------------------
create function public.catat_potongan_kasbon_otomatis()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hpp_per_pcs   integer;
  v_total_dikirim integer;
  v_nominal       numeric;
begin
  if new.status = 'selesai' and old.status is distinct from 'selesai' then

    select h.total_hpp_per_baju into v_hpp_per_pcs
    from public.hpp h
    where h.kode_id = new.id and h.status = 'approved';

    select coalesce(sum(pi.jumlah_pcs), 0) into v_total_dikirim
    from public.pengiriman p
    join public.pengiriman_item pi on pi.pengiriman_id = p.id
    where p.kode_id = new.id and p.status_approval = 'disetujui';

    if v_hpp_per_pcs is null then
      raise exception 'Kode % tidak punya HPP approved — potongan kasbon otomatis dibatalkan.', new.kode_desain;
    end if;

    v_nominal := v_hpp_per_pcs::numeric * v_total_dikirim;

    -- nominal = 0 tetap dicatat agar histori lengkap & transparan (kasus pcs terkirim 0 sangat tidak lazim,
    -- tapi constraint kasbon.nominal > 0 mencegah insert 0 — maka skip dgn catatan eksplisit)
    if v_nominal > 0 then
      insert into public.kasbon (tanggal, tipe, nominal, kode_id, catatan, created_by)
      values (
        current_date,
        'potongan_otomatis',
        v_nominal,
        new.id,
        format('POTONGAN OTOMATIS — KODE %s SELESAI (HPP/PCS Rp %s × %s PCS)',
               new.kode_desain, v_hpp_per_pcs, v_total_dikirim),
        null
      );
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_catat_potongan_kasbon_otomatis
  after update on public.kode
  for each row execute function public.catat_potongan_kasbon_otomatis();

comment on function public.catat_potongan_kasbon_otomatis() is
  'Implementasi formula saldoKasbon: begitu kode mencapai status selesai, sistem mencatat entri potongan_otomatis sebesar HPP per pcs × jumlahAkhirDikirim — tanpa input manual, mengurangi saldo berjalan.';

-- ----------------------------------------------------------------------------
-- C) Update harga_terkini di katalog_bahan_baku saat ada nota_item baru
--    (basis "unit": qty × harga_satuan; harga_terkini = harga_satuan terbaru)
-- ----------------------------------------------------------------------------
create function public.update_harga_terkini_katalog()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.katalog_id is not null and new.tipe = 'unit' and new.harga_satuan is not null then
    update public.katalog_bahan_baku
    set harga_terkini = new.harga_satuan
    where id = new.katalog_id;
  end if;

  return new;
end;
$$;

create trigger trg_update_harga_terkini_katalog
  after insert on public.nota_item
  for each row execute function public.update_harga_terkini_katalog();

comment on function public.update_harga_terkini_katalog() is
  'Setiap nota_item unit-based baru otomatis memperbarui harga_terkini di katalog_bahan_baku, sbg referensi harga terbaru.';

-- ----------------------------------------------------------------------------
-- D) Auto-isi total_nilai pada nota_pembelian dari sum nota_item
-- ----------------------------------------------------------------------------
create function public.sync_total_nilai_nota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nota_id uuid;
begin
  v_nota_id := coalesce(new.nota_id, old.nota_id);

  update public.nota_pembelian np
  set total_nilai = (
    select coalesce(sum(
      case when ni.tipe = 'unit' then (ni.qty * ni.harga_satuan)::integer else ni.total_nilai end
    ), 0)
    from public.nota_item ni
    where ni.nota_id = v_nota_id
  )
  where np.id = v_nota_id;

  return coalesce(new, old);
end;
$$;

create trigger trg_sync_total_nilai_nota_insert
  after insert or update or delete on public.nota_item
  for each row execute function public.sync_total_nilai_nota();
