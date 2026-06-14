-- ============================================================================
-- 0002 — Produksi, Surat Jalan, Bahan (Primer & Sekunder)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- public.produksi
-- ----------------------------------------------------------------------------
create table public.produksi (
  id          uuid primary key default gen_random_uuid(),
  kode_bahan  text not null,        -- 3 huruf uppercase: IMA, KAT, RAY
  tanggal     date not null,
  catatan     text,                 -- uppercase
  created_by  uuid references public.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz           -- soft delete
);

create trigger trg_produksi_updated_at
  before update on public.produksi
  for each row execute function public.set_updated_at();

create index idx_produksi_deleted_at on public.produksi (deleted_at);

-- ----------------------------------------------------------------------------
-- public.surat_jalan — penerimaan bahan dari Jihan, input Deera
-- ----------------------------------------------------------------------------
create table public.surat_jalan (
  id                uuid primary key default gen_random_uuid(),
  produksi_id       uuid not null references public.produksi(id) on delete cascade,
  nomor_surat_jalan text,           -- uppercase
  tanggal_terima    date not null,
  pengirim          text,           -- uppercase (nama/tim Jihan)
  catatan           text,           -- uppercase
  created_by        uuid references public.users(id),
  created_at        timestamptz not null default now()
);

create index idx_surat_jalan_produksi_id on public.surat_jalan (produksi_id);

-- ----------------------------------------------------------------------------
-- public.produksi_bahan — bahan dari Jihan, level produksi (bisa >1 per produksi)
-- ----------------------------------------------------------------------------
create table public.produksi_bahan (
  id                uuid primary key default gen_random_uuid(),
  produksi_id       uuid not null references public.produksi(id) on delete cascade,
  surat_jalan_id    uuid references public.surat_jalan(id),
  jenis_bahan       text not null,     -- uppercase: MOTIF IMA, POLOS, PURING
  tipe_bahan        text not null check (tipe_bahan in ('primer', 'sekunder')),
  satuan            text not null check (satuan in ('yard', 'panel')),
  harga_per_satuan  integer not null,
  jumlah_dibeli     numeric(10,2),     -- total yard/panel diterima dari Jihan — dasar hitung sisa bahan
  -- Khusus sekunder: konsumsi per pcs dari pola (diisi saat input HPP)
  konsumsi_per_pcs  numeric(8,3),      -- dalam satuan asli (meter/cm/panel), dikonversi saat hitung
  satuan_konsumsi   text check (satuan_konsumsi in ('meter', 'cm', 'yard', 'panel')),
  -- sisaYard (calculated, tidak disimpan) = jumlah_dibeli − (konsumsi_per_pcs dlm yard × total_pcs_produksi)
  urutan            integer not null default 1,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger trg_produksi_bahan_updated_at
  before update on public.produksi_bahan
  for each row execute function public.set_updated_at();

create index idx_produksi_bahan_produksi_id on public.produksi_bahan (produksi_id);

comment on column public.produksi_bahan.konsumsi_per_pcs is 'Hanya relevan utk tipe_bahan = sekunder. Diinput saat HPP, mis. 3.35m per 2 baju → 1.675m/pcs.';

-- ----------------------------------------------------------------------------
-- public.produksi_bahan_warna — per warna, khusus bahan PRIMER
-- ----------------------------------------------------------------------------
create table public.produksi_bahan_warna (
  id                  uuid primary key default gen_random_uuid(),
  produksi_bahan_id   uuid not null references public.produksi_bahan(id) on delete cascade,
  nama_warna          text not null,    -- uppercase: NAVY, HITAM, HIJAU
  yard_tersedia       numeric(10,2),    -- dari Jihan (surat jalan)
  yard_terpakai       numeric(10,2),    -- actual dari buku potong
  urutan              integer not null default 1,
  created_at          timestamptz not null default now()
);

create index idx_produksi_bahan_warna_bahan_id on public.produksi_bahan_warna (produksi_bahan_id);

comment on table public.produksi_bahan_warna is 'Tracking buku potong per warna untuk bahan primer. Pcs per warna = floor(yard_tersedia / konsumsi_per_pcs), aktual dari buku potong.';
