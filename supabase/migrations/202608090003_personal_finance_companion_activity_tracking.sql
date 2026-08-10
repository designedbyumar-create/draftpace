-- Personal Finance Companion: keep product_instances.updated_at/
-- last_activity_at genuinely current. Additive only.
--
-- Found during Stage G's navigation audit: resolveLifecycleNavigation()
-- (src/product-framework/navigationResolver.ts) tells a genuinely fresh
-- instance apart from one mid-setup using `createdAt !== updatedAt` on
-- product_instances — correct for Monthly Money Reset, whose single save
-- RPC explicitly bumps both columns on every write (see
-- save_monthly_money_reset_state in 202608010001). PFC deliberately uses
-- direct RLS writes across seven independent, normalized tables instead
-- of one RPC (202608080003's own header explains why), and none of that
-- write path ever touched product_instances — so `everTouched` has been
-- silently false for every PFC instance regardless of real activity,
-- permanently locking the primary navigation into its "never started,
-- Start only" state. This was never visible in prior stages' live QA
-- because testing navigated by direct URL/deep link, never the nav bar
-- itself.
--
-- Fixed generically, at the database layer, rather than by hand-editing
-- create/update/archive in each of the seven domain files: one trigger
-- function, attached to all seven pfc_* record tables, bumps the parent
-- product_instances row's timestamps on any insert or update. This adds
-- behavior, changes no existing column, table, or RLS policy.
--
-- Wrapped in an explicit transaction — see 202608080001's identical note.
--
-- search_path = public, pg_temp (not just public): matches what was
-- actually applied to production. pg_temp is appended so an explicit,
-- unqualified reference to a temp object inside this SECURITY DEFINER
-- function would still resolve during that session, rather than the
-- search_path silently omitting the schema Postgres itself always
-- consults first for unqualified names — every reference in this
-- function is already schema-qualified (public.product_instances), so
-- this changes nothing about its behavior, only brings the committed
-- source in line with the live definition.

begin;

create or replace function public._pfc_touch_instance()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.product_instances
  set updated_at = now(), last_activity_at = now()
  where id = new.product_instance_id;
  return new;
end;
$$;

revoke all on function public._pfc_touch_instance() from public;

do $$
declare
  t text;
begin
  foreach t in array array[
    'pfc_accounts', 'pfc_income_sources', 'pfc_bills', 'pfc_subscriptions',
    'pfc_transactions', 'pfc_debts', 'pfc_savings_goals'
  ]
  loop
    execute format(
      'drop trigger if exists _pfc_touch_instance_trigger on public.%I;
       create trigger _pfc_touch_instance_trigger
       after insert or update on public.%I
       for each row execute function public._pfc_touch_instance();',
      t, t
    );
  end loop;
end $$;

commit;
