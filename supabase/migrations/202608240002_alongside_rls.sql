-- Alongside: row level security for the four phase 1 tables.
--
-- Identical posture to its four siblings, which the repo's own
-- structural proofs enforce: RLS on, at least one policy per table,
-- every policy scoped to auth.uid() = user_id, granted only to
-- authenticated, instance ownership additionally proven on insert, and
-- no delete policy anywhere so nothing can be destroyed from a client.
--
-- The missing delete policy carries extra weight in this product. Its
-- subject is things people find hard to finish, and a person having a
-- bad week should not be able to erase the record of a year in which
-- they got a great deal done. Items close, they do not disappear.
--
-- als_item_events has no update policy either. It is an append only
-- record of things that actually happened, and a history that can be
-- edited after the fact is not a history somebody can trust when they
-- read it back to themselves.

begin;

alter table public.als_items enable row level security;
alter table public.als_item_events enable row level security;
alter table public.als_runs enable row level security;
alter table public.als_run_answers enable row level security;

-- als_items
drop policy if exists "Users can view their own items" on public.als_items;
create policy "Users can view their own items"
on public.als_items for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own items" on public.als_items;
create policy "Users can insert their own items"
on public.als_items for insert to authenticated
with check (auth.uid() = user_id and public._als_owns_instance(product_instance_id));

drop policy if exists "Users can update their own items" on public.als_items;
create policy "Users can update their own items"
on public.als_items for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- als_item_events
drop policy if exists "Users can view their own item events" on public.als_item_events;
create policy "Users can view their own item events"
on public.als_item_events for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own item events" on public.als_item_events;
create policy "Users can insert their own item events"
on public.als_item_events for insert to authenticated
with check (auth.uid() = user_id and public._als_owns_instance(product_instance_id));

-- als_runs
drop policy if exists "Users can view their own runs" on public.als_runs;
create policy "Users can view their own runs"
on public.als_runs for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own runs" on public.als_runs;
create policy "Users can insert their own runs"
on public.als_runs for insert to authenticated
with check (auth.uid() = user_id and public._als_owns_instance(product_instance_id));

drop policy if exists "Users can update their own runs" on public.als_runs;
create policy "Users can update their own runs"
on public.als_runs for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- als_run_answers
drop policy if exists "Users can view their own run answers" on public.als_run_answers;
create policy "Users can view their own run answers"
on public.als_run_answers for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own run answers" on public.als_run_answers;
create policy "Users can insert their own run answers"
on public.als_run_answers for insert to authenticated
with check (auth.uid() = user_id and public._als_owns_instance(product_instance_id));

drop policy if exists "Users can update their own run answers" on public.als_run_answers;
create policy "Users can update their own run answers"
on public.als_run_answers for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
