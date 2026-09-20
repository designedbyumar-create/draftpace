-- Travel Companion: packing lists, opt-in.
--
-- A person can now start a packing list from a starter list (beach, city
-- break, cold weather, camping and so on) and have it added for each
-- traveller. Three additive columns on trv_preparation carry that:
--
--   person_id     whose item it is. Null means it is shared, or the person
--                 recorded nobody to give it to.
--   list_group    the heading it sits under (Clothing, Toiletries, ...).
--   starter_list  which starter list it came from, so the person can tell
--                 what they wrote from what they chose to add. Null for
--                 anything they typed themselves.
--
-- Nothing here is ever added on somebody's behalf: every starter list is a
-- choice, and every item it adds is an ordinary row the person can tick or
-- archive. Archiving already exists (status), as does the update policy
-- that allows it, so no policy changes and there is still no delete.
--
-- Additive only.

begin;

alter table public.trv_preparation
  add column if not exists person_id uuid references public.trv_people(id) on delete set null,
  add column if not exists list_group text,
  add column if not exists starter_list text;

create index if not exists trv_preparation_person_idx
  on public.trv_preparation (person_id);

commit;
