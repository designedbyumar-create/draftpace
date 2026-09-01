# Draftpace North Star

**Status:** Locked source of truth. Supersedes the *positioning altitude* of every
other doc. When another document contradicts this one on *what Draftpace is* or
*how it should feel*, this wins. This does not replace the *build* docs
(`PRODUCT-FRAMEWORK.md`, `DATA-BOUNDARIES.md`, etc.), those still govern *how*
it's engineered. This governs *why it exists and what it must feel like.*

**Owner:** Founder (product designer). **Editor of record for this file:** kept
in sync as direction sharpens. Locked ≠ frozen, it changes deliberately, not by
drift.

---

## 1. What Draftpace is (one paragraph)

Draftpace is a **first-party studio that makes and sells living digital
products.** People already buy digital products to solve real problems, planners, spreadsheets, printables, template packs. Those products die on
download. Draftpace sells the same intent, delivered as a product that is
*alive*: an installable PWA that remembers you, responds to you, guides you,
keeps your work ready, and adapts when your situation changes. Every Draftpace
product is a self-contained, premium experience with its own world; the store
that holds them is one coherent, curated canon. Draftpace makes all of it, there is no third-party seller. The brand is the promise: **if it's a Draftpace
product, it's alive, premium, and yours.**

## 2. Why we exist (the enemy)

**The digital-products economy sells artifacts that peak at checkout and decay on
download.** A PDF planner, a Gumroad sheet, a Notion template, a hyperlinked
tablet file, maximum value is the moment you pay. After that it's a file in a
folder you forget. The seller was paid for a promise a static file cannot keep,
because a static file cannot *do* anything.

We exist to end that. **Value must activate at first use and compound over time,
not peak at purchase.**

## 3. Positioning: the empty quadrant

Two incumbents, each missing half:

- **Static sellers** (Etsy / Gumroad / Notion templates / printables): high
  desire, zero life after purchase.
- **Generic browser tools / SaaS**: some life, but utilitarian, rented-feeling,
  and forgettable, nobody is *proud* to own one.

Draftpace occupies the empty quadrant: **bespoke · premium · owned · alive.**
Boutique digital products that behave like they're with you and feel like
high-end apps. The moat is not a feature, it is **craft plus continuity** at a
level the template sellers can't reach and the generic-SaaS crowd won't bother
with.

## 4. The root concept and its naming

- **Root concept (locked):** a Draftpace product is a **living product**: it
  persists, remembers, responds, guides, and stays ready. This is the noun the
  whole system is built around.
- **Exact consumer-facing word (open):** "living," "live," or another term,
  decided in a dedicated naming pass. Lock the *meaning* now; keep the *label*
  provisional. Do not let interim wording ("living product") harden into brand
  copy by accident.
- **"Companion" is demoted.** It is no longer the name of the thing. It survives
  only as the **deep end of a spectrum** (see §5). Companion-specific vocabulary
  (`momentum`, `next-action`, `recovery`) belongs inside products that earn it,
  never in platform-level language or naming.

## 5. Living is a spectrum, not one archetype

Not every product should notify, nag, or coach. A calculator that pings you
weekly is obnoxious. The catalogue spans a range, and **every point on it is
still "alive"**: it remembers, stays ready, and feels premium:

```
LIGHT ─────────────────────────────────────────────────────► DEEP
one-shot tool     saved workspace     tracker      guided program     companion
(decide once,     (returns with       (log &       (staged, checks    (guides, notifies,
 remembers)        your state)         trend)        in over time)      captures momentum)
```

**Design law:** presence is earned. A product only gets to interrupt (notify,
prompt, check in) in proportion to how deep on this spectrum it sits. Lighter
products are quiet and just *remember*; deeper products are present *with
restraint.* Companion ≠ nag is a hard line.

## 6. The Pillars (design against these)

Each pillar has a **Law** and a **Design test**, the question that tells you
you're violating it.

**P1: The product is the hero; the platform is the stagehand.**
*Law:* platform chrome (store shell, nav, account) is quiet, elegant connective
tissue. The product is the thing you feel.
*Design test:* on any product screen, if the platform frame competes with the
product for attention, the frame is wrong.

**P2: Value activates, then compounds.**
*Law:* design every product around first-use payoff and return-value, never
around the download or the purchase.
*Design test:* what does this deliver in the first 60 seconds, and why is it
better the fifth time than the first? If there's no answer, it's a file, not a
product.

**P3: Each product is a world; the store is a canon.**
*Law:* products get their own identity, type expression, color world, materials,
motion character, component skins, not an accent swap. The store stays coherent
and curated across all of them.
*Design test:* could you tell two Draftpace products apart with the labels
covered? If not, they're recolored clones, a failure.

**P4: Living, not static.**
*Law:* every product remembers state, survives leaving and returning, and adapts
when the situation changes. Nothing resets you to zero.
*Design test:* leave mid-task, return three days later on another device, does
it drop you exactly where you were and ask only what changed? If not, it's not
alive.

**P5: Presence with restraint.**
*Law:* it earns the right to be present. Notifications, prompts, and check-ins
are proportional to the product's depth (§5) and always in service of the user's
momentum, never engagement metrics.
*Design test:* would a thoughtful person feel *helped* or *pestered*? If there's
any doubt, it's too much.

**P6: Owned, not rented.**
*Law:* the felt sense is "I bought a real thing, it's mine, it's installed, it's
ready." Not a subscription treadmill, not a tab you might lose.
*Design test:* does the experience reward *returning* rather than *paying again*?

## 7. Design philosophy: premium by synthesis, never by clone

The bar is **top-tier premium.** The current system is a competent foundation
with no expression layer, which is why it reads as capable-wireframe. We raise it
by principle, not by decoration.

- **Study the best; clone none.** Learn *principles* from Apple and the strongest
  premium apps, restraint, real materiality and depth, typographic confidence,
  optical spacing, motion as feedback (not ornament), one focal moment per
  screen, generous negative space, microinteractions that feel physical. Then
  build a **distinctly Draftpace voice.** Referencing a principle is required;
  copying a layout, component, or look is forbidden.
- **Distinctiveness is a requirement, not a nice-to-have.** "Looks like a nice
  iOS app" is a failing grade. Draftpace must be recognizably itself.
- **Never solve flatness with noise.** No gradients-as-crutch, decorative blobs,
  icon-per-card, or motion-for-motion's-sake. Depth comes from hierarchy,
  material, type scale, and space, earned, not sprinkled.
- **Calm and confident over busy and loud.** Premium reads as *sure of itself*:
  fewer elements, more intention, nothing hedged.

## 8. The two-layer design system (the mid → premium fix)

The single biggest structural reason the current UI reads "mid" is that it
**conflates foundations with expression and then expresses nothing.** The system
splits in two:

- **Foundations (shared, invisible, boring on purpose):** grid, spacing rhythm,
  the type *engine* (optical sizing), color/contrast primitives, elevation and
  **material** tokens, motion primitives, focus and accessibility guarantees.
  Every product inherits these; none of them carry identity.
- **Expression Kits (distinct, visible, where identity lives):**
  - a **Store Kit**, the premium storefront and platform shell voice.
  - a **Product Identity Kit** contract every product ships, its own type voice,
    color world, materials, motion character, and component skins, all *within*
    the Foundations' accessibility bounds.

This Product Identity Kit is a real contract and is **far beyond today's
`themeExtension`** (accent + palette only). It is what makes a Draftpace product
feel like a boutique app instead of a template. Building this layer is the
central design-systems task of the next phase.

## 9. The store and navigation

- **The store is the front door, and it is product-forward.** You don't explain a
  store, you show great products in it. Discovery leads with the products
  themselves, presented richly, with their own identity previewed.
- **App-type navigation, not a solutions funnel.** The "What do you need help
  with?" funnel framing is retired. Navigation is clean and app-like, Store,
  (Categories when inventory warrants), Account/Library, the way a premium
  app-maker's store is navigated, not a lead-gen questionnaire.
- **Education is secondary.** How-it-works, guides, and trust content support the
  sale; they never lead it and never outrank the products.

## 10. The product is the marketing

**Rule:** the product experience *is* the pitch. The whole promise is "the same
thing you'd buy, but alive and premium", so if the product itself doesn't feel
like a boutique app, no storefront copy can rescue it.

**Sequencing consequence (locked):** perfect *one* product to the full premium
bar before investing in the store/marketing around it. A finished, alive,
beautiful product makes the store nearly sell itself. This is why the marketing
side stays deliberately incomplete until the product is real. **First product to
prove the thesis: Monthly Money Reset.**

## 11. PWA realism

App-like-and-installable is real leverage, but platform-fragile, mobile OSes
(especially iOS) throttle PWA notifications and install unevenly, and that
landscape shifts. Therefore:

- **The "alive" feeling must not depend on push firing.** It is carried primarily
  by design, continuity, memory, and state, with notifications as an *amplifier*
  where the platform allows, never the load-bearing differentiator.
- Treat installability and notifications as progressive enhancement: excellent
  when available, and the product still feels alive and premium when they aren't.

## 12. Relationship to existing docs

- **Consistent with, and sharpening:** `PRODUCT-PLATFORM.md` /
  `DECISIONS.md` already say Draftpace is an extensible platform for interactive
  digital products, Companions are one family, and it is not a browse-for-its-own-sake
  marketplace. This North Star keeps all of that and sharpens the *why*
  (the dead-file economy) and the *bar* (boutique/premium/alive) those docs
  underplay.
- **The open framework still holds and is now load-bearing.** The no-switch,
  register-yourself product framework is exactly how we keep every product a
  distinct *world* (P3) without clones or per-family hacks. The Product Identity
  Kit (§8) rides on top of it.
- **Altitude split:** this doc = brand/experience truth (why, what it feels
  like). Framework docs = build truth (how it's engineered). Both apply.

## 13. Deliberately left open (own passes)

- The exact consumer-facing word for a "living product" (§4).
- The Draftpace brand voice/visual identity spec and the Store Kit (§7-8), a
  design exploration, not a decision to rush here.
- The full Product Identity Kit contract's fields (§8), defined against Monthly
  Money Reset's real needs first, then generalized.

## 14. How to use this document

Before shipping any screen, flow, product, or piece of copy, run it against the
Pillars' design tests (§6) and the philosophy (§7). If a decision optimizes for
engineering convenience, generic consistency, or "another card because the
component exists" at the cost of a pillar, the pillar wins. When in doubt about
*what Draftpace is or how it should feel*, this document is the answer.
