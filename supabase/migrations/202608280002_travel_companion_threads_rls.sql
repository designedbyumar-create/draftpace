-- Travel Companion: row level security for trv_threads and
-- trv_thread_events.
--
-- trv_threads gets the usual three policies (select/insert/update),
-- same posture as every other table this product owns. trv_thread_events
-- gets only select and insert, same as als_item_events: an append-only
-- log has no update policy and no delete policy, on purpose, since
-- nothing in it is ever wrong in a way that needs correcting, only ever
-- added to.

begin;

alter table public.trv_threads enable row level security;
alter table public.trv_thread_events enable row level security;

-- trv_threads
drop policy if exists "Users can view their own threads" on public.trv_threads;
create policy "Users can view their own threads"
on public.trv_threads for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own threads" on public.trv_threads;
create policy "Users can insert their own threads"
on public.trv_threads for insert to authenticated
with check (auth.uid() = user_id and public._trv_owns_instance(product_instance_id));

drop policy if exists "Users can update their own threads" on public.trv_threads;
create policy "Users can update their own threads"
on public.trv_threads for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trv_thread_events (append-only: no update policy, no delete policy)
drop policy if exists "Users can view their own thread events" on public.trv_thread_events;
create policy "Users can view their own thread events"
on public.trv_thread_events for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own thread events" on public.trv_thread_events;
create policy "Users can insert their own thread events"
on public.trv_thread_events for insert to authenticated
with check (auth.uid() = user_id and public._trv_owns_instance(product_instance_id));

commit;
