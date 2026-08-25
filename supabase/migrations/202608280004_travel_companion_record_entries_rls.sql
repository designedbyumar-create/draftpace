-- Travel Companion: row level security for trv_record_entries.
--
-- Select and insert only, same append-only reasoning as
-- trv_thread_events: a note is corrected by adding another note, never
-- by editing or deleting the one already written.

begin;

alter table public.trv_record_entries enable row level security;

drop policy if exists "Users can view their own record entries" on public.trv_record_entries;
create policy "Users can view their own record entries"
on public.trv_record_entries for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own record entries" on public.trv_record_entries;
create policy "Users can insert their own record entries"
on public.trv_record_entries for insert to authenticated
with check (auth.uid() = user_id and public._trv_owns_instance(product_instance_id));

commit;
