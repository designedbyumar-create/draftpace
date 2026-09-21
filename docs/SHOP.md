# Shop

The Shop (`/shop`, `/shop/[productSlug]`) is the customer-facing way to
browse what Draftpace sells. It has its own data model
(`src/shop/definition.ts`, `src/shop/registry.ts`), separate from the
internal product-framework registry described in `PRODUCT-FRAMEWORK.md`.
`DATA-BOUNDARIES.md` still governs the underlying platform/product-instance
data; this document only covers the public listing layer sitting in front
of it.

## Why a separate model

The product-framework definition describes how a product plugs into the
platform: family, capabilities, navigation, `dataSchemaRef`. A Shop listing
describes how a visitor should understand the same product before they've
used it: the problem it solves, who it's for, what happens after purchase.
Those are different documents serving different readers, and conflating
them would leak internal registration concerns (capability names, family
slugs) into customer-facing copy — the exact mistake this pass corrects.

Registering a product in the product framework does not publish it in the
Shop, and publishing a Shop listing does not register a product. A human
makes both decisions separately and deliberately.

## Publication status

Every `ShopProduct` has a `publicationStatus` of `draft`, `published`, or
`archived`. Only `listPublished()` (status `published`, and not a
dev-only fixture in this environment) is ever shown on `/shop`, included in
`sitemap.ts`, or eligible for structured data. `/shop/[productSlug]`
resolves a non-published slug to `notFound()` and never renders draft or
archived content to a visitor.

## The content model

A listing's persuasive content lives in three fields, and one listing is
the single source feeding two surfaces: the public Shop page and the
owner's manual at `/app/library/[productSlug]`.

- **`questions`** — every worry, asked once, each tagged with the moment
  it matters (`stage: ["deciding"]`, `["owning"]`, or both). The Shop
  page renders the deciding half; the manual renders the owning half.
  Somebody who already paid does not need the pitch answered again.
- **`searchedProblems`** — how people describe the problem before they
  know a product like this exists, in their words rather than the
  product's. These are sourced, not invented: from the `PROBLEM_ENTRIES`
  aliases and guide titles in `src/content/`, or from research done for
  the listing and cited in its own doc comment when the knowledge layer
  had nothing.
- **`tasks`** — what an owner opens the manual to do, each row linking to
  the destination it happens on, because the answer to "how do I do
  this" is being taken there. A `destination` must be one the product
  actually declares; `contentCollapse.test.ts` asserts that, since a
  wrong id is a 404 nothing else would catch.

`objections`, `outcomes` and `faqs` are the older shape and are now empty
on every published listing. They measured 75-81% duplicate against each
other: the Shop page rendered objections and faqs a few hundred pixels
apart, and outcomes restated a `problemsSolved` solution word for word,
so the same sentence was read three times. The fields and the
`allQuestions()` fallback still exist because that is what let the nine
listings migrate one at a time, and because the two internal layout
fixtures still use the old shape.

## Development fixtures

`src/shop/fixtures/` follows the same rule as the product-framework
fixtures in `DATA-BOUNDARIES.md`: gated by the shared
`areDevFixturesEnabled()` check, flagged `devFixture: true`, never given a
real price or marked `structuredDataEligible`, and excluded from the
sitemap. They exist to preview the Shop's layout with more than one item,
not to represent real inventory. If no real product is published, `/shop`
shows an honest empty state rather than filling the page with fixtures.

## What's still deferred

Ratings, reviews, and any other data collected from real customer
purchases: none of these exist, and `index.test.ts` bans the vocabulary
of fabricated social proof from every listing.

Checkout is partly wired. A product with an entry in
`CHECKOUT_URL_ENV_BY_SLUG` (`src/shop/lemonSqueezyCheckout.ts`) and its
environment variable set gets a real checkout; one without either gets
`GetAction`'s honest "Checkout opens soon" pending state rather than a
dead or fake link. Five paid products are in that map today (PFC, Home
Base, PLA, Homeschooling, Alongside); Travel Companion, Vehicle
Maintenance Companion and Family Health Binder are deliberately absent,
which is the mechanism keeping their checkout a placeholder, not an
oversight. Monthly Money Reset is free and activates directly.

## The product detail page

Below the buy box, the page is one tabbed panel (`DetailTabs.tsx`), not a
column of nine sections: The problem, What's included, How it works, Is it
for you, Questions, Data and refunds. Every panel is in the page's HTML
whether or not it is showing, so nothing is lost to a crawler or to
find-in-page, and a tab named in the URL hash (`#questions`) opens on
arrival. Long lists show their first few items with the rest behind a plain
disclosure (`Fold` in `page.tsx`). The listing fields feed the same panels
as before; nothing in `src/shop/products/` needed to change, but a listing
that runs to twelve inclusions or nine steps now costs the reader one line
until they ask, so write the first three of each as the ones that matter.

The page went from roughly 1,800 visible words and 7,000px to about 550
words and 2,800px on first view.
