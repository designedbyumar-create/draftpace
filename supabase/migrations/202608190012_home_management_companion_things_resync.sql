-- Home Base v2: re-run the hmc_appliances -> hmc_things backfill one more
-- time. Application code (attention.ts, Workspace, Attention) switched to
-- reading hmc_things in Phase 4a; anything added through the still-live
-- Appliances screen between the original 202608190008 backfill and this
-- migration would otherwise be invisible to Attention until Phase 4b
-- replaces that screen. Safe to run any number of times: `on conflict (id)
-- do nothing` means an appliance already copied over is skipped, never
-- duplicated or overwritten.

begin;

insert into public.hmc_things (
  id, user_id, product_instance_id, name, type, brand, model,
  purchase_date, install_date, warranty_expires_at, document_link, notes,
  status, needs_review_reason, source, import_session_id, created_at, updated_at
)
select
  id, user_id, product_instance_id, name, category, brand, model,
  purchase_date, install_date, warranty_expires_at, document_link, notes,
  status, needs_review_reason, source, import_session_id, created_at, updated_at
from public.hmc_appliances
on conflict (id) do nothing;

commit;
