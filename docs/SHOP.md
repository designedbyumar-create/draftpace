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

## Development fixtures

`src/shop/fixtures/` follows the same rule as the product-framework
fixtures in `DATA-BOUNDARIES.md`: gated by the shared
`areDevFixturesEnabled()` check, flagged `devFixture: true`, never given a
real price or marked `structuredDataEligible`, and excluded from the
sitemap. They exist to preview the Shop's layout with more than one item,
not to represent real inventory. If no real product is published, `/shop`
shows an honest empty state rather than filling the page with fixtures.

## What's explicitly deferred

Checkout, payment processing, entitlement granting, ratings, reviews, and
any other data collected from real customer purchases. This document
describes the listing layer only.
