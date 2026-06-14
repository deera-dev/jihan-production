-- ============================================================================
-- 0011 — Activity log (Deera only) & push subscriptions
-- ============================================================================

create table public.activity_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.users(id),
  aksi         text not null,    -- INPUT_BUKU_POTONG, APPROVE_HPP, SOFT_DELETE, dll
  entity_type  text,             -- produksi | kode | sampel | hpp | nota | tracking
  entity_id    uuid,
  deskripsi    text not null,    -- kalimat human-readable (uppercase)
  data_before  jsonb,
  data_after   jsonb,
  created_at   timestamptz not null default now()
);

create index idx_activity_log_entity on public.activity_log (entity_type, entity_id);
create index idx_activity_log_created_at on public.activity_log (created_at desc);

comment on table public.activity_log is 'HANYA terlihat oleh Tim Deera — jangan pernah ditampilkan ke Tim Jihan (lihat CLAUDE.md Hard Rules).';

create table public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now(),

  unique (user_id, endpoint)
);

create index idx_push_subscriptions_user_id on public.push_subscriptions (user_id);
