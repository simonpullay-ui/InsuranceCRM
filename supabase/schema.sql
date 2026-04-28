create extension if not exists "pgcrypto";

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  job_number text not null unique,
  branch text not null,
  division text not null,
  lead_source text,
  project_manager text,
  installer_crew text,
  contract_amount numeric(12,2) not null default 0,
  deposit_amount numeric(12,2),
  deposit_collected_date date,
  final_payment_date date,
  payment_status text not null check (
    payment_status in (
      'Deposit Pending',
      'Deposit Scheduled',
      'Deposit Collected',
      'Final Payment Owed',
      'Paid in Full'
    )
  ),
  install_status text not null check (
    install_status in (
      'Not Scheduled',
      'Pending Install',
      'Scheduled',
      'In Progress',
      'Installed',
      'Delayed',
      'Repair Needed',
      'Completed'
    )
  ),
  job_status text not null check (
    job_status in (
      'Open',
      'Approved',
      'Waiting on Materials',
      'Ready to Schedule',
      'Scheduled',
      'Active',
      'Closed'
    )
  ),
  scheduled_install_date date,
  install_start_date date,
  install_end_date date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at
before update on public.jobs
for each row
execute function public.set_updated_at();

alter table public.jobs enable row level security;

drop policy if exists "Authenticated users can read jobs" on public.jobs;
create policy "Authenticated users can read jobs"
on public.jobs
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert jobs" on public.jobs;
create policy "Authenticated users can insert jobs"
on public.jobs
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update jobs" on public.jobs;
create policy "Authenticated users can update jobs"
on public.jobs
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete jobs" on public.jobs;
create policy "Authenticated users can delete jobs"
on public.jobs
for delete
to authenticated
using (true);
