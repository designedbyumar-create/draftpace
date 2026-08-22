-- Homeschooling Companion: row level security for the five phase 1 tables.
--
-- Identical posture to its three siblings, which the repo's own
-- structural proofs enforce: RLS on, at least one policy per table,
-- every policy scoped to auth.uid() = user_id, granted only to
-- authenticated, instance ownership additionally proven on insert, and
-- no delete policy anywhere so nothing can be destroyed from a client.
--
-- This product carries information about children, so the posture is not
-- a convention here, it is the point. Archiving is how records leave,
-- via the shared status column, and the absence of a delete policy makes
-- that a guarantee rather than a habit.

begin;

alter table public.hsc_children enable row level security;
alter table public.hsc_curricula enable row level security;
alter table public.hsc_curriculum_nodes enable row level security;
alter table public.hsc_positions enable row level security;
alter table public.hsc_plan enable row level security;

-- hsc_children
drop policy if exists "Users can view their own children" on public.hsc_children;
create policy "Users can view their own children"
on public.hsc_children for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own children" on public.hsc_children;
create policy "Users can insert their own children"
on public.hsc_children for insert to authenticated
with check (auth.uid() = user_id and public._hsc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own children" on public.hsc_children;
create policy "Users can update their own children"
on public.hsc_children for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- hsc_curricula
drop policy if exists "Users can view their own curricula" on public.hsc_curricula;
create policy "Users can view their own curricula"
on public.hsc_curricula for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own curricula" on public.hsc_curricula;
create policy "Users can insert their own curricula"
on public.hsc_curricula for insert to authenticated
with check (auth.uid() = user_id and public._hsc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own curricula" on public.hsc_curricula;
create policy "Users can update their own curricula"
on public.hsc_curricula for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- hsc_curriculum_nodes
drop policy if exists "Users can view their own curriculum nodes" on public.hsc_curriculum_nodes;
create policy "Users can view their own curriculum nodes"
on public.hsc_curriculum_nodes for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own curriculum nodes" on public.hsc_curriculum_nodes;
create policy "Users can insert their own curriculum nodes"
on public.hsc_curriculum_nodes for insert to authenticated
with check (auth.uid() = user_id and public._hsc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own curriculum nodes" on public.hsc_curriculum_nodes;
create policy "Users can update their own curriculum nodes"
on public.hsc_curriculum_nodes for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- hsc_positions
drop policy if exists "Users can view their own positions" on public.hsc_positions;
create policy "Users can view their own positions"
on public.hsc_positions for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own positions" on public.hsc_positions;
create policy "Users can insert their own positions"
on public.hsc_positions for insert to authenticated
with check (auth.uid() = user_id and public._hsc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own positions" on public.hsc_positions;
create policy "Users can update their own positions"
on public.hsc_positions for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- hsc_plan
drop policy if exists "Users can view their own plan" on public.hsc_plan;
create policy "Users can view their own plan"
on public.hsc_plan for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own plan" on public.hsc_plan;
create policy "Users can insert their own plan"
on public.hsc_plan for insert to authenticated
with check (auth.uid() = user_id and public._hsc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own plan" on public.hsc_plan;
create policy "Users can update their own plan"
on public.hsc_plan for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
