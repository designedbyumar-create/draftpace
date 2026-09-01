-- Travel Companion: row level security for Companion Mode runs.
--
-- Identical posture to every sibling: RLS on, at least one policy per
-- table, every policy scoped to auth.uid() = user_id, granted only to
-- authenticated, instance ownership additionally proven on insert, and
-- no delete policy anywhere.

begin;

alter table public.trv_runs enable row level security;
alter table public.trv_run_answers enable row level security;

-- trv_runs
drop policy if exists "Users can view their own runs" on public.trv_runs;
create policy "Users can view their own runs"
on public.trv_runs for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own runs" on public.trv_runs;
create policy "Users can insert their own runs"
on public.trv_runs for insert to authenticated
with check (auth.uid() = user_id and public._trv_owns_instance(product_instance_id));

drop policy if exists "Users can update their own runs" on public.trv_runs;
create policy "Users can update their own runs"
on public.trv_runs for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trv_run_answers
drop policy if exists "Users can view their own run answers" on public.trv_run_answers;
create policy "Users can view their own run answers"
on public.trv_run_answers for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own run answers" on public.trv_run_answers;
create policy "Users can insert their own run answers"
on public.trv_run_answers for insert to authenticated
with check (auth.uid() = user_id and public._trv_owns_instance(product_instance_id));

drop policy if exists "Users can update their own run answers" on public.trv_run_answers;
create policy "Users can update their own run answers"
on public.trv_run_answers for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
