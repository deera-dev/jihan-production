-- ============================================================================
-- 0005 — HPP (per kode, frozen setelah approved), revisi, & template global
-- ============================================================================

create table public.hpp (
  id        uuid primary key default gen_random_uuid(),
  kode_id   uuid unique references public.kode(id),

  -- HPP Jasa: sama untuk semua kode dalam 1 produksi.
  -- Disimpan per kode sebagai snapshot, mis:
  -- [{"nama":"UPAH PRODUKSI","nilai":40000},{"nama":"OVERHEAD","nilai":20000}]
  jasa_komponen            jsonb,

  -- Snapshot bahan — dihitung & disimpan saat HPP disubmit, tidak berubah lagi
  snapshot_bahan_primer    jsonb,  -- {totalYardTerpakai, hargaPerYard, nilaiPerPcs}
  snapshot_bahan_sekunder  jsonb,  -- [{jenisBahan, konsumsiYard, hargaPerYard, nilaiPerPcs}]
  snapshot_bahan_baku      jsonb,  -- [{nama, tipe, nilaiPerPcs}]

  -- Totals (calculated, disimpan utk tampilan)
  total_hpp_jasa     integer,
  total_nilai_bahan  integer,
  total_bahan_baku   integer,
  total_hpp_per_baju integer,

  status        text not null default 'draft' check (status in ('draft', 'review', 'approved', 'ditolak')),
  alasan_tolak  text,
  submitted_at  timestamptz,
  approved_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_hpp_updated_at
  before update on public.hpp
  for each row execute function public.set_updated_at();

create index idx_hpp_kode_id on public.hpp (kode_id);
create index idx_hpp_status on public.hpp (status);

comment on table public.hpp is 'HPP per kode. Setelah status = approved, nilai FROZEN — nota baru tidak boleh mengubahnya.';

-- ----------------------------------------------------------------------------
-- public.hpp_revisi — histori nilai lama vs baru, terlihat Deera & Jihan
-- ----------------------------------------------------------------------------
create table public.hpp_revisi (
  id          uuid primary key default gen_random_uuid(),
  hpp_id      uuid not null references public.hpp(id) on delete cascade,
  komponen    text not null,   -- nama field/komponen yang berubah, mis. "UPAH PRODUKSI", "TOTAL HPP/PCS"
  nilai_lama  jsonb,
  nilai_baru  jsonb,
  alasan      text,            -- uppercase, biasanya alasan tolak dari Jihan
  changed_by  uuid references public.users(id),
  created_at  timestamptz not null default now()
);

create index idx_hpp_revisi_hpp_id on public.hpp_revisi (hpp_id);

-- ----------------------------------------------------------------------------
-- public.hpp_template_komponen — template global HPP Jasa (range min-max)
-- ----------------------------------------------------------------------------
create table public.hpp_template_komponen (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null,    -- UPAH PRODUKSI, OVERHEAD, STAFF (uppercase)
  nilai_min   integer not null,
  nilai_max   integer not null,
  urutan      integer not null default 1,
  is_default  boolean not null default true,  -- false = custom komponen tambahan per produksi
  updated_by  uuid references public.users(id),
  updated_at  timestamptz not null default now(),

  check (nilai_max >= nilai_min)
);

create trigger trg_hpp_template_komponen_updated_at
  before update on public.hpp_template_komponen
  for each row execute function public.set_updated_at();
