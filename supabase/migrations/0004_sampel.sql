-- ============================================================================
-- 0004 — Sampel & catatan sampel
-- ============================================================================

create table public.sampel (
  id                uuid primary key default gen_random_uuid(),
  kode_id           uuid not null references public.kode(id) on delete cascade,
  foto_depan_url    text not null,    -- Cloudinary URL
  foto_belakang_url text not null,    -- Cloudinary URL
  status            text not null default 'aktif' check (status in ('aktif', 'ditolak')),
  alasan_ditolak    text,             -- uppercase
  versi             integer not null default 1,
  created_by        uuid references public.users(id),
  created_at        timestamptz not null default now()
);

create index idx_sampel_kode_id on public.sampel (kode_id);

comment on table public.sampel is 'Histori sampel per kode, termasuk yang ditolak — JANGAN PERNAH dihapus, hanya ubah status menjadi ditolak.';

create table public.sampel_catatan (
  id          uuid primary key default gen_random_uuid(),
  sampel_id   uuid not null references public.sampel(id) on delete cascade,
  user_id     uuid references public.users(id),
  isi         text not null,    -- uppercase
  created_at  timestamptz not null default now()
);

create index idx_sampel_catatan_sampel_id on public.sampel_catatan (sampel_id);
