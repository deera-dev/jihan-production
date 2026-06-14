-- ============================================================================
-- 0008 — Pengiriman (bisa parsial/bertahap, perlu approval Jihan)
-- ============================================================================

create table public.pengiriman (
  id              uuid primary key default gen_random_uuid(),
  kode_id         uuid not null references public.kode(id) on delete cascade,
  tanggal         date,
  catatan         text,                  -- uppercase
  status_approval text not null default 'menunggu' check (status_approval in ('menunggu', 'disetujui', 'ditolak')),
  approved_by     uuid references public.users(id),
  approved_at     timestamptz,
  created_by      uuid references public.users(id),
  created_at      timestamptz not null default now()
);

create index idx_pengiriman_kode_id on public.pengiriman (kode_id);
create index idx_pengiriman_status on public.pengiriman (status_approval);

comment on table public.pengiriman is
  'Kode berstatus selesai setelah SELURUH jumlahAkhirDikirim (semua warna, dikurangi waste) sudah terkirim & disetujui.';

create table public.pengiriman_item (
  id             uuid primary key default gen_random_uuid(),
  pengiriman_id  uuid not null references public.pengiriman(id) on delete cascade,
  nama_warna     text not null,    -- uppercase
  jumlah_pcs     integer not null
);

create index idx_pengiriman_item_pengiriman_id on public.pengiriman_item (pengiriman_id);
