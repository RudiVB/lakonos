-- Lakonos internal platform — Phase 1 (staff auth + roles)

alter table if exists public.leads rename to lakonos_leads;

create table if not exists public.lakonos_staff (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text,
  role        text not null default 'support' check (role in ('owner','admin','support','viewer')),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.lakonos_staff enable row level security;
