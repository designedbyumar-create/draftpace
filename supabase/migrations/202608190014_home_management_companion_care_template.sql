-- Home Base v2 Phase 1: link a care task back to the curated knowledge
-- entry that proposed it.
--
-- Why this column exists: attention.ts used to score every maintenance
-- task with hardcoded neutral factors, so a dryer vent (a fire risk) and
-- a detergent drawer (cosmetic) ranked identically once both were due.
-- Knowing which care template a task came from lets the urgency function
-- read that template's real consequence and effort from homeKnowledge.ts
-- instead of a constant.
--
-- Additive and nullable. Every existing row keeps working: a task with a
-- null care_template_id falls back to matching on its own name, and then
-- to neutral factors, so nothing regresses for tasks created before this
-- migration or typed by hand.
--
-- The format check mirrors the open-string convention already used for
-- hmc_things.type: lowercase, validated at the edge, backed by a
-- TypeScript registry rather than a closed CHECK list, so new templates
-- never need a schema change.

begin;

alter table public.hmc_maintenance_tasks
  add column if not exists care_template_id text;

alter table public.hmc_maintenance_tasks
  drop constraint if exists hmc_maintenance_tasks_care_template_id_check;
alter table public.hmc_maintenance_tasks
  add constraint hmc_maintenance_tasks_care_template_id_check
  check (care_template_id is null or care_template_id ~ '^[a-z][a-z0-9.-]*$');

commit;
