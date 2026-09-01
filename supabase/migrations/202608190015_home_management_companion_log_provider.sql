-- Home Base: link a completed job to the person who did it.
--
-- hmc_maintenance_log has carried performed_by (free text) and cost_minor
-- since it was created, and nothing has ever written either. That is why
-- "who fixed the AC last time?" is currently unanswerable and why
-- providers are a disconnected address book: no event has ever pointed at
-- one.
--
-- provider_id is the real join. performed_by stays for rows that name
-- someone who was never saved as a provider, and for the rows already in
-- the table.
--
-- Additive and nullable. On delete set null, so removing a provider never
-- destroys the history of the work itself.

begin;

alter table public.hmc_maintenance_log
  add column if not exists provider_id uuid references public.hmc_service_providers(id) on delete set null;

create index if not exists hmc_maintenance_log_provider_idx on public.hmc_maintenance_log (provider_id);

commit;
