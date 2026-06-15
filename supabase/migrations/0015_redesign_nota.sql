-- ============================================================================
-- 0015 — Redesign nota pembelian
--
-- 1. Tambah kolom baru ke nota_pembelian
-- 2. Buat tabel nota_kode
-- 3. Perbarui RLS nota_pembelian dengan status guard:
--      - Deera biasa: hanya boleh ubah/hapus nota draft & ditolak
--      - Master     : boleh ubah/hapus nota apapun (termasuk approved)
--      - Jihan      : boleh UPDATE nota review -> approved/ditolak
-- ============================================================================

-- 1. Kolom baru di nota_pembelian
-- ============================================================================
alter table public.nota_pembelian
  add column if not exists produksi_id     uuid references public.produksi(id),
  add column if not exists aksesoris       jsonb not null default '[]',
  add column if not exists biaya_produksi  jsonb not null default '{}',
  add column if not exists biaya_jual_beli integer not null default 0,
  add column if not exists status          text not null default 'draft',
  add column if not exists alasan_tolak    text,
  add column if not exists submitted_at    timestamptz,
  add column if not exists approved_at     timestamptz,
  add column if not exists deleted_at      timestamptz;

-- CHECK constraint status (skip jika sudah ada)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'nota_pembelian_status_check'
      and conrelid = 'public.nota_pembelian'::regclass
  ) then
    alter table public.nota_pembelian
      add constraint nota_pembelian_status_check
      check (status in ('draft', 'review', 'approved', 'ditolak'));
  end if;
end $$;

create index if not exists idx_nota_pembelian_produksi_id
  on public.nota_pembelian (produksi_id);


-- 2. nota_kode — junction: 1 nota mencakup beberapa kode
-- ============================================================================
create table if not exists public.nota_kode (
  id      uuid primary key default gen_random_uuid(),
  nota_id uuid not null references public.nota_pembelian(id) on delete cascade,
  kode_id uuid not null references public.kode(id),
  unique (nota_id, kode_id)
);

create index if not exists idx_nota_kode_nota_id on public.nota_kode (nota_id);
create index if not exists idx_nota_kode_kode_id on public.nota_kode (kode_id);

alter table public.nota_kode enable row level security;

drop policy if exists "deera_full_nota_kode"   on public.nota_kode;
drop policy if exists "jihan_read_nota_kode"   on public.nota_kode;

create policy "deera_full_nota_kode"
  on public.nota_kode for all
  using (public.is_deera()) with check (public.is_deera());

create policy "jihan_read_nota_kode"
  on public.nota_kode for select
  using (public.is_jihan());


-- 3. RLS nota_pembelian — ganti blanket policy dengan status guard
-- ============================================================================
drop policy if exists "deera_full_nota_pembelian"   on public.nota_pembelian;
drop policy if exists "deera_select_nota_pembelian" on public.nota_pembelian;
drop policy if exists "deera_insert_nota_pembelian" on public.nota_pembelian;
drop policy if exists "deera_update_nota_pembelian" on public.nota_pembelian;
drop policy if exists "deera_delete_nota_pembelian" on public.nota_pembelian;
drop policy if exists "jihan_update_nota_status"    on public.nota_pembelian;

-- SELECT: bebas baca semua (termasuk deleted, untuk audit)
create policy "deera_select_nota_pembelian"
  on public.nota_pembelian for select
  using (public.is_deera());

-- INSERT: selalu boleh
create policy "deera_insert_nota_pembelian"
  on public.nota_pembelian for insert
  with check (public.is_deera());

-- UPDATE:
--   - Master       : boleh ubah nota apapun (termasuk approved)
--   - Deera biasa  : hanya draft & ditolak
create policy "deera_update_nota_pembelian"
  on public.nota_pembelian for update
  using (
    public.is_deera()
    and (
      public.is_master()
      or status in ('draft', 'ditolak')
    )
  )
  with check (public.is_deera());

-- DELETE (termasuk soft-delete via UPDATE deleted_at):
--   - Master       : boleh hapus nota apapun
--   - Deera biasa  : hanya draft & ditolak
create policy "deera_delete_nota_pembelian"
  on public.nota_pembelian for delete
  using (
    public.is_deera()
    and (
      public.is_master()
      or status in ('draft', 'ditolak')
    )
  );

-- Jihan: approve / tolak nota (review -> approved / ditolak)
create policy "jihan_update_nota_status"
  on public.nota_pembelian for update
  using (public.is_jihan() and status = 'review')
  with check (public.is_jihan());
