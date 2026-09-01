-- Home Base v2: snooze/skip plumbing. Additive except for widening two
-- CHECK constraints on hmc_reminders (called out explicitly below), no
-- existing row becomes invalid either way, since widening only adds
-- allowed values, never removes one.
--
-- snoozed_until lands on hmc_maintenance_tasks here (hmc_problems already
-- has it from the 202608190009 migration) so both attention-eligible
-- entities carry the same field for attention.ts's single snooze guard
-- clause. hmc_reminders' kind/entity_type CHECK constraints are widened
-- to allow 'problem', matching attention.ts's new AttentionKind and
-- reminders.ts's new ReminderEntityType.
--
-- Wrapped in an explicit transaction, same reasoning as every prior
-- migration in this product.

begin;

alter table public.hmc_maintenance_tasks add column if not exists snoozed_until timestamptz;

alter table public.hmc_reminders drop constraint if exists hmc_reminders_kind_check;
alter table public.hmc_reminders add constraint hmc_reminders_kind_check
  check (kind in ('maintenanceDue', 'warrantyExpiring', 'problem'));

alter table public.hmc_reminders drop constraint if exists hmc_reminders_entity_type_check;
alter table public.hmc_reminders add constraint hmc_reminders_entity_type_check
  check (entity_type in ('appliance', 'maintenanceTask', 'problem'));

commit;
