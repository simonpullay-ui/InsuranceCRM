# BranchPulse

BranchPulse is a simple internal operations app built with Next.js, TypeScript, Tailwind CSS, and Supabase. It gives teams one place to manage jobs, track install and payment status, plan installs on a dynamic calendar, and review branch-level performance.

## Features

- Supabase email/password login
- Protected app routes for authenticated users only
- Jobs module with full create, edit, delete, search, and filtering
- Calendar module with day, week, and month views
- Dashboard with KPIs, breakdowns, upcoming installs, and overdue payments
- Responsive internal dashboard layout with sidebar navigation

## Environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. In Supabase, enable Email auth for your project.

3. Run the SQL in [`supabase/schema.sql`](/Users/simon/Documents/New%20project/supabase/schema.sql).

4. Add the environment variables above to `.env.local`.

5. Start the dev server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000).

## Main routes

- `/login`
- `/calendar`
- `/dashboard`
- `/jobs`

## Project structure

- `app/` for routes, layouts, auth actions, and job API handlers
- `components/branchpulse/` for reusable app UI
- `lib/` for types, utilities, Supabase helpers, and dashboard/job data helpers
- `supabase/schema.sql` for the database schema and RLS policies

## Notes

- `calendar` is designed as the main operational screen.
- Supabase row-level security is enabled for authenticated users.
- The schema includes `created_at` and `updated_at` timestamps plus an update trigger.
- The architecture is intentionally simple so it can grow later without heavy refactoring.
