-- Personal Finance Companion: optional Debt/SavingsGoal -> Account links.
-- Additive only.
--
-- Found during Stage G's financial-object-model audit: a real-world credit
-- card entered as a Debt (balance, rate, minimum payment) had no way to
-- also be the source of logged transactions, since pfc_transactions.
-- account_id requires a row in pfc_accounts and none existed for it -
-- forcing a second, duplicate record for the same card to do both. The
-- same gap existed between a Savings Goal and the actual Account holding
-- that money: no link, so progress had to be kept in sync by hand.
--
-- Both columns are nullable references with no default and no behavior
-- attached - most debts (loans, mortgages) and savings goals genuinely
-- have no matching account, and nothing currently reads either column.
-- savings_goals.saved_amount_minor stays manually entered even when
-- linked; deriving it from the linked account's live balance is a real
-- but separate calculation-semantics decision, not made here.
--
-- Wrapped in an explicit transaction - see 202608080001's identical note.

begin;

alter table public.pfc_debts
  add column if not exists linked_account_id uuid references public.pfc_accounts(id) on delete set null;

alter table public.pfc_savings_goals
  add column if not exists linked_account_id uuid references public.pfc_accounts(id) on delete set null;

create index if not exists pfc_debts_linked_account_idx on public.pfc_debts (linked_account_id);
create index if not exists pfc_savings_goals_linked_account_idx on public.pfc_savings_goals (linked_account_id);

commit;
