-- ============================================================
-- Lakonos — initial schema
-- Table: public.leads  (captures demo requests from the website)
-- ============================================================

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text        not null,
  email       text        not null,
  company     text,
  message     text,
  source      text        not null default 'website',
  handled     boolean     not null default false   -- flip to true once you've followed up
);

-- index for sorting the newest leads first in your dashboard
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- ------------------------------------------------------------
-- Row Level Security
-- RLS is ON and there are NO public policies, so the anon/public
-- key cannot read or write. The /api/lead route uses the SERVICE
-- ROLE key, which bypasses RLS — meaning inserts only happen
-- server-side. This prevents spam/abuse from the browser.
-- ------------------------------------------------------------
alter table public.leads enable row level security;
