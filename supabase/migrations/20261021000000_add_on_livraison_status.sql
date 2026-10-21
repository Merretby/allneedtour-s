-- Allow the new "on_livraison" order status.
-- Existing rows are unaffected; only the allowed value set changes.
--
-- Apply with either:
--   * Supabase Dashboard -> SQL Editor -> paste and run this file, or
--   * supabase db push (if the project is linked)

do $$
declare
  constraint_name text;
begin
  -- Drop any existing CHECK constraint that guards the status column,
  -- regardless of how it was named.
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.orders drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.orders
  add constraint orders_status_check
  check (
    status in (
      'pending',
      'confirmed',
      'shipped',
      'on_livraison',
      'delivered',
      'cancelled'
    )
  );
