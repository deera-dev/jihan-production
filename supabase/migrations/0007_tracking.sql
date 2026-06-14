-- ============================================================================
-- 0007 — Tracking produksi per tahap (per ukuran, per warna) & reject
-- ============================================================================

create table public.tracking_produksi (
  id                    uuid primary key default gen_random_uuid(),
  kode_ukuran_warna_id  uuid not null references public.kode_ukuran_warna(id) on delete cascade,
  tahap                 text not null check (tahap in ('dipotong', 'dijahit', 'finishing', 'siap_kirim')),
  pcs_done              integer not null default 0,
  updated_by            uuid references public.users(id),
  updated_at            timestamptz not null default now(),

  unique (kode_ukuran_warna_id, tahap)
);

create trigger trg_tracking_produksi_updated_at
  before update on public.tracking_produksi
  for each row execute function public.set_updated_at();

create index idx_tracking_produksi_kuw_id on public.tracking_produksi (kode_ukuran_warna_id);

comment on table public.tracking_produksi is
  'Row dibuat otomatis (4 baris per kode_ukuran_warna, 1 per tahap) saat status kode → produksi. 1 tukang jahit = 1 warna, sehingga tracking dijahit tetap per warna.';

create table public.tracking_reject (
  id                    uuid primary key default gen_random_uuid(),
  tracking_produksi_id  uuid not null references public.tracking_produksi(id),
  pcs_reject            integer not null,
  alasan                text not null,    -- uppercase
  nasib                 text not null check (nasib in ('dipermak', 'produksi_ulang', 'waste')),
  bahan_tersedia        boolean,          -- relevan jika nasib = produksi_ulang
                                          -- jika FALSE → flag "perlu bahan tambahan" + notifikasi Deera & Jihan
  catatan               text,             -- uppercase
  created_by            uuid references public.users(id),
  created_at            timestamptz not null default now()
);

create index idx_tracking_reject_tracking_id on public.tracking_reject (tracking_produksi_id);

comment on column public.tracking_reject.bahan_tersedia is
  'Wajib diisi jika nasib = produksi_ulang. FALSE memicu flag "perlu bahan tambahan" (lihat trigger notifikasi di 0013).';
