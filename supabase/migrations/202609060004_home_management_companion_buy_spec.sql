-- Home Base: the "what to buy" spec field (design-system pass, Phase 3).
-- A filter size, a part number, a bulb type, whatever fact somebody
-- actually needs at a hardware store to buy the right replacement,
-- distinct from brand/model (which identify the thing) and notes (which
-- is unstructured). Additive, nullable, same pattern as every other
-- identity fact already on hmc_things.

begin;

alter table public.hmc_things
  add column if not exists buy_spec text;

commit;
