create table plan_prices (
  plan text primary key check (plan in ('avulso', 'acompanhamento-3m', 'acompanhamento-6m')),
  price_cents integer not null check (price_cents > 0),
  updated_at timestamptz not null default now()
);

insert into plan_prices (plan, price_cents)
values
  ('avulso', 29900),
  ('acompanhamento-3m', 59900),
  ('acompanhamento-6m', 99900);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code)),
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value integer not null check (
    (discount_type = 'percentage' and discount_value between 1 and 99)
    or (discount_type = 'fixed' and discount_value > 0)
  ),
  plan text check (plan in ('avulso', 'acompanhamento-3m', 'acompanhamento-6m')),
  expires_at timestamptz,
  max_uses integer check (max_uses is null or max_uses > 0),
  reserved_uses integer not null default 0 check (reserved_uses >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index coupons_active_code_idx on coupons (code) where active;
