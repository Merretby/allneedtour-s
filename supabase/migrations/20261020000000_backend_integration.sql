-- Backend integration schema
-- Aligns the database with the Fastify API repositories.
-- Safe to run on a fresh project; recreates the demo cart_items table.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Custom auth users (separate from auth.users; backend issues its own JWTs)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  password_hash text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2),
  stock integer not null default 0 check (stock >= 0),
  category text not null default 'Divers',
  brand text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Cart (recreated to match backend inserts)
-- ---------------------------------------------------------------------------
drop table if exists public.cart_items cascade;

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Favorites
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at before update on public.cart_items
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at before update on public.orders
for each row execute function public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_name on public.products(name);
create index if not exists idx_cart_items_user on public.cart_items(user_id);
create index if not exists idx_favorites_user on public.favorites(user_id);
create index if not exists idx_orders_user_created on public.orders(user_id, created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- ---------------------------------------------------------------------------
-- RLS: backend uses the service role (bypasses RLS). No anon policies on purpose.
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.favorites enable row level security;

-- ---------------------------------------------------------------------------
-- Seed products (idempotent)
-- ---------------------------------------------------------------------------
insert into public.products
  (id, name, description, price, compare_at_price, stock, category, brand, image_url)
values
  ('11111111-1111-1111-1111-111111111111',
   'Sérum Visage Vitamine C - Éclat & Anti-âge',
   'Un sérum concentré en vitamine C pour illuminer et raffermir la peau.',
   299.00, 399.00, 50, 'Skincare', 'The Ordinary', '/products/product-serum.jpg'),
  ('22222222-2222-2222-2222-222222222222',
   'Palette Nude Rose Gold - 12 Teintes',
   'Une palette d''ombres à paupières aux tons roses et dorés.',
   249.00, null, 40, 'Maquillage', 'Huda Beauty', '/products/product-palette.jpg'),
  ('33333333-3333-3333-3333-333333333333',
   'Eau de Parfum Rose Élégance 50ml',
   'Un parfum floral et élégant aux notes de rose et de jasmin.',
   349.00, 449.00, 30, 'Parfums', 'Dior', '/products/product-perfume.jpg'),
  ('44444444-4444-4444-4444-444444444444',
   'Crème Hydratante Jour & Nuit',
   'Une crème riche en actifs hydratants pour une peau douce et nourrie.',
   199.00, null, 60, 'Skincare', 'Lancôme', '/products/product-cream.jpg'),
  ('55555555-5555-5555-5555-555555555555',
   'Rouge à Lèvres Mat Longue Tenue',
   'Un rouge à lèvres mat qui tient toute la journée sans dessécher.',
   129.00, null, 80, 'Maquillage', 'YSL', '/products/product-lipstick.jpg'),
  ('66666666-6666-6666-6666-666666666666',
   'Masque Tissu K-Beauty - Lot de 5',
   'Pack de masques en tissu coréens pour une peau éclatante et hydratée.',
   149.00, 199.00, 70, 'K-Beauty', 'COSRX', '/products/product-mask.jpg')
on conflict (id) do nothing;
