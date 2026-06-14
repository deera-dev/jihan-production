-- ============================================================================
-- 0003 — Kode produk, ukuran, dan varian warna (dari buku potong)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- public.kode_sequence — counter global nomor kode (selalu 1 row)
-- Dipakai sbg SARAN/placeholder nomor berikutnya di form input — bukan
-- auto-generate penuh. Input kode_desain tetap manual oleh Deera; sistem
-- hanya menjaga counter & validasi keunikan (lihat trigger di bawah).
-- ----------------------------------------------------------------------------
create table public.kode_sequence (
  id           uuid primary key default gen_random_uuid(),
  last_number  integer not null default 0,
  updated_at   timestamptz not null default now()
);

insert into public.kode_sequence (last_number) values (0);

-- ----------------------------------------------------------------------------
-- public.kode — sebelumnya disebut 'desain'
-- Format: J-[nomor 3 digit]-[3 huruf kode bahan], mis. J-001-IMA
-- ----------------------------------------------------------------------------
create table public.kode (
  id                          uuid primary key default gen_random_uuid(),
  produksi_id                 uuid not null references public.produksi(id) on delete cascade,
  kode_desain                 text not null unique,   -- J-001-IMA, input manual Deera (uppercase)
  harga_jual_target           integer,
  catatan                     text,                   -- uppercase
  urutan                      integer not null default 1,
  status                      text not null default 'sampel_dibuat' check (status in (
                                'sampel_dibuat', 'review_sampel', 'sampel_ditolak', 'sampel_approved',
                                'estimasi_pemakaian', 'konfirmasi_pemakaian', 'proses_potong',
                                'input_buku_potong', 'input_nota', 'input_hpp',
                                'review_hpp', 'hpp_ditolak', 'hpp_approved',
                                'produksi', 'siap_kirim', 'selesai', 'dibatalkan'
                              )),
  status_sebelum_dibatalkan   text,   -- simpan status terakhir sebelum dibatalkan, agar bisa lanjut lagi
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  deleted_at                  timestamptz
);

create trigger trg_kode_updated_at
  before update on public.kode
  for each row execute function public.set_updated_at();

create index idx_kode_produksi_id on public.kode (produksi_id);
create index idx_kode_status on public.kode (status);
create index idx_kode_deleted_at on public.kode (deleted_at);

-- Validasi format kode_desain: J-[3 digit]-[3 huruf]
alter table public.kode
  add constraint kode_desain_format_check
  check (kode_desain ~ '^J-[0-9]{3}-[A-Z]{3}$');

comment on table public.kode is 'Identitas desain. Satu produksi bisa punya >1 kode. Nomor global sequential, tidak restart per bahan.';
comment on column public.kode.status_sebelum_dibatalkan is 'Dipakai utk kembali ke status semula jika kode yang dibatalkan direvisi & dilanjutkan kembali.';

-- Jaga kode_sequence.last_number tetap >= nomor terbesar yg pernah dipakai,
-- supaya UI bisa menyarankan nomor berikutnya sbg placeholder (bukan pre-fill).
create function public.sync_kode_sequence()
returns trigger
language plpgsql
as $$
declare
  v_nomor integer;
begin
  v_nomor := substring(new.kode_desain from 'J-([0-9]{3})-')::integer;

  update public.kode_sequence
  set last_number = greatest(last_number, v_nomor),
      updated_at  = now();

  return new;
end;
$$;

create trigger trg_sync_kode_sequence
  after insert on public.kode
  for each row execute function public.sync_kode_sequence();

-- ----------------------------------------------------------------------------
-- public.kode_ukuran — varian ukuran per kode (MIDI, GAMIS, dll)
-- ----------------------------------------------------------------------------
create table public.kode_ukuran (
  id        uuid primary key default gen_random_uuid(),
  kode_id   uuid not null references public.kode(id) on delete cascade,
  ukuran    text not null check (ukuran in ('MIDI', 'GAMIS', 'MIDI JUMBO', 'GAMIS JUMBO')),
  urutan    integer not null default 1,

  unique (kode_id, ukuran)
);

create index idx_kode_ukuran_kode_id on public.kode_ukuran (kode_id);

comment on table public.kode_ukuran is 'Total pcs ukuran ini = SUM(kode_ukuran_warna.jumlah_pcs).';

-- ----------------------------------------------------------------------------
-- public.kode_ukuran_warna — pcs per warna per ukuran, dari buku potong
-- ----------------------------------------------------------------------------
create table public.kode_ukuran_warna (
  id               uuid primary key default gen_random_uuid(),
  kode_ukuran_id   uuid not null references public.kode_ukuran(id) on delete cascade,
  nama_warna       text not null,    -- uppercase, harus cocok dengan produksi_bahan_warna.nama_warna
  jumlah_pcs       integer not null default 0,

  unique (kode_ukuran_id, nama_warna)
);

create index idx_kode_ukuran_warna_ukuran_id on public.kode_ukuran_warna (kode_ukuran_id);
