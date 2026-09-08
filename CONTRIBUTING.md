# Working in this repository

Draftpace is proprietary and closed to outside contributions. This document
exists so that anyone with access — including future you, and including AI
assistants — works the same way.

`CLAUDE.md` is the operating manual. This is the short version.

## Before you write anything

Read `docs/DECISIONS.md`. Most constraints here were argued once and settled.
If you are about to work around one, you are probably about to reintroduce a
problem somebody already solved.

Then check whether the thing you are about to build exists. `src/design-system/`,
`src/product-framework/` and the other products are the three places to look.

## The gates

All four, clean, before anything merges. CI runs them too, but do not use CI
as your first check.

```bash
npx tsc --noEmit
npx eslint .
npm run test
npm run build
```

## Tests

Guards, not coverage. The test suite exists to catch the class of bug that no
type error and no failing build would find: a stale claim in shop copy, a
product with a live checkout and no way to grant it, a service worker that
never registers.

**A test you have never seen fail is not yet known to work.** After writing a
guard, break the code it guards and confirm it fails, with a message that
names the actual problem. Several tests in this repository would have caught
nothing until that step found they were asserting the wrong thing.

Co-locate unit tests next to the file they test. Cross-cutting guards go in
`src/__regression__/`.

## Comments

Explain *why*, and especially why not. A comment that restates the code is
noise; a comment recording the alternative that was tried and failed is the
most valuable thing in the file. Several files here carry a "what went wrong
before this existed" note. Keep writing those.

## Adding a product

1. `src/products/<slug>/definition.ts` — versioned, Zod-validated metadata.
   Include a `pwa` block with its own icons; a test enforces this.
2. One import and one array entry in `src/products/manifest.ts`. Nothing else
   in the framework should need to change. If it does, the framework is wrong.
3. A migration in `supabase/migrations/`, with its own table prefix and its
   own row-level security.
4. `src/shop/products/<slug>.ts` for the listing.
5. Its Lemon Squeezy Buy Link **and** numeric variant id, in
   `src/shop/lemonSqueezyCheckout.ts` and `src/shop/lemonSqueezyVariants.ts`.
   A live checkout with no variant mapping takes money and grants nothing;
   a test fails if you ship one.

## Copy

- No em dashes in public copy. Enforced by `src/__regression__/public-copy.test.ts`.
- Never fabricate a review, a metric, a customer count or an activity feed.
  If it does not exist yet, say so.
- Write from the reader's side of the screen. Name things by what a person
  recognises, not by how the system is built.

## Commits

Say what changed and why it mattered. A commit message is the only place the
reasoning survives; the diff already shows the what.
