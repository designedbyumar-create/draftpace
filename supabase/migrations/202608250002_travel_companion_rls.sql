-- Travel Companion: row level security for the five phase 1 tables.
--
-- Identical posture to every sibling: RLS on, at least one policy per
-- table, every policy scoped to auth.uid() = user_id, granted only to
-- authenticated, instance ownership additionally proven on insert, and
-- no delete policy anywhere so nothing can be destroyed from a client.
--
-- Rows leave by status, not DELETE, on every one of these five tables,
-- including trv_booking_people: a wrongly linked traveller is corrected
-- by archiving the link, never by deleting the row.

begin;

alter table public.trv_trips enable row level security;
alter table public.trv_people enable row level security;
alter table public.trv_places enable row level security;
alter table public.trv_bookings enable row level security;
alter table public.trv_booking_people enable row level security;

-- trv_trips
drop policy if exists "Users can view their own trips" on public.trv_trips;
create policy "Users can view their own trips"
on public.trv_trips for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own trips" on public.trv_trips;
create policy "Users can insert their own trips"
on public.trv_trips for insert to authenticated
with check (auth.uid() = user_id and public._trv_owns_instance(product_instance_id));

drop policy if exists "Users can update their own trips" on public.trv_trips;
create policy "Users can update their own trips"
on public.trv_trips for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trv_people
drop policy if exists "Users can view their own travellers" on public.trv_people;
create policy "Users can view their own travellers"
on public.trv_people for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own travellers" on public.trv_people;
create policy "Users can insert their own travellers"
on public.trv_people for insert to authenticated
with check (auth.uid() = user_id and public._trv_owns_instance(product_instance_id));

drop policy if exists "Users can update their own travellers" on public.trv_people;
create policy "Users can update their own travellers"
on public.trv_people for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trv_places
drop policy if exists "Users can view their own places" on public.trv_places;
create policy "Users can view their own places"
on public.trv_places for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own places" on public.trv_places;
create policy "Users can insert their own places"
on public.trv_places for insert to authenticated
with check (auth.uid() = user_id and public._trv_owns_instance(product_instance_id));

drop policy if exists "Users can update their own places" on public.trv_places;
create policy "Users can update their own places"
on public.trv_places for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trv_bookings
drop policy if exists "Users can view their own bookings" on public.trv_bookings;
create policy "Users can view their own bookings"
on public.trv_bookings for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own bookings" on public.trv_bookings;
create policy "Users can insert their own bookings"
on public.trv_bookings for insert to authenticated
with check (auth.uid() = user_id and public._trv_owns_instance(product_instance_id));

drop policy if exists "Users can update their own bookings" on public.trv_bookings;
create policy "Users can update their own bookings"
on public.trv_bookings for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trv_booking_people
drop policy if exists "Users can view their own booking links" on public.trv_booking_people;
create policy "Users can view their own booking links"
on public.trv_booking_people for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own booking links" on public.trv_booking_people;
create policy "Users can insert their own booking links"
on public.trv_booking_people for insert to authenticated
with check (auth.uid() = user_id and public._trv_owns_instance(product_instance_id));

drop policy if exists "Users can update their own booking links" on public.trv_booking_people;
create policy "Users can update their own booking links"
on public.trv_booking_people for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
