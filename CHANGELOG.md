# Changelog

## [1.0.0] — 2026-09-09

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

### Presentation

- Product pages open on one anchored phone whose screen changes, drawn from
  the same screen map the shop card and the owner's manual read, so a buyer
  recognises afterwards what they were shown.
- 36 generated store images, four per product: one straight, whole phone on
  a pale ground computed through HSL rather than mixed with white, so a
  low-saturation accent still reads as its own colour instead of grey.
- Shop cards carry a screen frame rather than the titled cover, since the
  card already prints the title and the promise.
- Vehicle Maintenance Companion's accent moved off a near-neutral steel
  that made its call to action read as disabled.

### Known limitations

Stated, not hidden. See `SECURITY.md` and `docs/RUNBOOK.md`.

- Refunds do not revoke access automatically.
- No reviews or social proof anywhere, because there are no customers yet.
  Nothing is fabricated to fill the gap.
- The purchase chain is covered by automated checks but has not yet carried
  a real payment by a real buyer.
