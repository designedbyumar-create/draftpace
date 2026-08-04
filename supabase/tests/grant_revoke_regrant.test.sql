-- Correctness tests for the entitlement upsert fix in
-- 202608040001_grant_admin_purchased_and_revoke.sql. No CLI, pgTAP, or
-- external test runner needed — run this whole script in the Supabase SQL
-- editor. Every check RAISEs an exception (a visible query error) on
-- failure; a clean run ending in "ALL 6 GRANT/REVOKE TESTS PASSED" means
-- every scenario passed.
--
-- Self-contained: creates and cleans up its own rows under a throwaway
-- product slug ('sql-test-product', not a real registered product) against
-- a real, already-existing user. Inserting directly into auth.users is
-- fragile across Supabase Auth schema versions, so this reuses an existing
-- account instead — safe to point at the E2E test account, since it never
-- touches that account's real entitlements (a different product slug).
--
-- Fill in a real, existing user's email below, then run the script.

do $$
declare
  v_user_id uuid;
  v_test_slug text := 'sql-test-product';
  v_cycle_key text := to_char(now(), 'YYYY-MM');
  v_entitlement_id uuid;
  v_instance_id uuid;
  v_row record;
begin
  select id into v_user_id from auth.users where email = 'YOUR_TEST_ACCOUNT_EMAIL' limit 1;
  if v_user_id is null then
    raise exception 'No user found for that email — fill in a real, existing account email first.';
  end if;

  -- Clean slate, in case a previous run of this script did not finish.
  delete from public.product_instances where user_id = v_user_id and product_slug = v_test_slug;
  delete from public.entitlements where user_id = v_user_id and product_slug = v_test_slug;

  -- Initial admin grant.
  select entitlement_id, product_instance_id into v_entitlement_id, v_instance_id
  from public.grant_admin_product(v_user_id, v_test_slug, '0.1.0', v_cycle_key, 'first grant');

  -- Simulate real progress on the instance, to prove revoke -> re-grant
  -- doesn't reset it.
  update public.product_instances
  set setup_complete = true, next_action_label = 'do the thing', lifecycle_state = 'active'
  where id = v_instance_id;

  -- Revoke.
  perform public.revoke_entitlement(v_user_id, v_test_slug);

  select * into v_row from public.entitlements where id = v_entitlement_id;
  if v_row.is_active <> false or v_row.revoked_at is null then
    raise exception 'SETUP FAILED: revoke did not deactivate the entitlement';
  end if;

  -- Re-grant via a DIFFERENT source (purchase), which exercises the
  -- metadata-merge and access_source-update paths at once.
  perform public.grant_purchased_product(
    v_user_id, v_test_slug, '0.1.0', v_cycle_key,
    jsonb_build_object('provider', 'stripe', 'external_charge_id', 'ch_test_123')
  );

  select * into v_row from public.entitlements where id = v_entitlement_id;

  -- 1) grant -> revoke -> re-grant restores access.
  if v_row.is_active <> true then
    raise exception 'FAIL (1): re-grant did not restore is_active';
  end if;
  if v_row.revoked_at is not null then
    raise exception 'FAIL (1): re-grant did not clear revoked_at';
  end if;

  -- 4) admin-grant metadata is recorded (and, on re-grant from a different
  -- source, preserved rather than dropped).
  if v_row.metadata->>'note' <> 'first grant' then
    raise exception 'FAIL (4): original admin-grant metadata (note) was lost instead of merged';
  end if;

  -- 5) purchase metadata is recorded.
  if v_row.access_source <> 'purchase' then
    raise exception 'FAIL (5): access_source was not updated to purchase on re-grant';
  end if;
  if v_row.metadata->>'provider' <> 'stripe' or v_row.metadata->>'external_charge_id' <> 'ch_test_123' then
    raise exception 'FAIL (5): purchase metadata was not recorded';
  end if;

  -- 2) the original product instance is unchanged (same row, same id, not
  -- a freshly created replacement).
  select * into v_row
  from public.product_instances
  where user_id = v_user_id and product_slug = v_test_slug and cycle_key = v_cycle_key;

  if v_row.id <> v_instance_id then
    raise exception 'FAIL (2): re-grant created a new instance instead of reusing the existing one';
  end if;

  -- 3) saved state (at the instance layer this migration touches) remains
  -- intact across revoke -> re-grant.
  if v_row.setup_complete <> true or v_row.next_action_label <> 'do the thing' or v_row.lifecycle_state <> 'active' then
    raise exception 'FAIL (3): instance-level state was reset instead of preserved';
  end if;

  -- 6) repeated grants stay idempotent: no duplicate rows, same ids.
  perform public.grant_purchased_product(v_user_id, v_test_slug, '0.1.0', v_cycle_key, '{}'::jsonb);
  perform public.grant_purchased_product(v_user_id, v_test_slug, '0.1.0', v_cycle_key, '{}'::jsonb);

  if (select count(*) from public.entitlements where user_id = v_user_id and product_slug = v_test_slug) <> 1 then
    raise exception 'FAIL (6): repeated grants duplicated the entitlement row';
  end if;
  if (select count(*) from public.product_instances where user_id = v_user_id and product_slug = v_test_slug and cycle_key = v_cycle_key) <> 1 then
    raise exception 'FAIL (6): repeated grants duplicated the product_instances row';
  end if;
  if (select metadata->>'provider' from public.entitlements where id = v_entitlement_id) <> 'stripe' then
    raise exception 'FAIL (6): an idempotent re-grant with empty metadata wiped previously recorded metadata';
  end if;

  -- Clean up — this script leaves no residue on a passing run.
  delete from public.product_instances where user_id = v_user_id and product_slug = v_test_slug;
  delete from public.entitlements where user_id = v_user_id and product_slug = v_test_slug;

  raise notice 'ALL 6 GRANT/REVOKE TESTS PASSED';
end $$;
