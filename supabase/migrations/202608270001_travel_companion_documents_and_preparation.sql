-- Travel Companion: documents (a registry, never a file) and
-- preparation (a user-defined checklist, no seeded content).
--
-- Both were specified in the approved proposal's own data model
-- (docs/products/TRAVEL-COMPANION-PROPOSAL.md §8) but never assigned a
-- phase number in the phase table; this migration is that gap closed,
-- ahead of the change-impact walk this same phase also builds.
--
-- DOCUMENTS ARE STILL A REGISTRY, NOT A VAULT
--
-- kept_where records where a document lives ("Photo in Umar's phone",
-- "Printed in the front pocket"), never the document itself. No file
-- column exists here, on purpose, same as every sibling on this
-- platform, see proposal §9.
--
-- WHY BOTH TABLES GET A LIFECYCLE status SEPARATE FROM THEIR OWN
-- DOMAIN STATE
--
-- trv_bookings already set this precedent: `status` is the soft-delete
-- lifecycle every table on this platform uses instead of a delete
-- policy, and a domain-specific state (there, booking_status) is a
-- second, independent column. Preparation's own open/done state is
-- exactly that kind of domain state, so it is named completion_status
-- here rather than status, keeping status free for the same
-- active/archived lifecycle every other table already has. The
-- proposal's own schema sketch named preparation's column status; this
-- migration corrects that ahead of ever shipping it, rather than
-- carrying the collision into the one table that would otherwise have
-- no way to soft-delete a checklist item added by mistake.

begin;

-- ----------------------------------------------------------- documents
create table if not exists public.trv_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  trip_id uuid not null references public.trv_trips(id) on delete cascade,
  person_id uuid references public.trv_people(id) on delete set null,
  booking_id uuid references public.trv_bookings(id) on delete set null,
  kind text not null check (
    kind in ('passport', 'visa', 'insurance', 'confirmation', 'ticket', 'agreement', 'other')
  ),
  label text not null,
  kept_where text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trv_documents_trip_idx
  on public.trv_documents (trip_id, status);

-- --------------------------------------------------------- preparation
create table if not exists public.trv_preparation (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  trip_id uuid not null references public.trv_trips(id) on delete cascade,
  category text not null check (
    category in ('documents', 'packing', 'transport', 'money', 'home', 'people', 'bookings')
  ),
  -- User-defined, no seeded content: nothing here is a generic packing
  -- list nobody asked for, per the brief's own ban on invented content.
  title text not null,
  completion_status text not null default 'open' check (completion_status in ('open', 'done')),
  notes text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trv_preparation_trip_idx
  on public.trv_preparation (trip_id, status);

commit;
