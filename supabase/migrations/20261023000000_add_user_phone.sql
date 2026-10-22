-- Add phone numbers without invalidating existing users.
alter table public.users
  add column if not exists phone text;
