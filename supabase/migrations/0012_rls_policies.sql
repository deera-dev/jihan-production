-- ============================================================================
-- 0012 — Row Level Security: pola umum + pengecualian
--
-- Pola umum (berlaku di SEMUA tabel domain bisnis):
--   • deera_full_{tabel}  → Tim Deera: FOR ALL (full CRUD)
--   • jihan_read_{tabel}  → Tim Jihan: FOR SELECT (read-only)
--
-- Pengecualian didaftarkan eksplisit setelah loop, sesuai CLAUDE.md:
--   - sampel_catatan : Jihan boleh INSERT (tambah catatan sampel)
--   - kode           : Jihan boleh UPDATE (approve/tolak sampel — dibatasi field
--                      status di application layer, bukan di RLS)
--   - hpp            : Jihan boleh UPDATE (approve/tolak HPP — dibatasi field
--                      status & alasan_tolak di application layer)
--   - pengiriman     : Jihan boleh UPDATE (approve/tolak pengiriman parsial)
--   - kasbon         : Jihan SELECT-only murni (tanpa insert/update/delete apapun)
--   - notifications  : tiap user hanya akses milik sendiri (bukan pola deera/jihan)
--   - notification_preferences & push_subscriptions: tiap user kelola milik sendiri
--   - activity_log   : HANYA Deera (Jihan sama sekali tidak boleh lihat)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Aktifkan RLS + pasang pola umum (deera_full / jihan_read) di semua tabel
--    domain bisnis. Tabel dengan kebutuhan akses berbeda (lihat daftar di atas)
--    akan di-override / ditambah policy lagi pada langkah berikutnya.
-- ----------------------------------------------------------------------------
do $$
declare
  t text;
  tabel_domain text[] := array[
    'produksi', 'surat_jalan', 'produksi_bahan', 'produksi_bahan_warna',
    'kode_sequence', 'kode', 'kode_ukuran', 'kode_ukuran_warna',
    'sampel', 'sampel_catatan',
    'hpp', 'hpp_revisi', 'hpp_template_komponen',
    'katalog_bahan_baku', 'nota_pembelian', 'nota_item', 'nota_item_kode',
    'tracking_produksi', 'tracking_reject',
    'pengiriman', 'pengiriman_item',
    'kasbon'
  ];
begin
  foreach t in array tabel_domain loop
    execute format('alter table public.%I enable row level security;', t);

    execute format(
      'create policy %I on public.%I for all using (public.is_deera()) with check (public.is_deera());',
      'deera_full_' || t, t
    );

    execute format(
      'create policy %I on public.%I for select using (public.is_jihan());',
      'jihan_read_' || t, t
    );
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 2) Pengecualian — Tim Jihan
-- ----------------------------------------------------------------------------

-- sampel_catatan: Jihan boleh menambah catatan (selain approve/tolak)
create policy "jihan_insert_sampel_catatan"
  on public.sampel_catatan for insert
  with check (public.is_jihan() and auth.uid() = user_id);

-- kode: Jihan boleh UPDATE untuk approve/tolak sampel & HPP
-- (pembatasan hanya kolom `status` & `status_sebelum_dibatalkan` ditegakkan
-- di application layer / kode repository — RLS tidak bisa membatasi per-kolom
-- pada UPDATE tanpa trigger tambahan, jadi disiplin di sisi klien wajib dijaga)
create policy "jihan_update_kode_status"
  on public.kode for update
  using (public.is_jihan())
  with check (public.is_jihan());

-- hpp: Jihan boleh UPDATE untuk approve/tolak HPP (status, alasan_tolak)
create policy "jihan_update_hpp_status"
  on public.hpp for update
  using (public.is_jihan())
  with check (public.is_jihan());

-- pengiriman: Jihan boleh UPDATE untuk approve/tolak pengiriman parsial
create policy "jihan_update_pengiriman_approval"
  on public.pengiriman for update
  using (public.is_jihan())
  with check (public.is_jihan());

-- kasbon: Jihan benar-benar read-only — cabut hak tulis apapun yang mungkin
-- ter-grant lewat pola umum (tidak ada, krn loop hanya buat deera_full + jihan_read,
-- tapi policy ini didaftarkan eksplisit sbg dokumentasi & jaring pengaman)
-- → tidak perlu policy tambahan; jihan_read_kasbon (SELECT) sudah cukup & final.

comment on policy "jihan_read_kasbon" on public.kasbon is
  'Tim Jihan murni read-only atas ledger kasbon — transparansi saldo & histori, tanpa hak ubah/hapus apapun (lihat CLAUDE.md Hard Rules).';

-- ----------------------------------------------------------------------------
-- 3) Tabel dengan kepemilikan per-user (bukan pola deera/jihan)
-- ----------------------------------------------------------------------------

alter table public.notifications enable row level security;
create policy "own_notifications"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.notification_preferences enable row level security;
create policy "own_notification_preferences"
  on public.notification_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.push_subscriptions enable row level security;
create policy "own_push_subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4) Activity log — hanya Deera, Jihan sama sekali tidak punya akses
-- ----------------------------------------------------------------------------
alter table public.activity_log enable row level security;
create policy "deera_only_activity_log"
  on public.activity_log for all
  using (public.is_deera())
  with check (public.is_deera());
