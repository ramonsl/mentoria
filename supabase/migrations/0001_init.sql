-- Enrollments and webhook events schema.
-- See .specs/features/landing-mentoria/design.md ("Data Models") for the
-- authoritative shape of these tables.

create extension if not exists pgcrypto;

create table enrollments (
  id uuid primary key default gen_random_uuid(),
  asaas_checkout_id text not null,
  plan text not null check (plan in ('primeira-vaga', 'proximo-nivel')),
  status text not null check (status in ('pendente', 'paga', 'ativa', 'expirada', 'cancelada')),
  customer_name text not null,
  customer_email text not null,
  amount_cents integer not null,
  paid_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index enrollments_expires_at_idx on enrollments (expires_at);

create table webhook_events (
  id text primary key,
  event_type text not null,
  checkout_id text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now(),
  result text not null check (result in ('success', 'error')),
  error_message text
);
