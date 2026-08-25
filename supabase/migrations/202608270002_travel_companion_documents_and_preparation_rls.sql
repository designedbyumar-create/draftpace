-- Travel Companion: row level security for trv_documents and
-- trv_preparation. Identical posture to every other table this product
-- owns: RLS on, scoped to auth.uid() = user_id, granted only to
-- authenticated, instance ownership additionally proven on insert, no
-- delete policy anywhere.
--
-- trv_documents is the single most sensitive category of data this
-- product holds (passport/visa references); there is no version of
-- this policy set that is survivable to get wrong.

begin;

alter table public.trv_documents enable row level security;
alter table public.trv_preparation enable row level security;

-- trv_documents
drop policy if exists "Users can view their own documents" on public.trv_documents;
create policy "Users can view their own documents"
on public.trv_documents for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own documents" on public.trv_documents;
create policy "Users can insert their own documents"
on public.trv_documents for insert to authenticated
with check (auth.uid() = user_id and public._trv_owns_instance(product_instance_id));

drop policy if exists "Users can update their own documents" on public.trv_documents;
create policy "Users can update their own documents"
on public.trv_documents for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trv_preparation
drop policy if exists "Users can view their own preparation items" on public.trv_preparation;
create policy "Users can view their own preparation items"
on public.trv_preparation for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own preparation items" on public.trv_preparation;
create policy "Users can insert their own preparation items"
on public.trv_preparation for insert to authenticated
with check (auth.uid() = user_id and public._trv_owns_instance(product_instance_id));

drop policy if exists "Users can update their own preparation items" on public.trv_preparation;
create policy "Users can update their own preparation items"
on public.trv_preparation for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
