-- Black Friday campaign
-- One reusable campaign row + a list of participating products with a custom price.
-- Safe to run on an existing database.

-- ---------------------------------------------------------------------------
-- Campaigns
-- ---------------------------------------------------------------------------
create table if not exists public.campaigns (
  key text primary key,
  label text not null,
  is_active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.campaigns (key, label, is_active, starts_at, ends_at)
values ('black_friday', 'Black Friday', false, null, null)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Campaign products (custom price per product)
-- ---------------------------------------------------------------------------
create table if not exists public.campaign_products (
  campaign_key text not null references public.campaigns(key) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  promo_price numeric(10, 2) not null check (promo_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (campaign_key, product_id)
);

create index if not exists idx_campaign_products_campaign
  on public.campaign_products(campaign_key);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
drop trigger if exists trg_campaigns_updated_at on public.campaigns;
create trigger trg_campaigns_updated_at before update on public.campaigns
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_campaign_products_updated_at on public.campaign_products;
create trigger trg_campaign_products_updated_at before update on public.campaign_products
for each row execute function public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- RLS: backend uses the service role (bypasses RLS).
-- ---------------------------------------------------------------------------
alter table public.campaigns enable row level security;
alter table public.campaign_products enable row level security;
