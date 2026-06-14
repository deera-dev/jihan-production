-- ============================================================================
-- 0014 — Role "master": user yang bisa melihat data sebagai Deera maupun Jihan
--
-- Perubahan:
--   1. Tambah 'master' ke CHECK constraint role di public.users
--   2. Tambah helper function is_master()
--   3. Update is_deera() agar master juga dapat akses penuh RLS (seperti Deera)
--      — master dapat full CRUD via deera_full_* policies yang sudah ada,
--        tanpa perlu menambah policy baru per tabel
-- ============================================================================

-- 1) Ubah constraint role agar menerima 'master'
alter table public.users
  drop constraint if exists users_role_check;

alter table public.users
  add constraint users_role_check
  check (role in ('deera', 'jihan', 'master'));

-- 2) Helper function is_master()
create or replace function public.is_master()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'master'
  )
$$;

-- 3) Update is_deera() agar master ikut mendapat akses penuh
--    (semua policy deera_full_* otomatis berlaku untuk master)
create or replace function public.is_deera()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role in ('deera', 'master')
  )
$$;

-- Catatan: is_jihan() TIDAK diubah — master tidak otomatis bertindak sebagai
-- Jihan di level DB. Simulasi "tampilan sebagai Jihan" ditangani sepenuhnya
-- di layer UI (useAuthStore.viewAsRole). Data yang ditulis master tetap
-- menggunakan kredensial master (user_id asli), bukan user_id Jihan.
