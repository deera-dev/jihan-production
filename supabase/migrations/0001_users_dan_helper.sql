-- ============================================================================
-- 0001 — Extensions, public.users, helper functions role-check
-- ============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- public.users — ekstensi profil dari auth.users
-- ----------------------------------------------------------------------------
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null check (role in ('deera', 'jihan')),
  nama_lengkap text,
  created_at   timestamptz not null default now()
);

comment on table public.users is 'Ekstensi profil user. role menentukan hak akses (deera = full CRUD, jihan = read-only + approve/tolak).';

-- Saat user baru dibuat di auth.users (mis. via invitation flow), buat row profil.
-- role & nama_lengkap diambil dari raw_user_meta_data yang dikirim saat signup/invite.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, role, nama_lengkap)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'jihan'),
    new.raw_user_meta_data ->> 'nama_lengkap'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Helper functions — dipakai di seluruh RLS policy utk cek role pemanggil
-- ----------------------------------------------------------------------------
create function public.is_deera()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'deera'
  );
$$;

create function public.is_jihan()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'jihan'
  );
$$;

comment on function public.is_deera() is 'True jika user yang sedang login berperan sebagai Tim Deera.';
comment on function public.is_jihan() is 'True jika user yang sedang login berperan sebagai Tim Jihan.';

-- ----------------------------------------------------------------------------
-- Generic trigger: auto-update kolom updated_at
-- ----------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is 'Trigger generik: isi kolom updated_at dengan waktu sekarang setiap kali row di-UPDATE.';

-- ----------------------------------------------------------------------------
-- RLS dasar utk public.users
-- ----------------------------------------------------------------------------
alter table public.users enable row level security;

create policy "users_select_all_authenticated"
  on public.users for select
  using (auth.uid() is not null);

create policy "users_update_own_profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.users where id = auth.uid()));
  -- role tidak boleh diubah sendiri oleh user — hanya nama_lengkap dkk
