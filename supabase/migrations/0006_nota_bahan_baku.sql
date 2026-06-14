-- ============================================================================
-- 0006 — Katalog bahan baku, nota pembelian, & alokasi lintas-kode
-- ============================================================================

create table public.katalog_bahan_baku (
  id             uuid primary key default gen_random_uuid(),
  nama           text not null,    -- uppercase: RESLETING, BENANG JAHIT, KANCING
  tipe           text not null check (tipe in ('unit', 'usage')),
  satuan         text,             -- uppercase: PCS, ROL, METER
  harga_terkini  integer,          -- update otomatis dari nota terbaru (lihat trigger di 0013)
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger trg_katalog_bahan_baku_updated_at
  before update on public.katalog_bahan_baku
  for each row execute function public.set_updated_at();

create table public.nota_pembelian (
  id          uuid primary key default gen_random_uuid(),
  tanggal     date not null,        -- biasanya Sabtu (hari gajian)
  catatan     text,                 -- uppercase
  total_nilai integer,              -- sum dari semua nota_item
  created_by  uuid references public.users(id),
  created_at  timestamptz not null default now()
);

create table public.nota_item (
  id           uuid primary key default gen_random_uuid(),
  nota_id      uuid not null references public.nota_pembelian(id) on delete cascade,
  katalog_id   uuid references public.katalog_bahan_baku(id),
  nama_custom  text,             -- jika tidak ada di katalog (uppercase)
  tipe         text not null check (tipe in ('unit', 'usage')),
  qty          numeric(10,2),    -- unit-based: jumlah pcs/roll/dll
  harga_satuan integer,          -- unit-based: harga per satuan
  total_nilai  integer not null, -- usage-based: total nilai pembelian
  created_at   timestamptz not null default now(),

  check (
    (tipe = 'unit'  and qty is not null and harga_satuan is not null) or
    (tipe = 'usage' and total_nilai is not null)
  )
);

create index idx_nota_item_nota_id on public.nota_item (nota_id);
create index idx_nota_item_katalog_id on public.nota_item (katalog_id);

-- Many-to-many: 1 item nota bisa untuk beberapa kode (alokasi proporsional —
-- lihat formula di CLAUDE.md bagian "Bahan Baku dari Nota")
create table public.nota_item_kode (
  id            uuid primary key default gen_random_uuid(),
  nota_item_id  uuid not null references public.nota_item(id) on delete cascade,
  kode_id       uuid not null references public.kode(id),

  unique (nota_item_id, kode_id)
);

create index idx_nota_item_kode_item_id on public.nota_item_kode (nota_item_id);
create index idx_nota_item_kode_kode_id on public.nota_item_kode (kode_id);
