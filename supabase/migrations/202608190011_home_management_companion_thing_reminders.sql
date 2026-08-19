-- Home Base v2: hmc_reminders.entity_type widened to allow 'thing',
-- replacing 'appliance' as Phase 4's cutover renames the entity a
-- warranty-expiring reminder points at. Additive: 'appliance' stays in
-- the allowed set too (never removes an allowed value), so any reminder
-- row already written with entity_type = 'appliance' before this
-- migration runs stays valid; new rows from this point on are written
-- as 'thing' by the application code.

begin;

alter table public.hmc_reminders drop constraint if exists hmc_reminders_entity_type_check;
alter table public.hmc_reminders add constraint hmc_reminders_entity_type_check
  check (entity_type in ('appliance', 'thing', 'maintenanceTask', 'problem'));

commit;
