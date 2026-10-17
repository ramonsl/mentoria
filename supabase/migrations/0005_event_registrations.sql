create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,
  name text not null,
  email text not null,
  whatsapp text not null,
  created_at timestamptz not null default now(),
  constraint event_registrations_event_email_key unique (event_slug, email)
);

create index if not exists event_registrations_event_created_idx
  on event_registrations (event_slug, created_at);
