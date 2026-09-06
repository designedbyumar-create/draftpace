-- Travel Companion: timezone on trv_places.
--
-- An IANA zone name ("Asia/Tokyo"), never a raw UTC offset: the whole
-- reason for that choice is that an offset drifts the moment a place
-- observes daylight saving and a trip crosses that boundary, while a
-- zone name carries the rule with it. Nullable, and meant to stay null
-- for a place the client-side lookup table (timezoneLookup.ts) does not
-- recognise; the app falls back to UTC for those rather than guessing,
-- the same "unlisted but never silently wrong" rule the lookup itself
-- follows.
--
-- No format is enforced here at the database level. IANA names are not a
-- fixed enum this schema can usefully check, and the application layer
-- is the one place that ever writes to this column (from its own lookup
-- table or a person's own explicit pick), so a check constraint here
-- would only ever duplicate that trust, never add to it.

begin;

alter table public.trv_places
  add column if not exists timezone text;

comment on column public.trv_places.timezone is
  'IANA timezone name (e.g. Asia/Tokyo), never a raw UTC offset. Null means not detected; the app treats that as UTC.';

commit;
