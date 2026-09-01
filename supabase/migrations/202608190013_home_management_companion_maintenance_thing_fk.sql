-- Home Base v2: repoint hmc_maintenance_tasks.appliance_id and
-- hmc_maintenance_log.appliance_id at hmc_things(id) instead of
-- hmc_appliances(id). The column keeps its old name (application code
-- still calls it applianceId, see Phase 4a/4b's own notes on this), but
-- Phase 4a's Things cutover means new tasks are now linked against Thing
-- ids, which only exist in hmc_things.
--
-- Safe to run: every appliance_id value that satisfies today's FK (a
-- real row in hmc_appliances) also satisfies the new one, because the
-- 202608190008 and 202608190012 migrations already copied that exact id
-- into hmc_things. No existing row becomes invalid.

begin;

alter table public.hmc_maintenance_tasks drop constraint if exists hmc_maintenance_tasks_appliance_id_fkey;
alter table public.hmc_maintenance_tasks
  add constraint hmc_maintenance_tasks_appliance_id_fkey
  foreign key (appliance_id) references public.hmc_things(id) on delete set null;

alter table public.hmc_maintenance_log drop constraint if exists hmc_maintenance_log_appliance_id_fkey;
alter table public.hmc_maintenance_log
  add constraint hmc_maintenance_log_appliance_id_fkey
  foreign key (appliance_id) references public.hmc_things(id) on delete set null;

commit;
