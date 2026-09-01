-- Travel Companion: trips, travellers, destinations, bookings, and the
-- dependency tree between bookings.
--
-- Phase 1 of the approved proposal
-- (docs/products/TRAVEL-COMPANION-PROPOSAL.md). Additive only. Nothing
-- here touches any existing table, and this product shares no schema
-- with its five siblings beyond product_instances and entitlements.
--
-- THE TIER, LIKE HOMESCHOOLING COMPANION'S
--
-- One product instance per account (continuous, never cycle-keyed), and
-- inside it, trips: user-created top-level records, the same shape as
-- Homeschooling Companion's children. "Japan 2026" and "Japan 2027" are
-- two rows here, not two product instances, which is what lets a later
-- trip deterministically read an earlier one's recorded places
-- (trv_record_entries, a later migration) without any cross-account
-- reach.
--
-- WHY TRANSPORT, STAYS AND RESERVATIONS ARE ONE TABLE
--
-- A flight, a train, a hotel and a restaurant reservation share the
-- same real shape: a provider, a reference, a date and time, a place, a
-- status, a note. als_items and pla_items already prove the pattern
-- this follows: one table, a kind column, and one repository, rather
-- than seven nearly-identical ones with seven nearly-identical RLS
-- policies to keep in sync forever.
--
-- WHY DEPENDENCIES ARE A TREE, NOT A GRAPH
--
-- Every booking depends on at most one upstream booking
-- (depends_on_booking_id, nullable, self-referential). A flight can be
-- the upstream of both an airport transfer and a hotel check-in at
-- once (one-to-many is native to a tree); nothing here supports a
-- booking depending on two upstream things, on purpose. A general graph
-- is exactly the "visual spaghetti diagram" the founder's brief warned
-- against, and a tree cannot become one by construction: there is
-- always exactly one path from any booking back to what it depends on.
-- Links are created only by an explicit user action in the application
-- layer, never inferred here or anywhere else from time, place or
-- booking kind.
--
-- THE BOUNDARY THIS SCHEMA ENFORCES: NO MONEY
--
-- There is no amount, currency, balance or split column anywhere below,
-- on purpose. The founder's own decision: Travel Companion may mention
-- money in free text (a booking's notes, a thread's title, a later
-- migration), and must never compute one. Adding a numeric money column
-- here later is not a small addition; it is the product becoming a
-- second Personal Finance Companion, and this comment is the tripwire
-- for whoever is tempted to add one.
--
-- DOCUMENTS ARE A LATER MIGRATION AND A REGISTRY, NOT A VAULT
--
-- No file is stored by this product. See the Phase 0 proposal section 9
-- for why: no product on this platform stores a file today, and this is
-- the single most sensitive category of data (passports, visas) any
-- product here would hold if it did.

begin;

-- Ownership helper, mirroring public._als_owns_instance. Separate
-- function per product so one product's RLS can never be widened by a
-- change made for another.
create or replace function public._trv_owns_instance(p_instance_id uuid)
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

-- --------------------------------------------------------------- trips
create table if not exists public.trv_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  title text not null,
  -- User-entered on creation ("Tokyo · Kyoto · Osaka"). Not derived from
  -- trv_places on write, so a trip can exist and read sensibly before
  -- any destination row does. Application code may refresh it from
  -- places once they exist; the column itself never blocks on that.
  destination_summary text,
  starts_at date,
  ends_at date,
  status text not null default 'planning' check (status in ('planning', 'active', 'past', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trv_trips_instance_idx
  on public.trv_trips (product_instance_id, status);

-- -------------------------------------------------------------- people
create table if not exists public.trv_people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  trip_id uuid not null references public.trv_trips(id) on delete cascade,
  name text not null,
  is_child boolean not null default false,
  -- Free text, never a closed relationship enum: "Umar and Roha's
  -- daughter" says more than any dropdown could hold.
  relationship_note text,
  requirements text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
  -- No user_id link to an auth account for a child, ever: children do
  -- not log in, same rule as Homeschooling Companion's children. This
  -- table has no such column at all, so there is nothing to leave null
  -- by convention; the absence is structural.
);

create index if not exists trv_people_trip_idx
  on public.trv_people (trip_id, status);

-- -------------------------------------------------------------- places
create table if not exists public.trv_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  trip_id uuid not null references public.trv_trips(id) on delete cascade,
  name text not null,
  ordinal integer not null default 0,
  arrives_at date,
  departs_at date,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trv_places_trip_idx
  on public.trv_places (trip_id, ordinal);

-- ------------------------------------------------------------ bookings
create table if not exists public.trv_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  trip_id uuid not null references public.trv_trips(id) on delete cascade,
  place_id uuid references public.trv_places(id) on delete set null,
  kind text not null check (
    kind in ('flight', 'train', 'car', 'transfer', 'hotel', 'rental', 'activity', 'restaurant', 'event', 'other')
  ),
  title text not null,
  provider text,
  reference text,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  booking_status text not null default 'confirmed' check (booking_status in ('confirmed', 'waiting', 'cancelled')),
  -- The tree. See the file header: at most one upstream booking, set
  -- only by an explicit user action, never inferred.
  depends_on_booking_id uuid references public.trv_bookings(id) on delete set null,
  notes text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trv_bookings_not_self_dependent check (id <> depends_on_booking_id)
);

create index if not exists trv_bookings_trip_idx
  on public.trv_bookings (trip_id, status);
-- Today's derivation reads this shape on every render; see §11 of the
-- proposal.
create index if not exists trv_bookings_today_idx
  on public.trv_bookings (trip_id, starts_at)
  where status = 'active';
create index if not exists trv_bookings_depends_on_idx
  on public.trv_bookings (depends_on_booking_id)
  where depends_on_booking_id is not null;

-- ------------------------------------------------------ booking people
-- Many participants per booking, many bookings per person. Carries a
-- status column like every table above it, for the same reason: adding
-- the wrong person to a booking is a mistake, not history, and it has
-- to be correctable without this being the one table in the product
-- that needs a delete policy to fix a mistake in.
create table if not exists public.trv_booking_people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  booking_id uuid not null references public.trv_bookings(id) on delete cascade,
  person_id uuid not null references public.trv_people(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Partial, not a table-level unique constraint: unlinking (archiving) a
-- person and later relinking them to the same booking must be possible,
-- which a plain unique(booking_id, person_id) would block forever once
-- one archived row existed for that pair.
create unique index if not exists trv_booking_people_active_link_idx
  on public.trv_booking_people (booking_id, person_id)
  where status = 'active';

create index if not exists trv_booking_people_person_idx
  on public.trv_booking_people (person_id, status);

commit;
