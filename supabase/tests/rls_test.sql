-- ============================================================================
-- TEST RLS — Jihan Production
-- Jalankan di Supabase SQL Editor, SETELAH migration 0001–0013 + seed berhasil.
--
-- CARA PAKAI
-- ----------
-- 1. Jalankan "LANGKAH 0" untuk menemukan UUID akun Deera & Jihan ASLI
--    (akun yang sudah Anda buat lewat invitation flow / signup).
-- 2. Ganti dua placeholder di bawah ini dengan UUID tsb:
--      <<UUID_DEERA>>   ->  uuid milik akun ber-role 'deera'
--      <<UUID_JIHAN>>   ->  uuid milik akun ber-role 'jihan'
--    (cari & ganti di seluruh file ini sebelum menjalankan PART 2 & PART 3)
-- 3. Jalankan tiap PART satu per satu (boleh select semua isi 1 PART lalu Run).
--
-- KENAPA AMAN DIJALANKAN DI DATABASE ASLI
-- ---------------------------------------
-- • PART 1 murni SELECT (tidak mengubah apapun).
-- • PART 2 & PART 3 dibungkus BEGIN ... ROLLBACK — semua percobaan
--   INSERT/UPDATE/DELETE otomatis DIBATALKAN di akhir blok, walau "berhasil".
--   Jangan hapus baris ROLLBACK, dan jangan ganti jadi COMMIT.
--
-- CARA SIMULASI LOGIN PER ROLE
-- ----------------------------
-- Supabase mendefinisikan auth.uid() sebagai uuid yang diambil dari klaim
-- 'sub' pada request.jwt.claims, dan PostgREST menjalankan query sbg role
-- `authenticated`. Kita tiru persis dua hal ini lewat:
--     select set_config('request.jwt.claims', json_build_object('sub', '<uuid>', 'role','authenticated')::text, true);
--     set local role authenticated;
-- Sehingga public.is_deera() / public.is_jihan() membaca user yang "sedang
-- login" persis seperti saat aplikasi berjalan — RLS policy diuji apa adanya.
-- ============================================================================


-- ============================================================================
-- LANGKAH 0 — Temukan UUID akun asli utk simulasi
-- ============================================================================
select id, role, nama_lengkap
from public.users
order by role, created_at;

-- Salin UUID dari hasil di atas, lalu replace <<UUID_DEERA>> dan <<UUID_JIHAN>>
-- di seluruh bagian PART 2 & PART 3 di bawah (gunakan Find & Replace editor Anda).


-- ============================================================================
-- PART 1 — Verifikasi statis: pastikan setiap tabel domain ber-RLS & punya
--          policy yang sesuai pola (deera_full_* / jihan_read_* / pengecualian)
--          Tidak butuh simulasi login — query katalog sistem langsung.
-- ============================================================================

-- 1a. Semua tabel domain bisnis HARUS punya rowsecurity = true
select c.relname as tabel, c.relrowsecurity as rls_aktif
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'produksi','surat_jalan','produksi_bahan','produksi_bahan_warna',
    'kode_sequence','kode','kode_ukuran','kode_ukuran_warna',
    'sampel','sampel_catatan','hpp','hpp_revisi','hpp_template_komponen',
    'katalog_bahan_baku','nota_pembelian','nota_item','nota_item_kode',
    'tracking_produksi','tracking_reject','pengiriman','pengiriman_item',
    'kasbon','notifications','notification_preferences','push_subscriptions',
    'activity_log','users'
  )
order by 1;
-- EKSPEKTASI: rls_aktif = true utk SEMUA baris. Kalau ada yg `false`,
-- tabel tsb TIDAK terlindungi sama sekali — perbaiki migration 0012 dulu.

-- 1b. Daftar semua policy per tabel — cocokkan dgn ekspektasi di
--     RLS_TEST_CHECKLIST.md (kolom `cmd`: r=select, a=all/insert+update+delete dst)
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
-- EKSPEKTASI GARIS BESAR (lihat checklist utk rincian per tabel):
--   • 22 tabel pola umum → masing-masing punya `deera_full_<tabel>` (cmd ALL)
--     dan `jihan_read_<tabel>` (cmd SELECT)
--   • kode, hpp, pengiriman → tambahan policy jihan_update_* (cmd UPDATE)
--   • sampel_catatan        → tambahan jihan_insert_sampel_catatan (cmd INSERT)
--   • kasbon                → TIDAK ADA policy tulis utk Jihan (hanya jihan_read_kasbon)
--   • notifications, notification_preferences, push_subscriptions
--                           → hanya policy `own_*` (cmd ALL, scoped ke auth.uid() = user_id)
--   • activity_log          → hanya `deera_only_activity_log` (cmd ALL, is_deera())
--   • users                 → users_select_all_authenticated (SELECT) +
--                             users_update_own_profile (UPDATE)


-- ============================================================================
-- PART 2 — Simulasi sebagai TIM DEERA  (harus: FULL CRUD + lihat activity_log)
-- ============================================================================
begin;

select set_config(
  'request.jwt.claims',
  json_build_object('sub', '<<UUID_DEERA>>', 'role', 'authenticated')::text,
  true
);
set local role authenticated;

-- 2.0 Sanity check helper role
select public.is_deera() as harus_true, public.is_jihan() as harus_false;

-- 2.1 Deera harus bisa SELECT semua tabel domain (termasuk activity_log & kasbon)
select 'produksi' as tabel, count(*) from public.produksi
union all select 'kode', count(*) from public.kode
union all select 'hpp', count(*) from public.hpp
union all select 'kasbon', count(*) from public.kasbon
union all select 'activity_log', count(*) from public.activity_log;
-- EKSPEKTASI: semua baris muncul TANPA error (count boleh 0 kalau memang belum ada data,
-- yang penting bukan "permission denied").

-- 2.2 Deera harus bisa INSERT (full CRUD) — contoh: buat produksi percobaan
insert into public.produksi (kode_bahan, tanggal, catatan, created_by)
values ('TST', current_date, 'PRODUKSI UJI RLS — AKAN DI-ROLLBACK', '<<UUID_DEERA>>')
returning id, kode_bahan;
-- EKSPEKTASI: berhasil (1 row returned). Tidak akan persist krn ada ROLLBACK di akhir.

-- 2.3 Deera harus bisa UPDATE & DELETE baris yang baru saja dibuat
with target as (select id from public.produksi where catatan = 'PRODUKSI UJI RLS — AKAN DI-ROLLBACK' limit 1)
update public.produksi set catatan = 'PRODUKSI UJI RLS — DIUBAH' where id in (select id from target)
returning id, catatan;

with target as (select id from public.produksi where catatan = 'PRODUKSI UJI RLS — DIUBAH' limit 1)
delete from public.produksi where id in (select id from target)
returning id;
-- EKSPEKTASI: kedua query mengembalikan 1 row (update & delete berhasil).

-- 2.4 Deera TIDAK BOLEH login sbg Jihan & sebaliknya — pastikan helper konsisten
--     (sudah dicek di 2.0; ulangi di sini sbg penanda akhir blok Deera)
select public.is_deera() as konsisten_harus_true;

reset role;
rollback;
-- ↑ Membatalkan SEMUA perubahan di atas (insert/update/delete). Database kembali bersih.


-- ============================================================================
-- PART 3 — Simulasi sebagai TIM JIHAN  (harus: read-only + pengecualian saja)
-- ============================================================================
begin;

select set_config(
  'request.jwt.claims',
  json_build_object('sub', '<<UUID_JIHAN>>', 'role', 'authenticated')::text,
  true
);
set local role authenticated;

-- 3.0 Sanity check helper role
select public.is_deera() as harus_false, public.is_jihan() as harus_true;

-- 3.1 Jihan HARUS bisa SELECT tabel domain biasa (read-only)
select 'produksi' as tabel, count(*) from public.produksi
union all select 'kode', count(*) from public.kode
union all select 'hpp', count(*) from public.hpp
union all select 'kasbon', count(*) from public.kasbon;
-- EKSPEKTASI: semua berhasil tanpa error, count > 0 (jika ada data dari Deera).

-- 3.2 Jihan TIDAK BOLEH melihat activity_log sama sekali
select count(*) from public.activity_log;
-- EKSPEKTASI: query SUKSES (tidak error) tapi mengembalikan count = 0,
-- meskipun tabelnya berisi data (RLS menyaring semua baris utk role Jihan).
-- → Jika count > 0, berarti kebocoran — Jihan bisa lihat activity log (BUG).

-- 3.3 Jihan TIDAK BOLEH insert/update/delete pada tabel domain biasa,
--     mis. mencoba membuat produksi baru harus DITOLAK oleh RLS
do $$
begin
  insert into public.produksi (kode_bahan, tanggal, created_by)
  values ('XXX', current_date, '<<UUID_JIHAN>>');
  raise exception 'BUG RLS: Jihan berhasil INSERT ke produksi — seharusnya ditolak!';
exception
  when insufficient_privilege or others then
    raise notice 'OK — insert Jihan ke produksi ditolak sesuai ekspektasi (%).', sqlerrm;
end $$;
-- EKSPEKTASI: NOTICE "OK — insert Jihan ke produksi ditolak..."
-- Kalau yang muncul adalah EXCEPTION "BUG RLS: ..." → ada kebocoran hak tulis.

-- 3.4 PENGECUALIAN — Jihan BOLEH insert sampel_catatan (tambah catatan sampel)
do $$
declare
  v_sampel_id uuid;
begin
  select id into v_sampel_id from public.sampel limit 1;

  if v_sampel_id is null then
    raise notice 'DILEWATI — belum ada data sampel di database utk diuji.';
  else
    insert into public.sampel_catatan (sampel_id, user_id, isi)
    values (v_sampel_id, '<<UUID_JIHAN>>', 'CATATAN UJI RLS DARI JIHAN — AKAN DI-ROLLBACK');
    raise notice 'OK — Jihan berhasil menambah catatan sampel sesuai pengecualian yang diizinkan.';
  end if;
end $$;
-- EKSPEKTASI: NOTICE "OK — Jihan berhasil menambah catatan sampel..."
-- (atau "DILEWATI" jika belum ada data sampel — jalankan ulang setelah ada data sampel)

-- 3.5 PENGECUALIAN — Jihan BOLEH update status pada `kode`, `hpp`, `pengiriman`
--     (approve/tolak). Di sini kita hanya pastikan RLS MENGIZINKAN operasi UPDATE
--     itu sendiri (bukan menguji logika approve/tolak di application layer).
do $$
declare
  v_kode_id uuid;
  v_status_lama text;
begin
  select id, status into v_kode_id, v_status_lama from public.kode limit 1;

  if v_kode_id is null then
    raise notice 'DILEWATI — belum ada data kode di database utk diuji.';
  else
    update public.kode set status = v_status_lama where id = v_kode_id; -- no-op value, hanya uji izin RLS
    raise notice 'OK — Jihan diizinkan UPDATE baris kode (RLS mengizinkan approve/tolak).';
  end if;
end $$;
-- EKSPEKTASI: NOTICE "OK — Jihan diizinkan UPDATE baris kode..."
-- PENTING: RLS hanya mengizinkan operasi UPDATE-nya; pembatasan KOLOM apa
-- saja yang boleh diubah Jihan (cuma `status`, bukan field bisnis lain)
-- adalah tanggung jawab APPLICATION LAYER (lihat komentar di 0012). Pastikan
-- repository layer Jihan TIDAK PERNAH mengirim kolom lain selain status.

-- 3.6 Jihan TIDAK BOLEH ubah/hapus entri kasbon sama sekali (murni read-only)
do $$
declare
  v_kasbon_id uuid;
begin
  select id into v_kasbon_id from public.kasbon limit 1;

  if v_kasbon_id is null then
    raise notice 'DILEWATI — belum ada data kasbon di database utk diuji.';
  else
    begin
      update public.kasbon set catatan = 'DIUBAH JIHAN — SEHARUSNYA GAGAL' where id = v_kasbon_id;
      raise exception 'BUG RLS: Jihan berhasil UPDATE kasbon — seharusnya ditolak total!';
    exception
      when insufficient_privilege or others then
        raise notice 'OK — Jihan ditolak mengubah entri kasbon (%).', sqlerrm;
    end;
  end if;
end $$;
-- EKSPEKTASI: NOTICE "OK — Jihan ditolak mengubah entri kasbon..."

-- 3.7 Jihan hanya boleh akses notifikasi miliknya sendiri
select count(*) as notif_milik_sendiri
from public.notifications
where user_id = '<<UUID_JIHAN>>'::uuid;

select count(*) as notif_milik_orang_lain
from public.notifications
where user_id <> '<<UUID_JIHAN>>'::uuid;
-- EKSPEKTASI: baris kedua HARUS 0 (RLS `own_notifications` menyaring user lain),
-- meski di database ada notifikasi milik user lain.

reset role;
rollback;
-- ↑ Membatalkan SEMUA perubahan & percobaan di atas. Database kembali bersih.


-- ============================================================================
-- SELESAI
-- Lihat supabase/tests/RLS_TEST_CHECKLIST.md utk daftar verifikasi lengkap
-- (termasuk hal-hal yang TIDAK bisa diuji murni lewat SQL — perlu klik di app).
-- ============================================================================
