-- Travel Companion: a memory note and a memory link on each trip.
--
-- Both nullable, both free text. Written any time, usually once a trip
-- is concluded and someone looks back on it. No validation on the link:
-- it is stored and displayed as typed, never fetched or verified.
--
-- No policy changes: the existing trv_trips RLS policies already cover
-- every column on the row, so these two need nothing new.

begin;

alter table public.trv_trips
  add column if not exists memory_note text,
  add column if not exists memory_link text;

commit;
