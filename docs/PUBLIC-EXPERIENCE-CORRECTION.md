# Public Experience Correction

Record of why the public site is being rebuilt again, immediately after
Phase 2 shipped a working one. Phase 2's public site was accurate and
architecturally sound, but it explained Draftpace the way an engineer would
describe it internally, not the way a visitor arrives at it.

## What was wrong, specifically

The Phase 2 homepage led with "An extensible product platform," "Product
families," "What makes it a Draftpace product," and a capability list
(tailored setup, memory, interpretation, direction, momentum, recovery,
identity). All of that is true and all of it is internal. A visitor doesn't
arrive looking for a platform, a family, or a capability. They arrive with a
situation: too much to track, a plan that stopped making sense, a decision
they're stuck on.

Visually, the page leaned on the same handful of patterns repeatedly: small
icon-in-a-square plus heading plus one sentence, arranged in three- and
six-item grids, inside bordered cards. Clean, but generic and low in
interaction. Nothing on the page demonstrated what using Draftpace actually
feels like.

## What this pass changes

- Rewrites the homepage and navigation around what a visitor is trying to
  do, not the architecture underneath it. Family/platform language moves out
  of primary copy; the product-framework naming stays exactly where it
  belongs, in `docs/PRODUCT-FRAMEWORK.md` and the admin surfaces, unchanged.
- Adds a small number of real interactions (a messy-to-clear demonstration,
  a needs-based chooser, a continuity sequence) instead of another icon
  grid.
- Introduces `/shop` as the customer-facing name for browsing products, with
  its own public data model, kept deliberately separate from the internal
  product-framework registry (`docs/DATA-BOUNDARIES.md` still applies:
  nothing here overrides that boundary — see `docs/SHOP.md`).
- Verifies and hardens authentication configuration validation rather than
  redesigning the auth architecture, which Phase 2 already got right.

## What does not change

`/app/**`, `/admin/**`, the product-framework contracts, family registries,
development fixtures, and product runtime behavior are unchanged in this
pass. See `docs/DECISIONS.md` for the full accounting of what Phase 2
established and what stays intact here.
