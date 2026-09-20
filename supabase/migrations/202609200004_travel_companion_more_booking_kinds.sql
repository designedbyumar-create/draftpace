-- Travel Companion: four more kinds of booking (bus, ferry, campsite, cruise).
--
-- Widens the check constraint on trv_bookings.kind. Every kind that was
-- allowed before is still allowed, so no existing row is affected; the
-- constraint is replaced rather than altered because Postgres has no way
-- to add a value to a check in place.
--
-- The list here must equal BOOKING_KINDS in src/products/travel-companion/
-- trip.ts. A test holds the two together.
--
-- No policy changes and no data changes.

begin;

alter table public.trv_bookings
  drop constraint if exists trv_bookings_kind_check;

alter table public.trv_bookings
  add constraint trv_bookings_kind_check check (
    kind in (
      'flight', 'train', 'bus', 'ferry', 'car', 'transfer', 'hotel', 'campsite', 'cruise',
      'rental', 'activity', 'restaurant', 'event', 'other'
    )
  );

commit;
