-- Redeemable codes: PLATFORM-level, not product-prefixed. A code
-- unlocks whatever product_slug it was minted for, so this is shared
-- infrastructure any current or future product can sell through an
-- Etsy-style "PDF + code" bundle, not something built into Home Base or
-- PFC specifically. Additive only.
--
-- Design: capped-batch, not strictly single-use-globally. Etsy sends the
-- identical PDF file to every buyer of a listing, so there is no way to
-- hand buyer #47 a different code than buyer #48 without a real Etsy-API
-- integration that doesn't exist yet. Instead: one code is printed into
-- every copy of a given PDF print run, and that code is good for up to
-- max_redemptions redemptions (roughly the number of copies expected to
-- sell before the code is rotated). A code is still single-use PER
-- ACCOUNT (the redemptions table's unique constraint), so one buyer
-- can't redeem the same code twice for extra value.
--
-- redeemable_codes has ZERO client-facing RLS policies, not even a
-- SELECT of your own code, since there is no safe pre-redemption read
-- case (a client that could read a code doesn't need to have redeemed it
-- yet). Only the service-role client (to mint codes) and the
-- SECURITY DEFINER redeem_entitlement_code RPC (to look one up and
-- consume it) ever touch this table.

begin;

create table if not exists public.redeemable_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  product_slug text not null,
  product_version text not null,
  max_redemptions integer not null default 1 check (max_redemptions > 0),
  redemption_count integer not null default 0 check (redemption_count >= 0),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists redeemable_codes_product_slug_idx on public.redeemable_codes (product_slug);

alter table public.redeemable_codes enable row level security;
-- Deliberately no policies at all. RLS enabled with zero grants locks
-- out `anon` and `authenticated` entirely. Only service-role (bypasses
-- RLS) and SECURITY DEFINER functions owned by the migration role can
-- touch this table.

-- ---------------------------------------------------------------------------
-- redeemable_code_redemptions: the per-account single-use ledger. Its
-- unique (code_id, user_id) constraint is what stops one account from
-- redeeming the same code twice.
-- ---------------------------------------------------------------------------
create table if not exists public.redeemable_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.redeemable_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_id uuid references public.entitlements(id) on delete set null,
  redeemed_at timestamptz not null default now(),
  unique (code_id, user_id)
);

create index if not exists redeemable_code_redemptions_user_id_idx on public.redeemable_code_redemptions (user_id);

alter table public.redeemable_code_redemptions enable row level security;

drop policy if exists "Users can view their own code redemptions" on public.redeemable_code_redemptions;
create policy "Users can view their own code redemptions"
on public.redeemable_code_redemptions for select to authenticated using (auth.uid() = user_id);

-- No insert/update/delete policy for `authenticated`, only
-- redeem_entitlement_code (SECURITY DEFINER, below) writes here.

-- ---------------------------------------------------------------------------
-- entitlements.access_source needs a new value: 'redeemed', alongside
-- the existing 'free-grant' / 'purchase' / 'admin-grant'. Constraint has
-- no explicit name in its origin migration, so find it by definition
-- rather than assuming Postgres's default-name convention.
-- ---------------------------------------------------------------------------
do $$
declare
  v_constraint_name text;
begin
  select con.conname into v_constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'entitlements'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%access_source%';

  if v_constraint_name is not null then
    execute format('alter table public.entitlements drop constraint %I', v_constraint_name);
  end if;

  alter table public.entitlements
    add constraint entitlements_access_source_check
    check (access_source in ('free-grant', 'purchase', 'admin-grant', 'redeemed'));
end $$;

-- ---------------------------------------------------------------------------
-- redeem_entitlement_code: the customer-facing redemption path. Atomic:
-- locks the code row (`for update`), checks per-account and total-cap
-- limits, grants the entitlement via the same generic
-- _grant_product_instance helper grant_admin_product/grant_purchased_product
-- already use, then records the redemption and increments the count, all
-- inside one transaction, no check-then-write race window between two
-- concurrent redemptions of the last remaining slot on a code.
-- ---------------------------------------------------------------------------
create or replace function public.redeem_entitlement_code(p_code text)
returns table (product_slug text, entitlement_id uuid, product_instance_id uuid)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_user_id uuid := auth.uid();
  v_code_row record;
  v_already_redeemed boolean;
  v_already_owns boolean;
  v_grant record;
  v_cycle_key text := to_char(now(), 'YYYY-MM');
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if p_code is null or trim(p_code) = '' then
    raise exception 'Enter a code.' using errcode = '22023';
  end if;

  select * into v_code_row
  from public.redeemable_codes
  where code = upper(trim(p_code))
  for update;

  if not found then
    raise exception 'That code is not valid.' using errcode = '22023';
  end if;

  select exists (
    select 1 from public.redeemable_code_redemptions
    where code_id = v_code_row.id and user_id = v_user_id
  ) into v_already_redeemed;

  if v_already_redeemed then
    raise exception 'You have already redeemed this code.' using errcode = '23505';
  end if;

  if v_code_row.redemption_count >= v_code_row.max_redemptions then
    raise exception 'This code has reached its redemption limit.' using errcode = '22023';
  end if;

  select exists (
    select 1 from public.entitlements
    where user_id = v_user_id and product_slug = v_code_row.product_slug and is_active = true
  ) into v_already_owns;

  if v_already_owns then
    raise exception 'You already own this product.' using errcode = '23505';
  end if;

  select * into v_grant
  from public._grant_product_instance(
    v_user_id,
    v_code_row.product_slug,
    v_code_row.product_version,
    v_cycle_key,
    'redeemed',
    jsonb_build_object('redeemable_code_id', v_code_row.id)
  );

  insert into public.redeemable_code_redemptions (code_id, user_id, entitlement_id)
  values (v_code_row.id, v_user_id, v_grant.entitlement_id);

  update public.redeemable_codes
  set redemption_count = redemption_count + 1
  where id = v_code_row.id;

  return query select v_code_row.product_slug, v_grant.entitlement_id, v_grant.product_instance_id;
end;
$$;

revoke all on function public.redeem_entitlement_code(text) from public, anon, service_role;
grant execute on function public.redeem_entitlement_code(text) to authenticated;

-- ---------------------------------------------------------------------------
-- generate_redeemable_codes: service-role only, for the founder to mint
-- a batch per Etsy print run (invoked directly via the Supabase SQL
-- editor, not a new admin UI panel. Admin stays scaffolding-only per
-- ADMIN-AND-OPERATIONS.md). 8-character codes from a charset that drops
-- visually ambiguous characters (0/O, 1/I/L) since these get typed by
-- hand from a printed PDF.
-- ---------------------------------------------------------------------------
create or replace function public.generate_redeemable_codes(
  p_product_slug text,
  p_product_version text,
  p_max_redemptions integer,
  p_count integer,
  p_note text default null
)
returns table (code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_charset text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_code text;
  v_i integer;
  v_char_index integer;
  v_generated integer := 0;
begin
  if p_product_slug is null or p_product_slug = '' then
    raise exception 'p_product_slug is required';
  end if;
  if p_product_version is null or p_product_version = '' then
    raise exception 'p_product_version is required';
  end if;
  if p_max_redemptions is null or p_max_redemptions <= 0 then
    raise exception 'p_max_redemptions must be positive';
  end if;
  if p_count is null or p_count <= 0 then
    raise exception 'p_count must be positive';
  end if;

  while v_generated < p_count loop
    v_code := '';
    for v_i in 1..8 loop
      v_char_index := (floor(random() * length(v_charset)) + 1)::int;
      v_code := v_code || substr(v_charset, v_char_index, 1);
      if v_i = 4 then
        v_code := v_code || '-';
      end if;
    end loop;

    begin
      insert into public.redeemable_codes (code, product_slug, product_version, max_redemptions, note)
      values (v_code, p_product_slug, p_product_version, p_max_redemptions, p_note);
      v_generated := v_generated + 1;
      code := v_code;
      return next;
    exception when unique_violation then
      -- Collision on the unique code (astronomically unlikely at 8 chars
      -- from a 32-char alphabet), retry without counting it.
      null;
    end;
  end loop;
end;
$$;

revoke all on function public.generate_redeemable_codes(text, text, integer, integer, text) from public, anon, authenticated;
grant execute on function public.generate_redeemable_codes(text, text, integer, integer, text) to service_role;

commit;
