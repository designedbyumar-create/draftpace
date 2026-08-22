-- Homeschooling Companion: where a subject came from.
--
-- One column, fixing a real dishonesty.
--
-- A parent who accepts a starting outline gets subjects and days they
-- did not choose themselves, and the child's page then labelled every
-- one of them "Your plan". That is the product taking credit off the
-- parent for its own suggestion, and it is the exact opposite of the
-- rule the rest of this product keeps: the source is always on screen,
-- every time, so nobody has to wonder whether we invented something.
--
-- Defaults to 'parent', because a subject somebody typed is theirs and
-- every row that existed before this migration was typed.

begin;

alter table public.hsc_plan
  add column if not exists origin text not null default 'parent'
  check (origin in ('parent', 'draftpace-outline'));

commit;
