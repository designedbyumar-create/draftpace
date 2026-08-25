-- Travel Companion: surface_in_brief on trv_documents.
--
-- Closes proposal §14's own Trip Brief model: "Important" is any
-- document the traveller flagged as brief-worthy, e.g. "Minha's
-- passport is stored with her travel documents." A boolean, not a
-- second table, so the Trip Brief's "Important" line has a real column
-- to read instead of guessing what counts as important.

begin;

alter table public.trv_documents
  add column if not exists surface_in_brief boolean not null default false;

commit;
