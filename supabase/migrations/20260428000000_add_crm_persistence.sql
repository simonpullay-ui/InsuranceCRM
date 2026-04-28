create extension if not exists "pgcrypto";

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  branch_id uuid,
  lead_name text not null,
  first_name text,
  last_name text,
  full_name text,
  phone text,
  email text,
  date_of_birth text,
  lead_type text,
  state text,
  address text,
  age text,
  gender text,
  marital_status text,
  pipeline_id text not null,
  stage_id text not null,
  status text not null default 'active',
  notes jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  last_outcome text,
  last_contacted_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  branch_id uuid,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  activity_type text not null,
  outcome text,
  summary text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.crm_scripts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  branch_id uuid,
  name text not null,
  script_type text,
  body text not null,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.crm_leads enable row level security;
alter table public.crm_activities enable row level security;
alter table public.crm_scripts enable row level security;

drop policy if exists "Authenticated users can read crm_leads" on public.crm_leads;
create policy "Authenticated users can read crm_leads"
on public.crm_leads
for select
to authenticated
using (account_id = (select (auth.uid())::uuid));

drop policy if exists "Authenticated users can insert crm_leads" on public.crm_leads;
create policy "Authenticated users can insert crm_leads"
on public.crm_leads
for insert
to authenticated
with check (account_id = (select (auth.uid())::uuid));

drop policy if exists "Authenticated users can update crm_leads" on public.crm_leads;
create policy "Authenticated users can update crm_leads"
on public.crm_leads
for update
to authenticated
using (account_id = (select (auth.uid())::uuid))
with check (account_id = (select (auth.uid())::uuid));

drop policy if exists "Authenticated users can delete crm_leads" on public.crm_leads;
create policy "Authenticated users can delete crm_leads"
on public.crm_leads
for delete
to authenticated
using (account_id = (select (auth.uid())::uuid));

drop policy if exists "Authenticated users can read crm_activities" on public.crm_activities;
create policy "Authenticated users can read crm_activities"
on public.crm_activities
for select
to authenticated
using (account_id = (select (auth.uid())::uuid));

drop policy if exists "Authenticated users can insert crm_activities" on public.crm_activities;
create policy "Authenticated users can insert crm_activities"
on public.crm_activities
for insert
to authenticated
with check (account_id = (select (auth.uid())::uuid));

drop policy if exists "Authenticated users can read crm_scripts" on public.crm_scripts;
create policy "Authenticated users can read crm_scripts"
on public.crm_scripts
for select
to authenticated
using (account_id = (select (auth.uid())::uuid));

drop policy if exists "Authenticated users can insert crm_scripts" on public.crm_scripts;
create policy "Authenticated users can insert crm_scripts"
on public.crm_scripts
for insert
to authenticated
with check (account_id = (select (auth.uid())::uuid));

drop policy if exists "Authenticated users can update crm_scripts" on public.crm_scripts;
create policy "Authenticated users can update crm_scripts"
on public.crm_scripts
for update
to authenticated
using (account_id = (select (auth.uid())::uuid))
with check (account_id = (select (auth.uid())::uuid));

drop function if exists public.set_crm_updated_at();
create or replace function public.set_crm_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_crm_leads_updated_at on public.crm_leads;
create trigger set_crm_leads_updated_at
before update on public.crm_leads
for each row
execute function public.set_crm_updated_at();
