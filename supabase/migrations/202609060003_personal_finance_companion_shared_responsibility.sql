-- Personal Finance Companion: Shared Responsibility (design-system pass,
-- Phase 2). A per-bill/per-subscription shared flag and split ratio, plus
-- a manually-ticked settlement marker so the generated statement can say
-- what was actually reconciled last time, not just restate a running
-- total. This absorbs the founder-proposed Couple Finance Companion into
-- a feature of this product rather than a separate one (Trump Card Memo).
--
-- shared_split_percent is this account's own share, 1-99 when shared is
-- true (the other party's share is the remainder); null whenever shared
-- is false, since an unshared bill has no split to express. settled_at is
-- the last time this item was manually marked square; re-ticking settled
-- after new shared activity is how a fresh reconciliation period starts,
-- there is no automatic cycle boundary to reset it (this product's
-- cycleModel is "continuous", unlike Monthly Money Reset).

alter table public.pfc_bills
  add column if not exists shared boolean not null default false,
  add column if not exists shared_split_percent smallint,
  add column if not exists settled boolean not null default false,
  add column if not exists settled_at timestamptz;

alter table public.pfc_bills
  drop constraint if exists pfc_bills_shared_split_percent_check;
alter table public.pfc_bills
  add constraint pfc_bills_shared_split_percent_check
  check (
    (shared = false and shared_split_percent is null)
    or (shared = true and shared_split_percent between 1 and 99)
  );

alter table public.pfc_subscriptions
  add column if not exists shared boolean not null default false,
  add column if not exists shared_split_percent smallint,
  add column if not exists settled boolean not null default false,
  add column if not exists settled_at timestamptz;

alter table public.pfc_subscriptions
  drop constraint if exists pfc_subscriptions_shared_split_percent_check;
alter table public.pfc_subscriptions
  add constraint pfc_subscriptions_shared_split_percent_check
  check (
    (shared = false and shared_split_percent is null)
    or (shared = true and shared_split_percent between 1 and 99)
  );
