# Draftpace App Experience Design: Landing to First Product

**What this is.** The screen-by-screen experience design for the platform layer,
from a stranger landing on the site to opening the first product they own. It
defines, per surface, the **decisions** (purpose, dominant action, structure,
states, what to show and hide) and the **content** (the actual copy). This is the
spec implementation follows.

**Status:** Working design, pending founder sign-off on the decisions in §14.
Sits under [`DRAFTPACE-NORTH-STAR.md`](DRAFTPACE-NORTH-STAR.md),
[`DRAFTPACE-MARKETING-EXPERIENCE-DIRECTION.md`](DRAFTPACE-MARKETING-EXPERIENCE-DIRECTION.md),
and the audit. Pillars referenced as **P1 to P6**.

**Scope.** Platform experience only. The product's own internals (the MMR
Workspace, Setup, Safe-to-Spend design) are deliberately out of scope and come
later, per founder direction. This designs everything up to and including the
*hand-off* into a product, not the product itself. Visual and pixel specs
(exact palette, type sizes, motion timings) also follow; here we fix structure,
hierarchy, and copy.

**Voice.** All copy follows the marketing doc: human, calm, specific,
problem-first, no em dashes, no system vocabulary.

---

## 1. The journey in one view

```
STRANGER                                                         OWNER
   │                                                               │
  Land ─► Recognize ─► Understand ─► Want ─► Choose ─► Get ─► (Auth) ─► Arrive ─► Open
   │         │            │           │        │        │       │         │        │
 homepage  "that's me"  "it's alive" product  store   add/buy  only if  first-run  product
                                      page                     needed    Home       entry
```

**The emotional spine (what each step must move):**
guilt or anxiety → "that is me" → "oh, it is alive" → "I can see myself using
this" → calm decision → frictionless get → seamless arrival → confident first
open.

**The one rule that governs all of it (P1):** the platform is the stagehand.
Every screen below exists to move the person one step along that spine and then
get out of the way. If a screen does not move the emotion forward, it does not
belong.

---

## 2. Customer states this journey must serve

We design each surface for the states that actually occur in this journey, not
all twelve from the audit:

| State | Where it shows up | What changes |
|---|---|---|
| New signed-out visitor | Landing, Store, Product page | Sell and reassure; no account assumed |
| Visitor ready to get a product | Product page, Get, Auth | Minimum friction; preserve intent across auth |
| Brand-new account, zero-to-one | Auth, first-run Home | Invite to open the thing they just got, nothing else |
| Returning owner | Home, a product's own companion page | Continue outranks discover; do not re-sell what they own |
| Returning visitor, no account | Landing, Store | Treat as new but lighter; "sign in" available, not loud |

Two states dominate and must be flawless: **"ready to get a product"** (the
conversion moment) and **"brand-new account, zero-to-one"** (the moment they
either feel invited or abandoned).

---

## 3. Navigation and information architecture

**Decision: retire the funnel, adopt an app-style, product-forward model
(audit NAV-1, §26; marketing §7).** The current "What do you need help with?"
nav is a lead-gen questionnaire and is removed.

**Public (signed-out) top bar**
```
[Draftpace]        Store      How it works      [ Sign in ]   [ Browse the Store ]
```
- **Store** is the front door and the primary destination. You show products; you
  do not interview the visitor.
- **How it works** is the single education entry (guides, trust, about live under
  it and in the footer, never competing with the Store).
- Primary action for a stranger is **Browse the Store**, not "Open your library"
  (which dead-ends a first-timer at login, audit PUB-3). "Sign in" is quiet.

**Platform (signed-in) navigation — superseded by a sidebar, not a top bar
(see §10).** The original plan below was a horizontal "Home / Library /
Store / bell / Account" bar, with Library as a dedicated owned-collection
page. What shipped instead, after further iteration, reads:

```
Home
MY COMPANIONS
  (one row per owned product, straight to its own companion page)
+ Explore Companions
Notifications · Account · Settings · Billing · Support
```

- There is no separate "Library" page or destination. Every owned
  product already has its own row in the sidebar's "My Companions"
  section — that row *is* the re-entry point the old Library page
  existed to provide, one click closer than a page you'd have to open
  first. See §10 for what replaced Library and why.
- "Store" as a top-level nav item became "+ Explore Companions," in the
  sidebar rather than a top bar, for the same reason: discovery sits
  beside what you already own instead of competing with it for a bar
  slot.
- Notifications, Account, Settings, Billing and Support remain separate
  rows rather than one collapsed menu — the single-menu idea below was
  never built this way.
- The always-on "Online" pill and the omnipresent theme toggle are removed
  (audit NAV-2, NAV-3); theme lives in Settings.

**The seam between public and app.** When a signed-in user lands on the public
site, the top bar's primary action flips from "Browse the Store" to **"Open
Draftpace"** (goes to Home), and the Store still sells only what they do not own.
When a signed-out visitor tries to reach an owned-only surface, they hit auth
with their intent preserved (§8).

**On "stores" (plural), a decision for you (§14):** this design assumes **one
Draftpace store** with categories. If you mean genuinely separate storefronts per
product family, the IA still holds (categories become storefronts), but confirm.

---

## 4. Landing (public homepage)

**Route:** `/` · **State served:** new signed-out visitor (and returning).

### Decisions

- **Purpose:** in five seconds, make the right person feel "this understands my
  situation," then hand them to the Store wanting to look.
- **Dominant action:** one primary, **Browse the Store**. A single quiet
  secondary, "See how it works." No competing third CTA.
- **Structure (sequenced by emotion, not features, audit PUB-1):**
  1. **Recognition hero.** The problem in the visitor's own voice + the living
     demonstration (the messy-to-one-step interaction already exists and is
     strong; keep it as the anchor). Primary CTA here.
  2. **The shift.** One section that names the enemy gently: most digital
     products die on download; a Draftpace product stays with you. Show it doing
     one thing a file cannot (remembering, updating).
  3. **The proof.** The one real product, shown (a real view of the product, not
     a bullet list). This is where the Store preview lives.
  4. **The reassurance.** "It will not abandon or judge you" (recovery framing).
  5. **Trust, brief.** Who makes it, how data is handled, honest and short.
  6. **Close.** Repeat the single primary action.
- **Rhythm decision:** vary section pace and ground (one tinted or inverted band)
  so the page has a crescendo instead of eleven identical bordered bands. Cut the
  two weakest current middle sections.
- **State awareness:** signed-in visitors see "Open Draftpace" as the primary and
  do not get re-pitched.

### Content

- **Hero headline:** "Turn a messy situation into a clear next step." *(Keep the
  current line's spirit; it is already strong. This is the baseline to sharpen,
  not replace.)*
- **Hero subline:** "Draftpace makes small, guided products that solve one real
  problem and stay with you. Not another file you forget."
- **Primary CTA:** "Browse the Store" · **Secondary:** "See how it works"
- **The shift, section eyebrow + line:** "MOST PLANNERS ARE A FILE YOU FORGET" /
  "A Draftpace product remembers where you were, updates when things change, and
  is there when you come back."
- **Reassurance line:** "Fall behind? It does not show you a wall of overdue
  tasks. It asks what changed and gives you one small next step."
- **Close CTA:** "Find the one that fits your situation" → Store.

---

## 5. The Store (front door)

**Route:** `/store` (rename from `/shop` for the app-style model, or keep
`/shop`; decision in §14) · **State:** visitor browsing.

### Decisions

- **Purpose:** help the right person choose, with confidence, fast. Not a
  browsing destination for its own sake.
- **Dominant action:** open a product's page. Everything supports that.
- **Structure at low inventory (audit SHOP-1):** with one or a few products, the
  Store is **product-forward, not a catalogue grid with holes**. Present the real
  product(s) richly (a real preview image, the promise, price or "free," a direct
  "See how it helps"). The category-grouped two-column grid switches on
  automatically only past roughly four products. Never show empty category
  headers or half-empty rows.
- **What to show per product card:** the situation it solves (in their words),
  "free" or price, and a single action. Not internal terms (family slugs,
  capability names).
- **Trust framing kept (audit SHOP-3):** "Free tools are complete, not
  stripped-down previews. Paid tools are billed once, not a subscription, unless
  a listing says otherwise."
- **State awareness:** a signed-in owner sees owned products marked "You own
  this, open" instead of a buy action.

### Content

- **Store headline:** "Find the one that fits your situation."
- **Store subline:** "Every product here is built around one specific problem.
  Free and paid work the same way: your progress saves to your account either
  way."
- **Single-product presentation (MMR example):**
  - Eyebrow: "MONEY" · Title: "Monthly Money Reset" · Tag: "Free"
  - Promise: "Know what is safe to spend this month, protect what must be paid,
    and see the next useful move. Not a budget."
  - Action: "See how it helps"
- **Empty store (no published product):** "New products are on the way. Want to
  know when the first one lands?" with a single email capture, honest, not a fake
  grid.

---

## 6. Product page

**Route:** `/store/[slug]` · **State:** visitor deciding.

### Decisions

- **Purpose:** make one person *want* one product, and resolve their distrust as
  desire builds (the market objects before it desires, marketing §4).
- **Dominant action:** get it. The action is **always within reach** (a sticky or
  repeated add/buy control), not buried mid-page (audit SHOP-2).
- **Structure (compress the current 19 sections into ~6 movements, audit
  SHOP-2):**
  1. **Outcome hero with a real visual of the product.** This is the single
     biggest current gap: the page shows no picture of the product. Lead with a
     real view of the Safe-to-Spend interface and one working moment. Title,
     promise, price or free, primary action.
  2. **Who this is for and the situation** (their words).
  3. **What becomes easier** (concrete outcomes).
  4. **Objection resolution, near the decision:** abandonment, fit, and
     punishment or judgment, answered plainly. This is where the recovery promise
     lives.
  5. **Honest limits and privacy:** who it is not for; what is saved where.
  6. **Price and get,** repeated, with a short FAQ and related products.
- **Interaction:** ideally a small, sandboxed "try the core moment" for the free
  product. If not built yet, high-fidelity motion of the real UI. Progressive
  disclosure for depth (FAQs, how-it-works) via real disclosure semantics.

### Content

- **Hero:** Title "Monthly Money Reset" · Tag "Free" · Promise as above.
- **Primary action (free):** "Try it, free" · **(paid):** "Get it,
  [price]"
- **Objection block copy:**
  - "Worried you will abandon it like the others? It does the keeping-up, so you
    do not have to."
  - "Think a template cannot fit your situation? It asks about yours and shows
    only what matters."
  - "Afraid it will judge you? It is not a budget. Just a clear, calm picture, no
    lectures."
- **Honest limit:** "Maybe not for you if you want full accounting or investment
  tracking. This does calm, clear, monthly."
- **Privacy line:** "Only you can see your data for this product. It saves to
  your account, on every device."

---

## 7. Get it: the purchase and add moment

**State:** ready to get a product. Two paths, both designed here.

### 7a. Free add (real today)

**Route:** `/app/activate/[slug]` (safe GET confirmation) → POST grant.

- **Decisions:** the confirmation is calm and one-action. It already reads well
  (verified in testing). Keep: "Free" and family tags, two reassurance checks,
  one primary "Get it, free," a quiet "Not right now." Do not add friction.
- **After add:** go **straight to the product's first useful screen** (Setup for
  MMR), not a re-explainer, per the audit's first-run fix. The "you now own this"
  feeling is the product opening, not a receipt page.
- **Content:**
  - Title: "Get Monthly Money Reset, free"
  - Checks: "No payment now or later for this one." / "Your progress saves to your
    account automatically."
  - Action: "Get it, free" · Quiet: "Not right now"

### 7b. Paid purchase (designed-ahead, not built)

- **Decisions:** the paid path mirrors the free path's calm and adds only what is
  necessary: a clear price, what is included, and a single trustworthy checkout.
  No dark patterns, no fake urgency, no upsell wall (marketing HCI). Billed once
  by default, stated plainly. Payment credentials are entered only in the
  provider's own secure surface, never a Draftpace field.
- **After purchase:** identical to free, land in the product's first useful
  screen. Ownership feels like the product opening, not a thank-you page.
- **Content:**
  - Summary line: "One-time, [price]. Yours to keep. No subscription."
  - Reassurance: "You can start using it the moment you pay. Your progress saves
    to your account."
- **Flag (§14):** checkout, payment processing, and entitlement-on-purchase are
  not implemented. This section is the target experience, not a claim it exists.

### Objection-first principle (both paths)

Resolve the "will I abandon this / is this worth it" doubt *at* the get moment,
not after. Risk reversal for the catalogue is the free first product: lead with
it, let the experience earn the paid ones.

---

## 8. Auth: only when needed, intent preserved

**Routes:** `/login`, `/signup` · **State:** getting a product, or returning.

### Decisions

- **Purpose:** the smallest possible interruption. Auth appears **only when an
  action requires it** (getting a product, opening its companion page), never
  as a gate in front of browsing.
- **Preserve intent (audit AUTH-2):** when auth interrupts a get, name it. The
  screen says what they were doing, and completing auth drops them back exactly
  there, into the product they were adding.
- **Keep what works:** the current auth cards are clean and correct (verified).
  Google-first, email fallback, human errors, redirect preservation. Keep.
- **First account, reduce to essentials:** email, password, optional name.
  Nothing else stands between signup and the product.
- **Fix the two known issues:** the stale document title ("Digital products that
  remember you") and, separately, the Google callback false-failure (tracked
  elsewhere, not this doc's redesign).

### Content

- **Context line on an intent-driven auth:** "Sign in to add Monthly Money Reset
  to your account." (Derived from the destination, not a generic "Sign in to
  continue.")
- **Signup reassurance:** "Free to create. Your products and progress live here,
  on every device."

---

## 9. Arrival: first-run Platform Home

**Route:** `/app` · **State:** brand-new account, zero-to-one, or returning owner.
This is the highest-leverage screen in the whole journey and the weakest today
(audit PH-1).

### Decisions

- **Purpose:** answer one question, "what should I do next," with one dominant
  action. Never open on empty boxes.
- **Structure: one state-aware focal block, then a quiet remainder (audit §27):**
  - **Just got their first product (the zero-to-one moment):** the whole screen
    is one confident invitation to **open it**, in the product's own identity.
    Not a generic empty state, not three empty sections.
  - **Setup incomplete:** the focal block is "Finish setting up [product], step 3
    of 5," one action.
  - **Active:** the focal block previews the live product moment (its headline
    figure or next move) and continues it.
  - **Returning after a gap (behind):** "Welcome back. A few things may have
    changed. Update what is different, or pick up where you left off."
- **Suppress empty sections entirely (audit PH-1, PH-2):** "Attention needed" and
  "Notifications" render only when they have content. No reserved empty
  rectangles. Install-app prompt moves out of the top slot (audit PH-3).
- **Personal, not fake:** one warm line ("Good evening, [name]"), folded into the
  focal composition, not a separate greeting competing with a faint label.

### Content

- **Zero-to-one focal block (just added MMR):**
  - "You are all set, [name]. Open Monthly Money Reset to see what is safe to
    spend this month."
  - Action: "Open Monthly Money Reset"
- **Setup-incomplete focal block:** "Pick up where you left off: finish setting up
  Monthly Money Reset." Action: "Continue setup"
- **Active focal block:** "This month, you have [figure] safe to spend. Your next
  move: [next action]." Action: "Open Monthly Money Reset"
- **Behind focal block:** "Welcome back. It has been a while. Want to update what
  changed, or just pick up where you left off?" Actions: "Update what changed" /
  "Just continue"

---

## 10. My Companions: re-entry, no separate collection page

**Superseded design.** This section originally specified `/app/library`, a
dedicated owned-collection page distinct from Home. That page was built, then
deleted: every owned product already has its own row in the sidebar's "My
Companions" section, one click from anywhere in `/app`, so a second page that
only re-lists the same products added a stop without adding a capability.
What shipped instead:

### Decisions

- **Purpose:** re-entry to what you own, served by the sidebar itself rather
  than a page you'd have to open first. The "collection of owned experiences,
  not a filtered database" principle this section originally argued for
  (audit LIB-1) still holds, it is just realized as sidebar rows plus each
  product's own companion page instead of a list page.
- **Distinct from Home and Explore Companions:** Home = the one thing to do
  now; My Companions (sidebar) = everything you own, each one tapped straight
  into its own place; Explore Companions = things you do not own yet. These
  read as different things because they are different controls, not different
  states of one page.
- **Each sidebar row opens that product's own companion page** (`/app/
  companions/[productSlug]`), which carries the human status line ("This
  month, set up, $412 safe to spend") instead of raw values (`active`,
  `2026-08`), plus how-to-use content and ownership status for that one
  product. One clear open action, not a database row.
- **No filter bar to hide or reveal.** With re-entry living in the sidebar,
  the five-plus-owned filtering problem this section originally solved for
  does not arise: the sidebar lists every owned product in simple recency
  order and scrolls, rather than needing a second page's own pagination or
  filters.
- **Quiet path back to discovery** stays, as "+ Explore Companions" beneath
  the My Companions list rather than a line at the end of a library page.

### Content

- **Sidebar section header:** "MY COMPANIONS"
- **Companion-page status line (MMR example):** "Monthly Money Reset · This
  month · $412 safe to spend" · Action: "Open"
- **Empty (no products, should be rare post-onboarding):** Home's own
  empty/free-product state covers this; there is no separate "nothing here
  yet" page to design for.

---

## 11. Opening the first product (the hand-off)

**State:** the moment they cross from platform into a product. Platform side only;
the product's internal design is out of scope.

### Decisions

- **Purpose:** make entering a product feel like stepping into its own place, and
  make coming back out obvious.
- **The transition:** when they open a product, the platform navigation recedes
  and the product's world takes over (P1). This is correct today structurally; the
  gap is that the product's identity does not yet reach the shell frame (audit
  MMR-1), which is product-visual work, deferred.
- **The return path (audit SHELL-2):** the way back is always obvious and correct.
  Label it "Back to Draftpace" and return to Home (or to wherever they came from),
  not always to the same fixed destination.
- **First-open vs return-open:** on first open, land on the product's genuine
  first-value screen (Setup for MMR, which already delivers a live number so they
  are never staring at a blank result). On return-open, land on the live working
  screen (Workspace), not a re-explainer.
- **What the platform guarantees at the seam:** the session is loaded before the
  product reads its data (the fix proven in Phase 0), so opening never shows a
  false "not set up." Ownership and state are always correct at entry.

### Content

- **Return affordance:** "Back to Draftpace"
- **First-open orientation (platform-provided, one line):** "This is yours now. It
  saves automatically, so you can leave and come back anytime."

---

## 12. Content system for this journey

Rather than duplicate the marketing doc, this journey inherits its voice and
these journey-specific rules:

- **Every button names the outcome,** not the mechanism. "Open Monthly Money
  Reset," not "Launch." "Get it, free," not "Submit."
- **Every empty or first-run state offers a step,** never describes the system
  (audit COPY-2). "Start with Monthly Money Reset," not "products will list here."
- **No system vocabulary at the seam** (audit COPY-1): no "instance," "entitlement,"
  "cloud state," "cycle key," raw lifecycle enums, or family slugs in anything a
  customer reads. Translate: "This month," "Saved to your account," "In progress."
- **Auth and errors are blameless and human** and name the destination.
- **No em dashes, anywhere.**

---

## 13. What is real today vs designed-ahead

Honesty about implementation status, so this doc is not mistaken for a claim of
what exists:

| Surface | Status |
|---|---|
| Landing, Store, Product page | Exist; need the restructure and copy above |
| Free add (`/app/activate`) | Real and proven end to end (Phase 0) |
| Paid purchase and checkout | **Not built.** §7b is target design only |
| Auth | Real; keep, with the two fixes noted |
| Platform Home | Real; rebuilt per §9, with product-accent theming and a status strip |
| My Companions (sidebar) + companion pages | Real; replaced the §10 library-page design with sidebar rows and a per-product companion page |
| Opening a product | Real; session-at-seam fixed in Phase 0; return path and identity-to-shell are follow-ups |

---

## 14. Decisions that need your sign-off

1. **Paid checkout: design and build now, or free-only for the first release?**
   §7b is designed either way, but building checkout, payment, and
   entitlement-on-purchase is a real chunk of work. If the first real products are
   free, we can ship the whole journey without it and add paid later.
2. **One store or many "stores"?** This design assumes one store with categories.
   Confirm, or tell me you mean separate storefronts per family.
3. **Route naming:** keep `/shop` or move to `/store` for the app-style model?
   Cosmetic but public and worth deciding once.
4. **The Draftpace brand and store visual identity is still undesigned.** This doc
   fixes structure and copy; the actual look of the platform and store (the
   neutral premium canon products pop against) is a separate design pass. Do you
   want to drive that visual identity, or have me propose it in code for you to
   refine?
5. **Build order:** which surface do we implement first? My recommendation in §15.

---

## 15. Recommended build order for this experience

Sequenced by leverage on the two make-or-break moments (conversion and
zero-to-one):

1. **Platform Home rebuild (§9).** Highest leverage; it is the weakest screen and
   defines the return and first-open feeling. State-aware focal block. Done.
2. **My Companions sidebar + companion pages (§10).** Owned-product re-entry;
   distinct from Home and Explore Companions. Done, superseding the original
   library-page design.
3. **Product page restructure (§6).** Visual-first, sticky get, compressed. This
   is the conversion surface and shows the product.
4. **Store front door (§5).** Product-forward, threshold-aware layout.
5. **Landing rhythm and copy (§4).** Already the strongest surface, so lowest
   urgency despite being the most visible.
6. **Navigation and account consolidation (§3).** Can land alongside 1 to 2.
7. **Auth polish (§8) and the seam return-path (§11).** Small, do opportunistically.

Paid checkout (§7b) slots in only if decision §14.1 says build it now.

---

*This designs the experience and the words. Visual identity, pixel specs, and the
product internals are the next passes, on top of this.*
