-- ============================================================================
-- 0010 — Notifikasi & preferensi notifikasi (real-time vs digest harian)
-- ============================================================================

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  judul       text not null,
  isi         text not null,
  entity_type text check (entity_type in ('kode', 'sampel', 'hpp', 'tracking', 'nota', 'pengiriman', 'kasbon')),
  entity_id   uuid,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index idx_notifications_user_id on public.notifications (user_id);
create index idx_notifications_is_read on public.notifications (user_id, is_read);

create table public.notification_preferences (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references public.users(id) on delete cascade,
  mode        text not null default 'realtime' check (mode in ('realtime', 'digest_harian')),
  jam_digest  time not null default '08:00',
  updated_at  timestamptz not null default now()
);

create trigger trg_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();

comment on table public.notification_preferences is 'Khusus Tim Jihan: pilih mode notifikasi real-time atau digest harian (lihat Edge Function notif-digest).';
