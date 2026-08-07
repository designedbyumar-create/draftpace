-- Personal Finance Companion: write access. Additive only.
-- See docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md for why this
-- product's seven record tables use direct RLS-enforced INSERT/UPDATE
-- (granted to `authenticated`) rather than Monthly Money Reset's
-- security-definer-RPC-only convention: MMR routes all writes through RPCs
-- specifically for optimistic concurrency on its single JSONB blob and to
-- keep product_instances' denormalized read-cache columns transactionally
-- consistent with that blob. Neither requirement applies to seven
-- independent, normalized rows — RLS `with check` is an equally strong,
-- simpler ownership boundary for this shape of data, and it is the more
-- standard Supabase pattern. The "one canonical function per operation"
-- requirement (launch spec section 19) is satisfied at the application
-- layer instead — see src/products/personal-finance-companion/domain/.
--
-- Every policy below checks both `auth.uid() = user_id` (a row can only
-- ever be attributed to its own creator) and that `product_instance_id`
-- resolves to a product_instances row also owned by that same user
-- (defense in depth against a fabricated instance id — the row still
-- could never be *read* by another user regardless, since the select
-- policy already filters by user_id, but this keeps every row internally
-- consistent, not just access-safe).
--
-- Wrapped in an explicit transaction — see 202608080001's identical note.
-- Every statement here (CREATE OR REPLACE FUNCTION, REVOKE, GRANT, DROP
-- POLICY IF EXISTS + CREATE POLICY) was already safely re-runnable on its
-- own; the transaction wrap is defense in depth, not a fix for anything
-- broken in this file.

begin;

create or replace function public._pfc_owns_instance(p_instance_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.product_instances pi
    where pi.id = p_instance_id and pi.user_id = auth.uid()
  );
$$;

revoke all on function public._pfc_owns_instance(uuid) from public;
grant execute on function public._pfc_owns_instance(uuid) to authenticated;

-- pfc_accounts
drop policy if exists "Users can insert their own PFC accounts" on public.pfc_accounts;
create policy "Users can insert their own PFC accounts"
on public.pfc_accounts for insert to authenticated
with check (auth.uid() = user_id and public._pfc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own PFC accounts" on public.pfc_accounts;
create policy "Users can update their own PFC accounts"
on public.pfc_accounts for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pfc_income_sources
drop policy if exists "Users can insert their own PFC income sources" on public.pfc_income_sources;
create policy "Users can insert their own PFC income sources"
on public.pfc_income_sources for insert to authenticated
with check (auth.uid() = user_id and public._pfc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own PFC income sources" on public.pfc_income_sources;
create policy "Users can update their own PFC income sources"
on public.pfc_income_sources for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pfc_bills
drop policy if exists "Users can insert their own PFC bills" on public.pfc_bills;
create policy "Users can insert their own PFC bills"
on public.pfc_bills for insert to authenticated
with check (auth.uid() = user_id and public._pfc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own PFC bills" on public.pfc_bills;
create policy "Users can update their own PFC bills"
on public.pfc_bills for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pfc_subscriptions
drop policy if exists "Users can insert their own PFC subscriptions" on public.pfc_subscriptions;
create policy "Users can insert their own PFC subscriptions"
on public.pfc_subscriptions for insert to authenticated
with check (auth.uid() = user_id and public._pfc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own PFC subscriptions" on public.pfc_subscriptions;
create policy "Users can update their own PFC subscriptions"
on public.pfc_subscriptions for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pfc_transactions
drop policy if exists "Users can insert their own PFC transactions" on public.pfc_transactions;
create policy "Users can insert their own PFC transactions"
on public.pfc_transactions for insert to authenticated
with check (auth.uid() = user_id and public._pfc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own PFC transactions" on public.pfc_transactions;
create policy "Users can update their own PFC transactions"
on public.pfc_transactions for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pfc_debts
drop policy if exists "Users can insert their own PFC debts" on public.pfc_debts;
create policy "Users can insert their own PFC debts"
on public.pfc_debts for insert to authenticated
with check (auth.uid() = user_id and public._pfc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own PFC debts" on public.pfc_debts;
create policy "Users can update their own PFC debts"
on public.pfc_debts for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pfc_savings_goals
drop policy if exists "Users can insert their own PFC savings goals" on public.pfc_savings_goals;
create policy "Users can insert their own PFC savings goals"
on public.pfc_savings_goals for insert to authenticated
with check (auth.uid() = user_id and public._pfc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own PFC savings goals" on public.pfc_savings_goals;
create policy "Users can update their own PFC savings goals"
on public.pfc_savings_goals for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pfc_import_sessions: a user can create and update their own import
-- sessions directly (uploading a file, the parse pipeline advancing
-- processing_status) — no cross-record invariant requires an RPC yet.
drop policy if exists "Users can insert their own PFC import sessions" on public.pfc_import_sessions;
create policy "Users can insert their own PFC import sessions"
on public.pfc_import_sessions for insert to authenticated
with check (auth.uid() = user_id and public._pfc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own PFC import sessions" on public.pfc_import_sessions;
create policy "Users can update their own PFC import sessions"
on public.pfc_import_sessions for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pfc_extraction_candidates: a user can create and update their own
-- candidates directly. The transactional "confirm a candidate into a real
-- record" action (which must touch a candidate row, a canonical record
-- table, and confirmation_events together) is intentionally left for the
-- candidate-review UI's own implementation stage — out of scope for this
-- infrastructure session — rather than building an RPC now for a flow
-- that doesn't exist yet.
drop policy if exists "Users can insert their own PFC extraction candidates" on public.pfc_extraction_candidates;
create policy "Users can insert their own PFC extraction candidates"
on public.pfc_extraction_candidates for insert to authenticated
with check (auth.uid() = user_id and public._pfc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own PFC extraction candidates" on public.pfc_extraction_candidates;
create policy "Users can update their own PFC extraction candidates"
on public.pfc_extraction_candidates for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pfc_confirmation_events: insert-only, append-only by design — no update
-- or delete policy exists at all, enforcing the append-only invariant
-- declaratively rather than by convention.
drop policy if exists "Users can insert their own PFC confirmation events" on public.pfc_confirmation_events;
create policy "Users can insert their own PFC confirmation events"
on public.pfc_confirmation_events for insert to authenticated
with check (auth.uid() = user_id and public._pfc_owns_instance(product_instance_id));

-- ---------------------------------------------------------------------------
-- pfc_setup_state has no direct write grant, matching Monthly Money
-- Reset's monthly_money_reset_states pattern exactly: this table backs the
-- guided Companion flow's autosave/resume, which does need optimistic
-- concurrency (a second tab or device must not silently overwrite a newer
-- save), the same reason MMR uses an RPC here. Unlike MMR's
-- grant_free_product, PFC's paid-product grant (grant_admin_product /
-- grant_purchased_product) does not create this row eagerly — see that
-- migration's own comment: "a product's own first-load path is
-- responsible for creating its own state row lazily." This function's
-- first branch (no existing row) is that lazy-create path: the first
-- autosave of the guided flow creates the row, matching the "Autosaved
-- draft" lifecycle state in the launch spec section 10 (a real row from
-- the moment the user starts typing, not a separate staging object).
-- ---------------------------------------------------------------------------
create or replace function public.save_personal_finance_companion_setup_state(
  p_instance_id uuid,
  p_expected_revision integer,
  p_new_state jsonb
)
returns table (revision integer, state jsonb, conflict boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_owner uuid;
  v_existing_revision integer;
  v_new_revision integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select user_id into v_owner from public.product_instances where id = p_instance_id;
  if v_owner is null or v_owner <> v_user_id then
    raise exception 'Not found' using errcode = '42501';
  end if;

  select s.revision into v_existing_revision
  from public.pfc_setup_state s
  where s.product_instance_id = p_instance_id;

  if v_existing_revision is null then
    insert into public.pfc_setup_state (product_instance_id, user_id, state, revision)
    values (p_instance_id, v_user_id, p_new_state, 1)
    returning pfc_setup_state.revision into v_new_revision;
    return query select v_new_revision, p_new_state, false;
    return;
  end if;

  update public.pfc_setup_state s
  set state = p_new_state, revision = s.revision + 1, updated_at = now()
  where s.product_instance_id = p_instance_id and s.revision = p_expected_revision
  returning s.revision into v_new_revision;

  if v_new_revision is null then
    return query
      select s.revision, s.state, true
      from public.pfc_setup_state s
      where s.product_instance_id = p_instance_id;
    return;
  end if;

  return query select v_new_revision, p_new_state, false;
end;
$$;

revoke all on function public.save_personal_finance_companion_setup_state(uuid, integer, jsonb) from public;
grant execute on function public.save_personal_finance_companion_setup_state(uuid, integer, jsonb) to authenticated;

commit;
