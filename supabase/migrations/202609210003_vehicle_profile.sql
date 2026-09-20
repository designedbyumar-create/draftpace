-- Vehicle Maintenance Companion: what kind of vehicle it is.
--
-- Two optional facts about a vehicle, both typed or chosen by the person:
--
--   fuel_type  petrol, diesel, hybrid, plug-in hybrid, or electric. It decides
--              which jobs are worth suggesting: an electric vehicle has no oil
--              change and no spark plugs, a diesel has a fuel filter.
--   hard_use   whether the vehicle mostly does short trips, tows, or lives in
--              dust, heat or cold. It only decides whether the jobs it
--              suggests start with severe duty switched on.
--
-- Neither is looked up, decoded from a VIN or checked against anything, and
-- neither stores a schedule. The product still never claims to know a
-- manufacturer's intervals: these only shape a list of typical starting
-- points that the person can change.
--
-- Additive only. The existing owner-only select, insert and update policies
-- already cover new columns.

begin;

alter table public.vmc_vehicles
  add column if not exists fuel_type text
    check (fuel_type is null or fuel_type in ('petrol', 'diesel', 'hybrid', 'plugin-hybrid', 'electric')),
  add column if not exists hard_use boolean not null default false;

commit;
