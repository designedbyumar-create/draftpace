-- Travel Companion: an optional expiry date on a document entry.
--
-- The registry still records what exists and where it is kept, never the
-- document. An expiry date is one more thing the person may record, and the
-- only thing the product does with it is compare it to the trip's own dates
-- and say, as a plain fact, when it falls before or during the trip or soon
-- after it. It never states what any country requires.
--
-- Additive only. No policy changes: the existing owner-only select, insert
-- and update policies already cover the new column, and there is still no
-- delete.

begin;

alter table public.trv_documents
  add column if not exists expires_on date;

commit;
