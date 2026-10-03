-- A real, in-app way to report a problem, now that there is no support
-- mailbox configured yet. Additive only.
--
-- public.support_reports — PLATFORM-level, not product-prefixed, same
--   reasoning as product_updates in 202609050001: a report belongs to the
--   account (and optionally names a product), not to one product's own
--   schema, so a future product never needs its own copy of "let someone
--   flag a problem."
--
--   page_url is the route the reporter was on when they submitted, free
--   text captured client-side (window.location.pathname) — context for
--   whoever reads it, never parsed or trusted as structured data.
--
--   email is captured at submission time rather than joined from
--   auth.users: PostgREST (what the JS client speaks) doesn't expose the
--   auth schema, and the admin-only alternative (the GoTrue admin API)
--   would mean one extra call per row just to render a list. A denormalized
--   copy is a point-in-time record of the address this report came from,
--   same as a receipt — if the account's email changes later, older
--   reports keep showing the one that was true when they were filed.
--
--   category is a plain string, not an enum/check constraint: a fixed
--   list of support categories is product content, not schema, so it's
--   validated client-side (Zod) rather than baked in here as a second
--   place that would need editing to add one — same reasoning
--   ProductFamilyId stays an open string rather than a closed union
--   (CLAUDE.md rule 2).
--
--   Insert and select are both user-scoped: a reporter can submit and
--   later see their own reports (the Support page's "Your cases"
--   section), but never anyone else's. There is no admin role yet
--   (docs/ADMIN-AND-OPERATIONS.md), so the admin list view reads this
--   table with the service-role client server-side, the same tool the
--   notifications cron already uses to read across users — never a
--   broadened RLS policy that would let any authenticated user query
--   every report directly from the browser.
--
-- Wrapped in an explicit transaction — see 202608080001's identical note.

begin;

create table if not exists public.support_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  category text not null,
  message text not null,
  page_url text,
  created_at timestamptz not null default now()
);

create index if not exists support_reports_user_id_idx on public.support_reports (user_id);
create index if not exists support_reports_created_at_idx on public.support_reports (created_at desc);

alter table public.support_reports enable row level security;

drop policy if exists "Users can submit their own reports" on public.support_reports;
create policy "Users can submit their own reports"
on public.support_reports for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can view their own reports" on public.support_reports;
create policy "Users can view their own reports"
on public.support_reports for select to authenticated using (auth.uid() = user_id);

-- Deliberately no update/delete policy for `authenticated` — a submitted
-- report is a record, not an editable draft, and only the service-role
-- client (admin tooling, once it needs to) should ever change one.

commit;
