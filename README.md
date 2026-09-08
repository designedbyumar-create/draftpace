# Draftpace

**Companions for the parts of life that are hard to keep track of.**

Draftpace is an extensible platform for personalised digital products. Nine
products ship today, each built around one specific problem that is genuinely
hard to hold in your head: money, the house, starting things, home education,
what happens after you die, a trip, a vehicle, a family's health.

Each product is bought once and owned. No subscription, no renewal.

- **Live:** https://draftpace.com
- **Status:** v1.0.0, MVP frozen. See [CHANGELOG.md](CHANGELOG.md).

---

## What this is, in one paragraph

One Next.js application, not a monorepo. A **platform layer** provides
identity, entitlements, cloud state, the responsive shell and the design
system. A **product framework** lets each product register itself with
versioned, Zod-validated metadata, so the shell never branches on which
product it is showing. Nine **products** sit on top, each owning its own
database tables, its own row-level security, its own accent colour and its
own installable app identity. Commerce runs through Lemon Squeezy as merchant
of record.

The architecture is deliberately open at the top: the shell has no idea what
a "Companion" is, so a future learning product or automation tool can be added
without renaming anything or rewriting the platform.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS over a token system in `src/app/globals.css` |
| Data | Supabase (Postgres + Auth via `@supabase/ssr`), row-level security throughout |
| Payments | Lemon Squeezy (merchant of record, handles VAT/GST) |
| Hosting | Vercel |
| Motion | Framer Motion, via named presets in `src/design-system/motion.ts` |
| Testing | Vitest (2,350 tests), Playwright for end-to-end |
| Offline | Service worker + per-product PWA manifests |

## Running it

```bash
npm install
cp .env.example .env.local   # then fill in at least the Supabase values
npm run dev
```

Visit `http://localhost:3000/signup` to create an account, then `/app`.
`/admin` is reachable automatically outside production.

`.env.example` documents every variable, what it is for, and which ones are
genuinely secret. Only one of them is required for a purchase to work:
`LEMON_SQUEEZY_WEBHOOK_SECRET`. Without it a customer is charged and granted
nothing.

## Quality gates

Four commands. All four must be clean before anything merges, and
[CI](.github/workflows/ci.yml) runs them on every push and pull request.

```bash
npx tsc --noEmit
npx eslint .
npm run test
npm run build
```

Two ESLint warnings are known and pre-existing. Zero errors is the bar.

## Where things are

```
src/
  app/                  Routes. (marketing) is public, app/ is signed-in, admin/ is operational.
  design-system/        Primitives and tokens. One system for every surface.
  product-framework/    The registry, contracts and theming every product registers with.
  products/<slug>/      One product: definition, domain logic, components, printables.
  shop/                 Listings, pricing, Lemon Squeezy checkout and variant mapping.
  components/           Shared UI: platform, product shell, public site.
  __regression__/       Guards for behaviour that no type error would catch.
supabase/migrations/    Schema, in timestamp order. Each product owns its own prefix.
docs/                   See the index below.
```

## Documentation

Start here, in this order:

| Document | Read it when |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | You want the whole system in one sitting |
| [docs/DECISIONS.md](docs/DECISIONS.md) | You are about to argue with a constraint |
| [docs/RUNBOOK.md](docs/RUNBOOK.md) | Something is broken right now |
| [CLAUDE.md](CLAUDE.md) | You are writing code here, human or otherwise |

Reference, as needed:

| Document | Covers |
|---|---|
| [docs/PRODUCT-PLATFORM.md](docs/PRODUCT-PLATFORM.md) | What Draftpace is and is not |
| [docs/PRODUCT-FRAMEWORK.md](docs/PRODUCT-FRAMEWORK.md) | The registry and product contracts |
| [docs/PRODUCT-FAMILIES.md](docs/PRODUCT-FAMILIES.md) | The six registered families |
| [docs/DATA-BOUNDARIES.md](docs/DATA-BOUNDARIES.md) | Platform vs product vs instance state |
| [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Tokens, primitives, the two button registers |
| [docs/ROUTE-MAP.md](docs/ROUTE-MAP.md) | Every route and what protects it |
| [docs/COMMERCE.md](docs/COMMERCE.md) | The purchase flow end to end |
| [docs/ADMIN-AND-OPERATIONS.md](docs/ADMIN-AND-OPERATIONS.md) | The admin shell |
| [docs/SUPABASE-SETUP.md](docs/SUPABASE-SETUP.md) | Setting up the database from scratch |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deploying to Vercel |
| [SECURITY.md](SECURITY.md) | Reporting a vulnerability, and the security model |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Working in this repository |

`docs/archive/` holds superseded planning documents. They record how
decisions were reached and are not current guidance.

## The rules that matter most

These are enforced by tests, not by convention. Breaking one fails CI.

1. **No fabricated data, ever.** No invented reviews, metrics, activity or
   customer counts. Anything not built yet renders an honest empty state.
2. **Products never read each other's data.** Each owns its table prefix and
   its own row-level security.
3. **The shell never branches on product identity.** Families and capabilities
   are open, namespaced strings, not closed unions.
4. **`/app` requires a real, server-verified session.** Not a client-side check.
5. **Anything buyable must be grantable.** A live checkout with no variant
   mapping takes money and gives nothing back.

## Licence

Proprietary. All rights reserved. See [LICENSE](LICENSE).
