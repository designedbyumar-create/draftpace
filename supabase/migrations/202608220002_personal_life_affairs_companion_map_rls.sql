-- In Order: row level security for the two Life Affairs Map tables.
--
-- Same posture as the other four, which the repo's structural proof
-- enforces: RLS on, every policy scoped to auth.uid() = user_id, granted
-- only to authenticated, instance ownership proven on insert, and no
-- delete policy anywhere so nothing can be destroyed from a client.
--
-- pla_item_revisions deliberately has NO update policy either. History
-- that can be edited is not history. Records leave by being archived on
-- pla_items, which writes one more revision rather than removing any.

begin;

alter table public.pla_item_links enable row level security;
alter table public.pla_item_revisions enable row level security;

-- pla_item_links
drop policy if exists "Users can view their own In Order links" on public.pla_item_links;
create policy "Users can view their own In Order links"
on public.pla_item_links for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own In Order links" on public.pla_item_links;
create policy "Users can insert their own In Order links"
on public.pla_item_links for insert to authenticated
with check (auth.uid() = user_id and public._pla_owns_instance(product_instance_id));

drop policy if exists "Users can update their own In Order links" on public.pla_item_links;
create policy "Users can update their own In Order links"
on public.pla_item_links for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pla_item_revisions (append only: select and insert, never update)
drop policy if exists "Users can view their own In Order revisions" on public.pla_item_revisions;
create policy "Users can view their own In Order revisions"
on public.pla_item_revisions for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own In Order revisions" on public.pla_item_revisions;
create policy "Users can insert their own In Order revisions"
on public.pla_item_revisions for insert to authenticated
with check (auth.uid() = user_id and public._pla_owns_instance(product_instance_id));

commit;
