# Product Platform

## What Draftpace is

Draftpace is an extensible platform for interactive digital products. A
"product" can be a Companion, a learning course, an automation tool, a
calculator/decision workspace, a guided program, or a tracker — and future
families that don't exist yet. Each product is a distinct, purpose-built
experience with its own terminology, workflow and visual identity. What makes
it a *Draftpace* product is that it sits on a shared foundation: one identity,
one ownership model, one cloud-state approach, one notification system, one
responsive shell, one versioning and operations model.

## What Draftpace is not

Not a generic productivity dashboard, not a marketplace where browsing is the
point, not a PDF/planner converter, not one universal template recolored per
audience, not an AI chatbot, and not a Companion-only platform. Companions are
one family; the platform must stay useful without them.

## Platform vs. product responsibilities

| Layer | Owns | Does not own |
|---|---|---|
| **Platform** | identity, entitlements, preferences, devices, library, notifications, privacy, global navigation | product-specific workflow or domain logic |
| **Product framework** | product registration, family/capability contracts, navigation resolution, version resolution, module registration, theme-extension contract | any single product's actual behavior |
| **Product** (per family) | its specific problem, workflow, data, terminology, rules, visuals | authentication, commerce, or duplicated platform infrastructure |
| **Admin** | creating, versioning, publishing, operating products and supporting customers | direct unsafe manipulation of user data or unversioned releases |

## Current shape of the repository

- **Public surface (today):** a real public homepage at `/` explaining the
  platform and product-family model, plus legal and content pages
  (`docs/ROUTE-MAP.md`). No waitlist gate — Phase 2 removed it.
- **Authenticated platform (`/app`):** Platform Home, Library, and five
  shared surfaces (notifications, account, settings, billing, support),
  protected by a real server-verified session.
- **Product experience (`/app/products/[productSlug]/...`):** a universal
  shell (`start / setup / workspace / progress / history / settings`) that
  renders based on a product's declared capabilities and navigation, not a
  hardcoded template.
- **Admin (`/admin`):** architecture scaffolding only — route, gating, and a
  static overview. No real product/version/customer management yet.

## Future sides of the platform (not built yet, tracked so nothing is forgotten)

- **Public acquisition:** product discovery, category/solution pages,
  pricing, learning/content area, real activation-link verification.
- **Customer platform:** notifications inbox, account, billing, devices and
  sessions, privacy/data controls, support.
- **Product operations:** Product Studio (create/preview/version/publish),
  release management, rollout/rollback.
- **Business operations:** customers, orders, entitlements, activation
  support, notification operations, support cases.
- **Analytics & technical operations:** activation/first-value/retention
  metrics, job/webhook visibility, error tracking, audit log.

None of this is implemented. It's named here so route and data decisions made
now don't foreclose it. See `ROUTE-MAP.md` for what's real vs. documented.
