-- ============================================================================
-- 0009 — Kasbon: ledger tunggal saldo global Deera ↔ Jihan
-- ============================================================================
-- Pengecualian terbatas terhadap aturan "jangan catat pembayaran" (lihat
-- CLAUDE.md bagian "Kasbon"): sistem hanya mencatat NOMINAL & SALDO BERJALAN,
-- bukan modul pembayaran penuh. Negosiasi & transfer dana selalu di luar sistem.
-- ============================================================================

create table public.kasbon (
  id          uuid primary key default gen_random_uuid(),
  tanggal     date not null,
  tipe        text not null check (tipe in ('masuk', 'potongan_otomatis')),
  nominal     numeric not null check (nominal > 0),  -- selalu positif; tanda ditentukan oleh `tipe` saat hitung saldo
  kode_id     uuid references public.kode(id),       -- diisi otomatis utk potongan_otomatis, NULL utk masuk
  catatan     text,                                  -- uppercase; manual utk masuk, auto-generated utk potongan_otomatis
  created_by  uuid references public.users(id),      -- NULL utk entri otomatis (sistem)
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz,                           -- soft delete — hanya berlaku utk entri 'masuk'

  -- Entri potongan_otomatis WAJIB terhubung ke kode & TIDAK punya created_by (murni sistem)
  check (
    (tipe = 'masuk' and kode_id is null) or
    (tipe = 'potongan_otomatis' and kode_id is not null and created_by is null)
  )
);

create index idx_kasbon_tanggal on public.kasbon (tanggal);
create index idx_kasbon_tipe on public.kasbon (tipe);
create index idx_kasbon_kode_id on public.kasbon (kode_id);
create index idx_kasbon_deleted_at on public.kasbon (deleted_at);

comment on table public.kasbon is
  'Ledger tunggal, saldo GLOBAL lintas semua produksi & kode — bukan entitas anak dari kode. '
  'Relasi ke kode_id pada entri potongan_otomatis hanya REFERENSI sumber potongan, bukan kepemilikan.';

comment on column public.kasbon.nominal is
  'Selalu disimpan positif. saldoKasbon = Σ(nominal entri masuk) − Σ(nominal entri potongan_otomatis).';

-- ----------------------------------------------------------------------------
-- Hard rule: entri potongan_otomatis tidak boleh diubah/dihapus oleh siapapun
-- (termasuk Deera) — murni milik sistem. Diberlakukan di level DB, bukan
-- hanya di RLS, agar konsisten walau lewat jalur mana pun.
-- ----------------------------------------------------------------------------
create function public.guard_kasbon_potongan_otomatis()
returns trigger
language plpgsql
as $$
begin
  if old.tipe = 'potongan_otomatis' then
    raise exception 'Entri kasbon tipe potongan_otomatis tidak dapat diubah atau dihapus — milik sistem.';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger trg_guard_kasbon_update
  before update on public.kasbon
  for each row execute function public.guard_kasbon_potongan_otomatis();

create trigger trg_guard_kasbon_delete
  before delete on public.kasbon
  for each row execute function public.guard_kasbon_potongan_otomatis();

-- ----------------------------------------------------------------------------
-- Fungsi: hitung saldo kasbon berjalan (tidak disimpan sbg kolom terpisah)
-- ----------------------------------------------------------------------------
create function public.hitung_saldo_kasbon()
returns numeric
language sql
stable
set search_path = public
as $$
  select coalesce(sum(
    case when tipe = 'masuk' then nominal else -nominal end
  ), 0)
  from public.kasbon
  where deleted_at is null;
$$;

comment on function public.hitung_saldo_kasbon() is 'saldoKasbon = Σ(nominal entri masuk) − Σ(nominal entri potongan_otomatis), entri ter-soft-delete diabaikan.';

-- ----------------------------------------------------------------------------
-- View: histori kasbon dengan saldo berjalan per entri (utk ledger UI)
-- ----------------------------------------------------------------------------
create view public.kasbon_dengan_saldo_berjalan as
select
  k.*,
  sum(case when k.tipe = 'masuk' then k.nominal else -k.nominal end)
    over (order by k.created_at, k.id rows between unbounded preceding and current row) as saldo_berjalan
from public.kasbon k
where k.deleted_at is null
order by k.created_at, k.id;

comment on view public.kasbon_dengan_saldo_berjalan is
  'Ledger gabungan masuk + potongan_otomatis berurutan waktu, masing-masing menampilkan saldo berjalan setelah entri tsb.';
