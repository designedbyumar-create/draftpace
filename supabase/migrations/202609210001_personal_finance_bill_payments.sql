-- Personal Finance Companion: which bills were paid in which month.
--
-- One row per bill per calendar month, so "paid this month" is a fact the
-- person ticked, not something inferred. Un-ticking deletes the row. The
-- period is a plain "YYYY-MM" string so a month never depends on a time zone.

create table if not exists public.pfc_bill_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  bill_id uuid not null references public.pfc_bills(id) on delete cascade,
  period text not null check (period ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  paid_on date not null,
  created_at timestamptz not null default now(),
  unique (bill_id, period)
);

create index if not exists pfc_bill_payments_instance_idx on public.pfc_bill_payments (product_instance_id, period);

alter table public.pfc_bill_payments enable row level security;

drop policy if exists "Users can view their own PFC bill payments" on public.pfc_bill_payments;
create policy "Users can view their own PFC bill payments"
on public.pfc_bill_payments for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own PFC bill payments" on public.pfc_bill_payments;
create policy "Users can insert their own PFC bill payments"
on public.pfc_bill_payments for insert to authenticated
with check (auth.uid() = user_id and public._pfc_owns_instance(product_instance_id));

drop policy if exists "Users can delete their own PFC bill payments" on public.pfc_bill_payments;
create policy "Users can delete their own PFC bill payments"
on public.pfc_bill_payments for delete to authenticated
using (auth.uid() = user_id);
