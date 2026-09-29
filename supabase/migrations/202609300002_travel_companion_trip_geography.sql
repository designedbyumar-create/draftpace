-- Travel Companion: which kind of trip this is, and where, structured.
--
-- travel_type records which of the two setup paths was used
-- ("international" or "domestic"). destination_country and
-- destination_state hold the picked value from that path (a country
-- name or a US state name), so it is real, queryable data rather than
-- only text folded into destination_summary. All three are nullable:
-- a trip created before this existed has none of them, and the setup
-- form never blocks on what somebody types not matching a known name.
--
-- No policy changes: the existing trv_trips RLS policies already cover
-- every column on the row.

begin;

alter table public.trv_trips
  add column if not exists travel_type text check (travel_type in ('international', 'domestic')),
  add column if not exists destination_country text,
  add column if not exists destination_state text;

commit;
