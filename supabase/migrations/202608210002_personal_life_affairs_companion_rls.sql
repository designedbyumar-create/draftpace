-- In Order: row level security for all four tables.
--
-- Identical posture to Home Base, which the repo's own structural proof
-- (src/products/home-management-companion/rowLevelSecurity.test.ts)
-- enforces: RLS on, at least one policy per table, every policy scoped
-- to auth.uid() = user_id, granted only to authenticated, instance
-- ownership additionally proven on insert, and no delete policy
-- anywhere so nothing can be destroyed from a client.
--
-- Archiving is how records leave, via the shared status column. That is
-- a guarantee here rather than a convention, because the absence of a
-- delete policy makes it one.

begin;

alter table public.pla_profile enable row level security;
alter table public.pla_items enable row level security;
alter table public.pla_steps enable row level security;
alter table public.pla_events enable row level security;

-- pla_profile
drop policy if exists "Users can view their own In Order profile" on public.pla_profile;
create policy "Users can view their own In Order profile"
on public.pla_profile for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own In Order profile" on public.pla_profile;
create policy "Users can insert their own In Order profile"
on public.pla_profile for insert to authenticated
with check (auth.uid() = user_id and public._pla_owns_instance(product_instance_id));

drop policy if exists "Users can update their own In Order profile" on public.pla_profile;
create policy "Users can update their own In Order profile"
on public.pla_profile for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pla_items
drop policy if exists "Users can view their own In Order items" on public.pla_items;
create policy "Users can view their own In Order items"
on public.pla_items for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own In Order items" on public.pla_items;
create policy "Users can insert their own In Order items"
on public.pla_items for insert to authenticated
with check (auth.uid() = user_id and public._pla_owns_instance(product_instance_id));

drop policy if exists "Users can update their own In Order items" on public.pla_items;
create policy "Users can update their own In Order items"
on public.pla_items for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pla_steps
drop policy if exists "Users can view their own In Order steps" on public.pla_steps;
create policy "Users can view their own In Order steps"
on public.pla_steps for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own In Order steps" on public.pla_steps;
create policy "Users can insert their own In Order steps"
on public.pla_steps for insert to authenticated
with check (auth.uid() = user_id and public._pla_owns_instance(product_instance_id));

drop policy if exists "Users can update their own In Order steps" on public.pla_steps;
create policy "Users can update their own In Order steps"
on public.pla_steps for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pla_events
drop policy if exists "Users can view their own In Order events" on public.pla_events;
create policy "Users can view their own In Order events"
on public.pla_events for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own In Order events" on public.pla_events;
create policy "Users can insert their own In Order events"
on public.pla_events for insert to authenticated
with check (auth.uid() = user_id and public._pla_owns_instance(product_instance_id));

drop policy if exists "Users can update their own In Order events" on public.pla_events;
create policy "Users can update their own In Order events"
on public.pla_events for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
