-- Travel Companion: trv_record_entries, the user's own dated notes
-- during and after a trip, and the source table for the deterministic
-- future-trip surfacing in proposal §16.
--
-- place_name IS FOR DETERMINISTIC MATCHING ONLY, NEVER FUZZY
--
-- A later trip's own domain code compares a new trv_places.name
-- (case-insensitive, exact or simple substring) against place_name on
-- rows here, and offers a match with an explicit "add to this trip's
-- preparation" action. No embeddings, no model call, nothing copied
-- without that click, same discipline as every deterministic-matching
-- feature already in this codebase.
--
-- WHY NOTES HAVE NO STATUS COLUMN
--
-- Unlike almost everything else in this product, a note is never
-- corrected by archiving and re-adding, it is corrected by adding
-- another note; this table intentionally carries no lifecycle column
-- because there is nothing here that a soft-delete would ever need to
-- hide, the same reasoning als_item_events and trv_thread_events use for
-- their own append-only shape.

begin;

create table if not exists public.trv_record_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  trip_id uuid not null references public.trv_trips(id) on delete cascade,
  category text not null check (
    category in ('destination', 'stay', 'transport', 'reservation', 'note', 'lesson')
  ),
  place_name text,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists trv_record_entries_trip_idx
  on public.trv_record_entries (trip_id, created_at);
-- Case-insensitive matching for §16's future-trip surfacing, scoped to
-- rows that actually carry a place name.
create index if not exists trv_record_entries_place_name_idx
  on public.trv_record_entries (lower(place_name))
  where place_name is not null;

commit;
