# Changelog

## [1.0.0] — 2026-09-08

Initial MVP. Development frozen at this tag.

### Products

Nine ship, each with its own tables, row-level security, accent, printables,
first-run tour and installable app identity.

Paid: Personal Finance Companion, Home Base, ADHD Life Companion,
Homeschooling Companion, Personal Life Affairs Companion, Travel Companion,
Vehicle Maintenance Companion, Family Health Binder.
Free: Monthly Money Reset.

### Commerce

- Lemon Squeezy overlay checkout on Draftpace's own domain, as merchant of
  record. All eight paid products buyable and grantable end to end.
- `order_created` webhook verifies its HMAC signature, resolves the product
  from an explicit variant map, and grants through a service-role-only
  function. No client-reachable route can grant a paid product.
- `/app/welcome/<slug>` after payment, which waits for the grant rather than
  racing it, and never tells a paying customer their purchase failed.
- Priced at $49 and $34, at 50% off a $99 and $69 list.

### Platform

- Per-product PWA: own manifest, scope, name and icon, installable from
  inside each product on iOS, Android and desktop.
- Offline navigation serves the app's own offline page.
- Public site, product shell and admin on one design system.
- Free product at `/free`, kept out of the priced catalogue.

### Known limitations

Stated, not hidden. See `SECURITY.md` and `docs/RUNBOOK.md`.

- Refunds do not revoke access automatically.
- No reviews or social proof anywhere, because there are no customers yet.
  Nothing is fabricated to fill the gap.
- Vehicle Maintenance Companion's accent is a desaturated olive that reads
  close to grey in marketing imagery.
