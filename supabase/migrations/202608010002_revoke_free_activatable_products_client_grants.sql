-- Follow-up to 202608010001_monthly_money_reset.sql. Additive and idempotent.
-- This does not modify or rerun that migration; it only tightens privileges.
--
-- public.free_activatable_products is an allowlist that must only ever be read
-- from inside the SECURITY DEFINER function grant_free_product (owned by the
-- postgres role). Supabase's default privileges grant SELECT on new public
-- tables to the client-facing roles, so the allowlist row was readable
-- directly through the REST API with the anon/authenticated keys. This revokes
-- every direct privilege from those client roles.
--
-- grant_free_product is unaffected: as SECURITY DEFINER owned by postgres it
-- reads the table with the owner's privileges, not the caller's. service_role
-- and postgres are intentionally left untouched so server-side and migration
-- access keep working.

revoke all privileges
  on table public.free_activatable_products
  from public, anon, authenticated;
