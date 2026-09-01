# Draftpace Platform Experience Audit

**Author:** Lead product designer / UX architect / product-systems review
**Phase:** Read-only analysis. No code, copy, migration, or config was changed to produce this document.
**Branch:** `claude/draftpace-rebuild`
**Date:** 2026-08-01

## How to read this document

Every major finding is tagged:

- **Surface**: the route or component it lives in.
- **Type**: `visual` · `structural` · `content` · `interaction` · `technical` · `mixed`.
- **Priority**: `P0 critical` (blocks launch or the core loop) · `P1 high` · `P2 medium` · `P3 polish`.
- **Evidence**: `rendered` (I loaded it in a browser and looked) or `source` (read in code only). Per the agreed method, authenticated surfaces (`/app/**`, product shell, Monthly Money Reset) are **source only**, activation currently fails and I did not fix it to get past the gate. The public site, Shop, product page, auth, mobile, and dark mode are **rendered**.

Findings carry stable IDs (e.g. `PH-1`) so they can be referenced in later implementation work.

---

## 1. Executive verdict

Draftpace is **architecturally further along than it is experientially resolved.** The foundations the reset set out to build are real and, in several places, genuinely good: server-verified auth, an open (non-switch-statement) product framework, one honest design system, a scoped product-theme mechanism, and a public homepage whose copy and interactions are markedly better than the "generic/bland" reputation the brief carries forward. The homepage in particular is a strength, not a weakness, I verified this by rendering and operating it, and I want to correct the brief on that point up front.

The problem is that **the experience thins out and loses conviction exactly where the business is won or lost:** at the transition from "interested visitor" to "person using a product." Three things drive the verdict:

1. **The core loop is not provable end to end.** Activation returns `?error=1`. The near-certain cause (evidence in §9 and §16) is that the Supabase migration this product depends on was never applied, the docs themselves say so. Until that is resolved, *no one can reach* Platform Home with a product, the Workspace, Safe-to-Spend, Progress, or History in a real session. The single most important thing Draftpace has to prove, that a messy situation becomes a clear next step, is currently unreachable by a customer.

2. **The authenticated shell reads as a competent wireframe, not a finished product.** Platform Home leads with a small "Continue" label and then two permanently-empty boxes ("Attention needed", "Notifications"). The navigation gives five account destinations equal weight with the two that matter. Library is a filtered list. None of this is broken; all of it communicates "SaaS scaffolding" rather than "a calm place that knows what I'm doing."

3. **The catalogue is one product, and the surfaces that should sell it are built for a catalogue that doesn't exist yet.** The Shop renders one card in a two-column grid under a category header, leaving half the page empty. The product page is 19 stacked text sections with no picture of the actual product. The strongest asset Draftpace has built, the forest/ivory Safe-to-Spend interface, is shown to a prospective user *nowhere* before they commit.

**The good news:** the fixes are mostly composition, prioritization, and one migration, not a rebuild. The framework and design system can carry the experience the North Star describes. This audit is therefore weighted toward *what to make dominant, what to remove, and what to prove*, not toward adding components.

**Launch-readiness, one line:** not launch-ready, because the free product cannot currently be activated and the first-run/continuation experience has no dominant next action. Both are addressable inside the existing architecture.

---

## 2. Draftpace North Star

> Note (added Phase 0): this section captures the North Star as understood at
> audit time. The canonical, founder-approved North Star now lives in
> [`DRAFTPACE-NORTH-STAR.md`](DRAFTPACE-NORTH-STAR.md); where the two differ,
> that document wins. The rest of this audit stands as a point-in-time analysis.

Draftpace turns messy situations into clear next steps and keeps a person's work ready so they can return and continue instead of rebuilding. It is an extensible platform of focused, purpose-built tools, not a dashboard, marketplace, planner shop, or generic SaaS shell. Success is measured by feel: *this understands what I'm trying to do; I can see what matters now; I don't have to figure it all out at once; I can leave and return without losing the thread; when things change I update the plan instead of starting over; falling behind isn't punishment; and it feels calm, capable, and deliberately designed.*

The architecture is deliberately broad and open; the customer experience must feel singular and intentional. **The recurring failure mode across this audit is the architecture's genericness leaking upward into the experience as sameness**, identical card rows standing in for Home, Library, and Shop; system vocabulary in customer-facing states; equal visual weight given to things of unequal importance.

---

## 3. Current end-to-end customer journey

Traced through source and (where reachable) live render:

```
PUBLIC                         AUTH                    PLATFORM                 PRODUCT
/  homepage ──► /help-with ──► (browse)
            └─► /shop ──► /shop/[slug] product page
                                │
                                ▼  "Add free to my library"
                          /app/activate/[slug]  (safe GET confirmation)
                                │  proxy.ts redirects signed-out ─► /login?redirectTo=…
                                ▼  POST /api/products/[slug]/activate
                                   grant_free_product() ─┬─ ok  ─► /app/products/[slug]/start
                                                         └─ err ─► /app/activate/[slug]?error=1   ◄── CURRENTLY HERE
                                                                         │ (blocked)
        PLATFORM HOME /app  ◄──── (owned) ────────────────────────────  │
        LIBRARY /app/library                                            ▼
        ACCOUNT SURFACES (notifications/account/settings/billing/support)
                                                          PRODUCT SHELL /app/products/[slug]/
                                                          start · setup · workspace · progress · history · settings
```

**The break is at activation.** Everything to the left of the POST is reachable and I reviewed it live. Everything to the right of a successful grant is currently unreachable in a real session and was reviewed in source.

The journey's *shape* is right, discover → understand → add → (auth if needed) → start → set up → work → continue. The weaknesses are in the transitions: the product page under-sells, activation is broken, and Start Here / Setup / Workspace stack three sequential full-page gates before the first genuinely useful screen.

---

## 4. Current route and experience map

| Surface | Route | Evidence | One-line experience read |
|---|---|---|---|
| Homepage | `/` | rendered | **Strong.** Problem-led copy, real interactions. Too many same-tempo full-width bands (11). |
| Help-with hub | `/help-with`, `/help-with/[need]` | source | Needs-based chooser; funnels to Shop. |
| How it works / Guides / About / Trust / Support / Accessibility | `/(marketing)/*` | source | Content pages, consistent system. |
| Shop index | `/shop` | rendered | **Thin.** One card in a 2-col grid under a category header; half the row empty. |
| Product page | `/shop/[slug]` | rendered | Thorough but all-text; 19 sections; no picture of the product; CTA buried mid-page. |
| Auth | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback` | rendered (login) | Clean, centered, correct. Server protection verified. |
| Activate | `/app/activate/[slug]` | source | Well-designed confirmation card. **Downstream POST fails.** |
| Platform Home | `/app` | source | Small "Continue" label + 2 permanently-empty sections. No dominant action. |
| Library | `/app/library` | source | 5 filter tabs over a plain list; reads as a database. |
| Account surfaces | `/app/{notifications,account,settings,billing,support}` | source | Honest `unavailable` rows; Billing entirely vestigial today. |
| Product shell | `/app/products/[slug]/{start,setup,workspace,progress,history,settings}` | source | Universal, family-aware. Product identity confined to module bodies, not shell chrome. |
| Admin | `/admin/**` | source | 11-section operational shell; 3 sections live, rest honest-empty. |

---

## 5. Strongest parts of the platform

These are assets to protect, not touch:

- **`S1`: Homepage copy and interactions.** *(rendered)* "Turn messy plans into clear next steps," the messy-notes-to-one-step hero demo, the "instead of a dashboard" section, the continuity sequence, the "welcome back" recovery framing. This is human, specific, on-message writing with genuine interaction, not an icon grid. It already embodies the North Star better than any other surface.
- **`S2`: The design tokens and typographic system.** *(source + rendered)* Fraunces-for-display / Inter-for-UI is a real, restrained identity signal. The indigo `--primary`, muted semantics, no-gradient rule, tightened radii, and full dark-mode token set are coherent and premium-leaning. Dark mode renders correctly.
- **`S3`: The product framework's openness.** *(source)* Families and capabilities are validated namespaced strings resolved through registries; the shell composes from declared `navigation`/`capabilities` with no `switch(family)`. This is the right bones for "products that don't exist yet."
- **`S4`: The Safe-to-Spend card and setup live-preview.** *(source)* The forest/ivory card with the large Fraunces number, the expandable calculation breakdown, the "May be out of date" staleness cue, and the setup-time live preview are the most *product-feeling* things in the codebase. This is what should be shown to prospects.
- **`S5`: Honesty discipline.** *(source + rendered)* No fabricated metrics, charts, or customers anywhere. `unavailable` states are truthful. This is rare and valuable; the fix is to make honesty *designed*, not to abandon it.
- **`S6`: Real security posture.** *(source + rendered)* Server-verified sessions (`proxy.ts`), POST-only activation, DB-side eligibility allowlist, `security definer` write functions. Verified `/app` → `/login?redirectTo=%2Fapp`.

---

## 6. Weakest parts of the platform

- **`W1`: Activation is broken (P0).** The core loop cannot be completed. §9, §16.
- **`W2`: Platform Home has no dominant action and two permanent empty boxes (P0/P1).** §10.
- **`W3`: The Shop and product page under-sell the one product that exists (P1).** They show no picture of the product and are scaled for a catalogue that isn't there. §8.
- **`W4`: Product identity is confined to module bodies; the shell chrome is generic (P1).** A product is supposed to feel like its own place; the frame around it doesn't. §13, §14.
- **`W5`: Navigation gives five account destinations equal weight with the two that matter (P1).** §12.
- **`W6`: Three sequential full-page gates (Start Here → Setup → Workspace) before the first useful screen (P2).** §13.
- **`W7`: Same-tempo full-width band rhythm makes long pages feel undifferentiated (P2).** Homepage (11 bands) and the 19-section product page. §7, §8.

---

## 7. Public website assessment

**Surface:** `/` and `/(marketing)/*` · **Evidence:** rendered (home, shop, product), source (rest)

**The brief's suspicion is partly out of date, and I'm correcting it with evidence.** The homepage is not generic or over-carded. Rendered, it leads with a strong Fraunces headline, a working "messy → one clear step" demonstration, problem-led recognition copy in the customer's own voice, a needs chooser, a "not another dashboard" section, a six-beat continuity story, an adaptation before/after, a recovery "welcome back," a Shop preview, and a trust section. The writing is the best in the product.

**`PUB-1`: Undifferentiated section rhythm.** *(visual · P2 · rendered)*
- **Current:** Eleven full-width sections, each `py-16 sm:py-20`, each separated by a hairline `border-b`, most following eyebrow → serif headline → demo. Same container width, same vertical tempo, same divider.
- **Problem:** Individually good sections blur together because nothing changes pace. There's no crescendo, no moment of contrast, no visual rest. A visitor feels length rather than momentum.
- **Impact:** Scroll fatigue; the strong hero and strong Shop preview don't stand out because everything is equally spaced and equally bordered.
- **Direction:** Introduce deliberate rhythm, vary section background (a single tinted/inverted band around the continuity story or recovery moment, using existing `--surface-muted`/`--app-bg`, no new tokens), collapse two of the weaker middle sections, and let one section run edge-to-edge while the next is narrow. Keep every section; change the cadence. No new decoration.

**`PUB-2`: "Momentum OS" tagline under the logo.** *(content/brand · P2 · rendered)*
- **Current:** The brand logo SVG renders "Draftpace" with "Momentum OS" beneath it, in the public nav and platform rail.
- **Problem:** "Momentum OS" is companion/finance-era positioning that contradicts the locked "extensible platform, not a companion platform" decision. It's the one place internal legacy naming is customer-visible.
- **Impact:** Subtle but real dilution of the platform story at the most-seen element on every page.
- **Direction:** Founder decision (§35): either retire the "Momentum OS" lockup or formally adopt it as the tagline. Don't leave it as an unowned leftover.

**`PUB-3`: Two competing primary CTAs in the nav and hero.** *(interaction · P2 · rendered)*
- **Current:** Nav shows "Sign in" + "Open your library"; hero shows "Find help for what you're trying to do" + "Open your library." "Open your library" routes an unauthenticated visitor straight into the `/app` redirect → login.
- **Problem:** For a first-time visitor with no account, "Open your library" is a dead-end-feeling CTA (it bounces to login) competing with the genuinely useful "Find help." The primary path is ambiguous.
- **Impact:** Split attention at the top of the funnel; the strong "find help" path shares billing with a CTA that only makes sense for returning users.
- **Direction:** For signed-out visitors, demote "Open your library" to a quieter returning-user affordance ("Already have an account? Sign in") and let "Find help…"/"Browse the Shop" own the primary action. This is state-aware nav, covered again in §12.

---

## 8. Shop assessment

**Surface:** `/shop`, `/shop/[slug]` · **Evidence:** rendered

**`SHOP-1`: The index is scaled for inventory that doesn't exist.** *(visual/structural · P1 · rendered)*
- **Current:** One published product renders as a single card in a `sm:grid-cols-2` grid, under a `GET ORGANIZED` category header, with the entire right column and lower half of the page empty. Below it sit two prose blocks ("Choosing between tools," "Access").
- **Problem:** Category grouping + a two-column grid is a layout for a dozen products. With one, it reads as under-construction, the exact "looks empty / low inventory" impression the North Star warns against. The credibility cost is high: the Shop is where desire converts.
- **Impact:** A visitor's takeaway is "there's basically nothing here," undermining trust in the whole platform.
- **Direction:** Make the single-product (and few-product) Shop a *feature*, not a grid with holes. Give the one real product a full-width, richer presentation, promise, a real image/rendering of the Safe-to-Spend UI, "free," and a direct add, and drop the category header until ≥ ~4 products exist. The needs-grouping layout should switch on automatically past a threshold, not be the default at N=1. **This is structural state-awareness, the same principle as Platform Home.**

**`SHOP-2`: The product page tells but never shows.** *(visual/content · P1 · rendered)*
- **Current:** `/shop/[slug]` is a narrow single column of 19 stacked sections (who it's for, what becomes easier, how it works, inputs/outputs, saving, included, price, right-for-you, privacy, FAQs, related). All text, all left-aligned, uniform tempo. The MMR build plan explicitly defers screenshots ("added after the built UI can be reviewed").
- **Problem:** The product's entire appeal is a *visual* one, a beautiful, calm Safe-to-Spend number and a clear next move. Showing zero of that interface before asking someone to commit removes the strongest motivator. It also makes the page feel like a spec sheet, not a product.
- **Impact:** Lower activation intent; the page reads as thorough-but-flat and buries the "Add to my library" CTA around section 12 of 19.
- **Direction:** (1) Add a real hero visual near the top, a rendering/screenshot of the Safe-to-Spend card and one Workspace moment (the forest/ivory identity is the sales asset). (2) Promote a persistent/sticky "Add free, takes a few minutes" action so intent is always one tap away. (3) Compress the 19 sections into ~6 scannable movements with varied layout. Priority order: **visual first, then CTA prominence, then compression.**

**`SHOP-3`: Free/paid promise is good; keep it.** *(content · keep)* "Free tools are complete, not stripped-down previews" and "billed once, not a subscription" are exactly the right trust framing. Preserve.

---

## 9. Authentication journey assessment

**Surface:** `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`, `proxy.ts` · **Evidence:** rendered (login), source (rest)

The auth experience is **the most finished surface after the homepage.** Login renders as a clean, centered card: Google-first, "or sign in with email," inline validation, human error copy ("Wrong email or password. Double check and try again," and a distinct "Couldn't reach the account service" for network failures), a config-validity guard before attempting sign-in, and OAuth-redirect preservation via `storeOAuthRedirect`. Server protection is real and verified.

**`AUTH-1`: Stale document title on auth pages.** *(content/technical · P2 · rendered)*
- **Current:** The `/login` browser tab title is "Draftpace, Digital products that remember you", an older companion-era tagline, inconsistent with the homepage's "Turn messy plans into clear next steps."
- **Problem:** Legacy positioning leaking into metadata; minor brand incoherence and a second instance of the "remember you / Momentum OS" old-era language (see PUB-2).
- **Impact:** Low, but it's a visible-in-tab inconsistency and an SEO/title signal.
- **Direction:** Align the auth (and root) metadata with the current positioning.

**`AUTH-2`: "Sign in to continue" context is thin on redirect.** *(content/interaction · P3 · source)*
- **Current:** When `redirectTo !== "/app"` the login shows a generic `Alert: "Sign in to continue."` It never names *what* the user was trying to reach (e.g. activating Monthly Money Reset).
- **Problem:** A user bounced from activation to login sees a generic prompt, not "Sign in to add Monthly Money Reset to your library." Lost continuity at a high-intent moment.
- **Impact:** Small drop-off risk at the activation → auth → activation hop.
- **Direction:** Derive a friendly label from `redirectTo` and show it ("Sign in to add Monthly Money Reset"). Content-only change.

**`AUTH-3`: Signup/OAuth/callback reviewed in source only.** *(technical · note)* I could not exercise account creation, Google OAuth, or the callback end to end without creating an account (out of scope for a read-only pass and gated by real Supabase/Google config). Flagging that these are *unverified live*; they should be smoke-tested during implementation, especially the OAuth redirect round-trip.

---

## 10. Platform Home assessment

**Surface:** `/app` · **Evidence:** source (unreachable live, activation blocked)

This is the highest-leverage screen in the authenticated product and currently the weakest relative to its importance.

**`PH-1`: No dominant action; the page opens on a whisper.** *(visual/structural · P0 · source)*
- **Current:** Content order is: `InstallPromptCard` (conditional) → a `Continue` section behind an 11px uppercase `--faint` label → an `Attention needed` section that is *always* an `EmptyState` → a `Notifications` section that is *always* a "No notifications yet" surface. The greeting ("Good morning, {firstName}") lives up in the shell header, not in the content.
- **Problem:** The single most important question, "what should I do next?", is answered by a tiny label and a list of equal-weight cards, while two permanently-empty boxes take up the majority of the first screen. There is no visual center and no dominant next action. This is the "empty rectangles" concern, and it is accurate.
- **Impact:** A returning user with unfinished work has to *hunt* for it; a new user sees mostly emptiness. The screen communicates "scaffolding," directly contradicting "I can see what matters now."
- **Direction:** Rebuild Home as **one state-aware hero + a quiet remainder** (full structure in §27). The most useful thing, continue this product / finish setup / here's your Safe-to-Spend and next move, becomes a single large, product-identity-carrying focal block. "Attention needed" and "Notifications" only render when they have content; empty, they disappear rather than reserving space.

**`PH-2`: Empty sections describe the system instead of helping the user begin.** *(content/structural · P1 · source)*
- **Current:** With no products: `Continue` shows "Nothing to continue yet… Once you add something free or owned, the most relevant one to continue picks up here first" with a text link to the Shop; `Attention needed` and `Notifications` still render as empty boxes.
- **Problem:** The new-user Home is three empty containers and a sentence about how the system will behave later. It doesn't help the person *start*, it explains the mechanism.
- **Impact:** Weak first-run; the moment a new account should feel invited, it feels vacant.
- **Direction:** The zero-product Home should be a genuine first-run: one confident invitation ("Start with Monthly Money Reset, see what's safe to spend this month," free, one action) using the product's own identity, not a generic empty state. Suppress the other two sections entirely until they have content.

**`PH-3`: Install Draftpace sits at the top of the content column.** *(visual · P2 · source)*
- **Current:** `InstallPromptCard` is the first child of the Home content (it self-hides unless the browser fires `beforeinstallprompt`, so it is conditional, not always-on, the brief slightly overstates this).
- **Problem:** When it does appear, PWA install outranks the user's actual work at the top of Home. Installing is a nice-to-have, not the primary job of this screen.
- **Impact:** On the occasions it shows, it displaces the dominant action.
- **Direction:** Keep the capability but move it below the primary continue/first-run block, or into a dismissible slot in Settings/Account. It should never be the first thing above "what to do next."

**`PH-4`: Greeting is buried in the chrome.** *(visual · P3 · source)*
- **Current:** "Good {daypart}, {firstName}" is the shell `<h1>` in the sticky header; the content starts with the `Continue` label.
- **Problem:** The one personal, warm touch is in the chrome, disconnected from the content's purpose. The header greeting + a content label is two competing "starts."
- **Direction:** Consider folding a brief personal line into the Home hero itself so the greeting and the dominant action are one composition, not two.

---

## 11. Library assessment

**Surface:** `/app/library` · **Evidence:** source

**`LIB-1`: Reads as a filtered database, not a collection of owned experiences.** *(visual/structural · P1 · source)*
- **Current:** A five-tab filter bar (All / Active / Paused / Completed / Archived) sits above a plain `grid gap-3` of bordered rows. Each row: title, `family · Free · {cycleKey}`, a raw-lifecycle `Badge` (`active`), and a small action word ("Open" / "Finish setup" / "Review result"). `cycleKey` (e.g. `2026-08`) is surfaced as metadata.
- **Problem:** Filters-first is a database interaction; it presupposes enough inventory that filtering is the primary need. With one or two owned items, the tabs are noise and the list feels administrative. Raw values (`cycleKey`, the un-titled lifecycle badge) leak internal shape. The North Star explicitly warns against Library feeling like "a filtered database."
- **Impact:** Owning something feels like having a record, not a place to return to. It doesn't distinguish itself from the Shop or from Home's Continue list.
- **Direction:** Make Library a **collection of owned experiences** (full structure in §28): lead with the products themselves, each shown with its own identity (MMR's forest accent), a human status line ("This month · set up · £412 safe to spend" rather than `active · 2026-08`), and a clear open action. Hide the filter bar until the count crosses a threshold (~5). Distinguish Library from Home by *scope* (everything I own, browsable) vs. *urgency* (the one thing to do now), not by using the same card row.

**`LIB-2`: Library and Platform Home render nearly identical cards.** *(structural · P1 · source)*
- **Current:** `ContinueCard` (Home) and `LibraryCard` (Library) are almost the same bordered row with almost the same metadata and destination logic.
- **Problem:** If Home and Library look the same, the user can't feel the altitude difference between "what to do now" and "everything I own." The four-surface distinction (Home/Library/Shop/Workspace) collapses.
- **Impact:** Navigation feels redundant; two tabs that look like the same list.
- **Direction:** Deliberately differentiate: Home = one focal continuation; Library = the full owned set with identity and lifecycle. Shared data, distinct composition.

---

## 12. Navigation assessment

**Surface:** `PlatformShell` (desktop rail, mobile bottom nav, overflow sheet) · **Evidence:** source

**`NAV-1`: Five account destinations compete with the two that matter.** *(structural · P1 · source)*
- **Current:** Desktop rail = `Primary` (Home, Library) + an `Account` group of five equal links (Notifications, Account, Settings, Billing, Support) + Sign out. Mobile = 3-slot bottom bar (Home, Library, Account-sheet). The five account items are visually equal to each other and nearly equal to the two primary items.
- **Problem:** On a platform whose core loop is "continue your product," five account/admin-of-self destinations get a permanent, prominent, equally-weighted home in the rail. Billing in particular is entirely vestigial today (no purchases are possible; the page is all-empty/`unavailable`). This is the "account-management destinations competing with the core experience" concern, and it holds.
- **Impact:** The rail's center of gravity is account plumbing, not the work. Cognitive weight is spent on rarely-used destinations.
- **Direction:** Collapse Notifications/Account/Settings/Billing/Support into a **single profile/account menu** (avatar or "Account" at the rail bottom) that expands to the five. Keep Home and Library as the only top-level primary destinations, and add **Shop** as a first-class discovery entry (currently reachable from Home/Library empty states and links, but not a standing platform destination, a gap, since discovery is a core loop). Notifications can keep a lightweight top-bar bell with a count. This makes the rail: Home · Library · Shop · (Notifications bell) · Account-menu.

**`NAV-2`: Permanent "Online" pill with little user value.** *(visual · P2 · source)*
- **Current:** The top bar shows a persistent `Online`/`Offline` pill (desktop) plus "Draftpace"/"Draftpace, offline" eyebrow, driven by `navigator.onLine`.
- **Problem:** A green "Online" badge that is true 99% of the time is decoration that reads as status-theater. It only carries information in the rare offline case.
- **Impact:** Visual noise; a permanent element that mostly says nothing.
- **Direction:** Show a connectivity indicator **only when offline** (and let it actually change behavior, see the offline customer state in §21). Remove the always-on "Online" pill.

**`NAV-3`: Theme toggle is over-exposed.** *(visual · P2 · source)*
- **Current:** `ThemeToggle` appears in the platform top bar (desktop), the mobile overflow sheet, the product-shell top bar, and the admin header, i.e. nearly everywhere.
- **Problem:** Theme is a set-once preference; giving it standing real estate on every chrome contradicts the "theme controls too visible" concern and spends prominence on a rarely-changed control.
- **Impact:** Minor but pervasive visual weight on a low-frequency action.
- **Direction:** Keep theme in Settings (where it already is, well-presented) and in the account menu. Remove it from the persistent top bars. One discoverable home is enough.

**`NAV-4`: Sign-out styling risks accidental danger affordance.** *(interaction · P3 · source)*
- **Current:** Rail "Sign out" turns `--danger` red on hover; the mobile sheet renders it in danger red by default.
- **Problem:** Sign out is reversible and routine; danger-red is the vocabulary of destructive actions (delete). Slight semantic miscue.
- **Direction:** Treat sign out as neutral/muted, reserving danger color for genuinely destructive actions.

---

## 13. Monthly Money Reset assessment

**Surface:** `/app/products/monthly-money-reset/*` + `src/products/monthly-money-reset/*` · **Evidence:** source (unreachable live, activation blocked)

This is the product that has to prove the vision. In source it is **substantial and thoughtfully built**, and it contains the single most product-feeling UI in the codebase (Safe-to-Spend). It also has the clearest identity gap.

What's genuinely good (protect): the Safe-to-Spend card (`SafeToSpendCard`) with its large Fraunces figure, expandable seven-line calculation breakdown, negative-value handling, and staleness cue; the `NextActionCard` ("Your next move" → one labeled action); the five-step Setup with a sticky **live Safe-to-Spend preview** so you're never staring at a blank result; correct money semantics (integer minor units, expected income excluded until received, protected-bill accounting that doesn't double-count); and the forest/sage/ivory/clay theme mined from the prototype.

**`MMR-1`: Product identity stops at the module boundary; the shell around it is generic.** *(visual/structural · P1 · source)*
- **Current:** `ProductShell` renders the back-to-Library bar, the family eyebrow, the product title, and the destination tabs using **platform** tokens plus the generic `productThemeStyle(theme)` accent. The rich `--mmr-*` forest/ivory palette is applied **only inside module bodies**, via a `ThemeScope` wrapper each module opts into. So a user in the Workspace sees a generic indigo-accented frame wrapped around a forest-and-ivory interior.
- **Problem:** A product is supposed to feel like *its own place.* Right now the frame and the contents belong to two different visual systems. The identity that would make MMR feel bespoke is quarantined to the cards.
- **Impact:** The product reads as "platform component with a themed panel inside," not "a calm financial space." Undercuts the entire "products express their own character" pillar.
- **Direction:** Extend the scoped theme to the **whole product shell** (header, tabs, back bar) so identity is continuous from frame to content, while still respecting platform light/dark and accessibility. The theme mechanism already exists (`themeExtension.ts` + `ThemeScope`); this is about applying it at the shell root, not inventing anything.

**`MMR-2`: Two stacked tab systems in the Workspace.** *(structural/interaction · P2 · source)*
- **Current:** The product-shell destination nav (Start · Setup · Workspace · Progress · History · Settings) sits directly above the Workspace's own internal tabs (Overview · Activity · Spending plan · Bills). Two horizontal tab strips, different active-styling systems (shell tabs use `--primary`; workspace tabs use `--mmr-forest-900`), stacked.
- **Problem:** Two tab rows immediately adjacent is confusing hierarchy, the user must learn that one set switches "screens" and the other switches "views within a screen." The visual language differs, compounding it.
- **Impact:** Navigation ambiguity at the product's center; added learning cost right where focus should be highest.
- **Direction:** Either fold the four Workspace sub-views into the product identity's own tab styling (so it reads as one coherent system with a clear parent/child relationship), or reduce shell destinations shown while in the Workspace. Make the Workspace unambiguously the center; secondary views should feel nested, not sibling.

**`MMR-3`: Three sequential full-page gates before the first useful screen.** *(structural/interaction · P2 · source)*
- **Current:** A successful activation lands on `/start` (Start Here, an explainer with badges, "what you'll add," "what you'll get," a calculation explainer, and a primary "Set up this month"). Then `/setup` (5 steps). Then `/workspace`. Start Here largely re-explains what the Shop product page already explained.
- **Problem:** Between "I added this" and "I got something useful" are three full pages, the first of which is redundant with the pre-purchase page. Time-to-first-value is padded by an explainer the user just read.
- **Impact:** Friction at the most fragile moment (a brand-new, unconvinced user). Risk of drop-off before Safe-to-Spend ever appears.
- **Direction:** Send a freshly-activated user **into Setup directly** (Setup's own live preview already delivers a Safe-to-Spend number mid-setup, satisfying "never a blank screen"). Keep Start Here as a re-entry/overview surface for returning users, not as a mandatory gate on first run. This preserves the good content while removing it from the critical path.

**`MMR-4`: Setup length is appropriate; keep it progressive.** *(keep · source)* Five steps (This month → Income → Bills & reserve → Spending → Review) with a running preview and "change anything later" reassurance is the right amount of progressive. Do **not** shorten it into one long form; the staging plus live preview is a strength.

**`MMR-5`: Workspace risks tipping into a finance dashboard.** *(visual · P2 · source)*
- **Current:** The Overview tab is a two-column grid of bordered/`rounded-2xl` cards: Safe-to-Spend, Recently changed, Next move, What's protected, Upcoming bills, Weekly check-in, six panels.
- **Problem:** The North Star explicitly warns against "a card-heavy finance dashboard." Six equally-bordered panels is drifting that way; the hero (Safe-to-Spend + the one next move) should dominate far more decisively than "protected"/"upcoming"/"check-in" side cards.
- **Impact:** Dilutes the calm, single-focus feeling; makes the screen busier than the product's promise.
- **Direction:** Establish a strong hierarchy: Safe-to-Spend + Next move as the clear primary column; protected/bills/check-in as quieter, lighter-weight secondary content (less border, more type-and-space separation, per the design system's own "not everything in a card" rule). Fewer visible borders, one obvious focal point.

**`MMR-6`: Assessment of "does it prove the vision":** *Yes, in source, once reachable.* The pieces that matter (a clear number, a clear next move, honest calculation, recoverable check-ins, editable-anytime) are present and largely right. The blockers to it *proving* anything are: activation (MMR/§16), identity continuity (MMR-1), and focal hierarchy (MMR-5). None require rethinking the product.

---

## 14. Universal product-shell assessment

**Surface:** `ProductShell`, `navigationResolver`, `families`, `themeExtension` · **Evidence:** source

The shell does its structural job well: it resolves declared `navigation` (or family default), labels the Workspace per family, renders family-registered extra destinations, and applies a scoped theme without global CSS. The "no switch statements / register-yourself" design is real and future-proof for Learning, Automation, Tracker, Guided Program, Tool.

**`SHELL-1`: The shell has no product identity of its own (same root cause as MMR-1).** *(visual · P1 · source)*
- **Current:** The shell chrome is platform-generic; only the theme *accent* varies per product. Its own comment admits: "No product-specific visual identity yet beyond the scoped theme extension."
- **Problem:** If the shell frame stays generic, every future family will be a recolored clone, the exact outcome the brief warns against. The differentiation has to be structural (layout, density, tab treatment, header composition per family archetype), not just an accent swap.
- **Direction:** Define, at the shell level, how the six family archetypes differ *structurally* (e.g. Learning leads with progress/next-lesson; Tracker leads with a trend; Tool/Workspace leads with input→output; Companion leads with next-action + a hero figure). Let the theme extension carry color continuously (MMR-1) and let a small set of shell *layout archetypes* carry structure, so distinction is real, not paint.

**`SHELL-2`: Back-affordance always points to Library, even when the user came from Home.** *(interaction · P3 · source)*
- **Current:** The shell's top-left always reads "← Library."
- **Problem:** A user who entered the product from Platform Home's Continue card is sent "back" to Library, not Home. Minor thread-loss.
- **Direction:** Make the back target context-aware (referrer or a lightweight "came from" signal), or label it neutrally ("Back to Draftpace") pointing to Home.

**`SHELL-3`: Two-level navigation (platform rail lost inside product).** *(structural · P2 · source)*
- **Current:** Entering a product replaces the platform shell entirely with the product shell (its own header/back link); the platform rail is gone.
- **Assessment:** This is arguably *correct*, "platform navigation should recede while inside a product" is a stated principle, and it does. Keeping it as a note, not a defect: just ensure the return path (SHELL-2) is obvious so users don't feel stranded.

---

## 15. Account / settings / support assessment

**Surface:** `/app/{account,settings,billing,notifications,support}` · **Evidence:** source

These are **honest and correctly restrained**, the `SettingsRow ... unavailable` pattern truthfully marks unbuilt features, and the copy ("Data export and account deletion aren't built yet. Contact support if you need either…") is candid. Settings' real controls (theme, text scale, reduce motion, reminder time) work and persist.

**`ACCT-1`: Five destinations for what is currently ~1.5 screens of real content.** *(structural · P1 · source)*
- **Current:** Notifications, Account, Settings, Billing, Support are five separate top-level routes. Billing is entirely empty/`unavailable`; Notifications is an empty inbox; Support routes to email.
- **Problem:** Five destinations imply five substantial areas; today they're mostly placeholders. This is architecture pre-exposed to the user before it has content (ties to NAV-1).
- **Impact:** The account area feels bigger and emptier than it is.
- **Direction:** Group under one Account menu (NAV-1). Within it, **merge** what's thin: Billing can be a section inside Account until purchases exist, rather than a standing destination. Keep Settings distinct (it has real, used controls). Support stays but as a menu item, not a rail peer.

**`ACCT-2`: Real vs. placeholder is well-signposted; preserve the pattern.** *(keep · source)* The `unavailable` treatment is the right way to hold space for future capability honestly. Keep it; just stop giving each placeholder a top-level route.

---

## 16. Admin strategic assessment

**Surface:** `/admin/**` · **Evidence:** source

Strategic-only, per instruction. The admin shell is an 11-section operational IA (Overview, Products, Product families, Customers, Entitlements, Commerce events, Communications, Support, Analytics, Operations, Audit) with three sections reading live registry/flag data and the rest honest-empty. It's gated by `isAdminEnabled()` + real session, `force-dynamic`.

**Assessment: the IA is sound and forward-compatible.** It already names the surfaces a real operation needs (products, customers, entitlements, commerce, support, analytics, operations, audit). No architectural blocker prevents growing into it.

**`ADMIN-1`: The one strategic gap is the activation/entitlement operational loop.** *(technical/strategic · P1 · source)*
- **Current:** Entitlements and Customers are honest-empty; there is no admin visibility into "who activated what, and did the grant succeed."
- **Problem:** The current P0 bug (activation failing) is exactly the kind of thing an operator would need to *see*. The admin can't yet observe entitlement grants or activation failures.
- **Direction (strategic, not now):** When commerce/entitlements become real, prioritize the activation→entitlement→instance observability path first (it's both the support surface and the health signal), ahead of analytics polish. No blocker today; just the right sequencing note.

**`ADMIN-2`: Admin correctly reuses the design system but is denser.** *(keep)* Same tokens, tighter spacing, `dp-mono` logo + "Admin" label, appropriately distinct from the customer shell without being a different system.

---

## 17. Responsive assessment

**Evidence:** rendered at 1280 (desktop) and 375 (mobile); source for authenticated layouts. **I did not render 1440/1024/768/320/200%-zoom**, stating that honestly rather than claiming it.

- **`RESP-1` Homepage** *(rendered)*, Desktop hero is a balanced two-column grid; mobile (375) stacks cleanly, the Fraunces headline scales down well, buttons go full-width, the demo card reflows. Good.
- **`RESP-2` Shop / product page** *(rendered)*, The product page is narrow single-column and will scale fine; the Shop grid's emptiness (SHOP-1) is a *content-density* problem, not a responsive break.
- **`RESP-3` Platform shell** *(source)*, Desktop rail hidden below `lg`; mobile uses a 3-slot bottom bar + overflow sheet with safe-area insets. The structure is sound. Concern: the **product Workspace's two stacked tab strips** (MMR-2) plus the shell header will consume significant vertical space on a 375-320 viewport before any content, worth verifying live once reachable.
- **`RESP-4` Setup on mobile** *(source)*, The 5-step chip bar is `overflow-x-auto` with `min-w-[128px]` chips, and the live-preview aside is `lg:sticky` (so it drops below the form on mobile). Reasonable; verify the preview isn't buried too far down on small screens.
- **Recommendation:** Because mobile is a stated primary case and the richest surfaces (Workspace, Setup) are the *unreachable* ones, a live mobile pass at 390/320 is a required gate before launch, currently unverifiable due to the activation block.

---

## 18. Accessibility assessment

**Evidence:** source; partial rendered. Not independently audited with a screen reader or automated axe pass.

Strong baseline in source: global `:focus-visible` 2px ring; `prefers-reduced-motion` handling **plus** a user-level Settings override (`data-reduce-motion`); explicit text-scale overrides (112.5%/125%) independent of browser zoom; `color-scheme` per theme; the Workspace tablist implements proper `role="tab"`/`aria-selected`/`tabIndex` roving + arrow-key handling; icon-only controls carry `aria-label`s; native `<select>`/`<details>` used for menus/disclosure.

**`A11Y-1`: Very small type sizes throughout the app chrome.** *(visual/a11y · P1 · rendered+source)*
- **Current:** Pervasive `text-[11px]`/`text-[12px]`/`text-[13px]` for labels, metadata, nav, and body; section eyebrows are 11px uppercase `--faint` (a low-contrast muted tone).
- **Problem:** 11-13px is below comfortable reading size, and 11px in the `--faint` gray risks failing WCAG AA contrast for small text. The text-scale override helps but the *default* is small.
- **Impact:** Readability and contrast risk for a broad audience, on a product explicitly promising "calm" and "properly designed."
- **Direction:** Lift the default body/label floor (13px→14px body, 11px eyebrows→12px and a less-faint tone), and audit `--faint`-on-`--surface` combinations against AA. This is a system-level tuning, not per-screen.

**`A11Y-2`: Uppercase `--faint` eyebrows as primary section labels.** *(a11y/visual · P2 · rendered)*
- **Current:** Nearly every section is introduced by an 11px, letter-spaced, faint, uppercase label.
- **Problem:** Low-contrast + small + all-caps + tracked is the hardest combination to read, and it's the app's default section header. It also contributes to the "everything looks the same" flatness.
- **Direction:** Reserve the faint uppercase eyebrow for genuine kickers; use a normal-weight, adequate-contrast heading for real section titles.

**`A11Y-3`: Verify tab/dialog semantics on the modals.** *(a11y · P2 · source)* QuickAdd/CheckIn render as conditional overlays; confirm focus-trap, `role="dialog"`, `aria-modal`, and Escape-to-close (native `<dialog>` or explicit handling), not verifiable while blocked.

---

## 19. Copy and terminology assessment

**Evidence:** rendered (public) + source (app). Overall the customer-facing writing is **above average and often excellent**, the homepage and product copy are human, specific, and situational. Corrections needed are localized, not systemic.

**Keep (models of the right voice):**
- "There is too much to keep track of, and none of it is written down in the same place." / "I know what I need to do, but I cannot see where to start.", recognition in the user's own voice.
- "A clear next step, not another dashboard to manage.", positioning as content.
- "It asks what changed, and gets you to one small step you can take right now.", recovery framing.

**`COPY-1`: System/internal vocabulary surfacing in the app.** *(content · P2 · source)*
- **Instances:** section eyebrow **"Cloud state"** on the homepage (engineering term for a customer benefit); Library metadata **`family · Free · 2026-08`** (raw `cycleKey` and family slug); Library badge showing the **raw lifecycle enum** ("active"); "Platform Home" as a visible subtitle.
- **Direction:** Translate to human ("Saved to your account" not "Cloud state"; "This month" not `2026-08`; "In progress" not `active`). Never surface enum values or slugs as customer copy.

**`COPY-2`: Empty states that describe the system, not the next move.** *(content · P1 · source)*
- **Instances:** Home "Once you add something free or owned, the most relevant one to continue picks up here first"; Billing "Products you own will list here with their entitlement source and status."
- **Problem:** These explain how the feature will behave rather than inviting an action. "Entitlement source and status" is internal language in a customer empty state.
- **Direction:** Empty states should offer a first step, not a mechanism description (tie to PH-2). "Start with Monthly Money Reset →", not "products will list here."

**`COPY-3`: Legacy taglines in metadata/branding.** *(content · P2 · rendered)* "Digital products that remember you" (login title, AUTH-1) and "Momentum OS" (logo, PUB-2) are old-era positioning. Retire or formally adopt.

**`COPY-4`: Em-dash / hedge check.** *(content · P3)* The brief flags "unnecessary em dashes" and AI-cadence. The public copy is largely clean; watch a few long compound sentences in the product page ("How it works" and privacy blocks) that could be tightened. Minor.

---

## 20. Design-system assessment

**Surface:** `globals.css` tokens + `src/design-system/*` · **Evidence:** source + rendered

The system is **coherent, restrained, and correctly opinionated**, two-family type, one accent, muted semantics, no gradients, tightened radii, three container widths, a real dark theme, honest primitives (`EmptyState`, `Surface`-used-deliberately). This is a genuine asset (S2).

Where it *causes* generic results:

**`DS-1`: The system optimizes for restraint but under-provides composition patterns.** *(structural · P1 · source)*
- **Current:** Primitives are element-level (Button, Input, Badge, Surface, Alert, EmptyState, Toggle). There are **no higher-order composition patterns**, no "hero/focal block," no "stat/figure display," no "section header with kicker," no "list-of-owned-things" pattern. So every screen re-hand-rolls layout from raw Tailwind, and the path of least resistance is "wrap it in a bordered `rounded-xl` and stack it."
- **Problem:** This is *why* Home, Library, and the Workspace all drift toward equal-weight card rows: the system makes "another card" the easy move and "a strong focal composition" the hard one. Blandness here is a systems-incentive problem, not a taste problem.
- **Impact:** Screens are assembled, not composed; hierarchy is weak by default.
- **Direction:** Add a small set of **composition primitives**, not more atoms: `PageHeader` (kicker + title + action, with a proper type scale), `FocalBlock` (the one dominant thing on a screen), `Figure` (a large number/result with label), and `OwnedItem`/`ContinueItem` (distinct, identity-carrying, not the generic row). This directly enables §27/§28. **Resist adding decorative components.**

**`DS-2`: Elevation and border are underused as hierarchy tools.** *(visual · P2 · source)*
- **Current:** Almost everything is separated by the same hairline `--border` at the same `rounded-xl`. Shadows (`--shadow-soft`/`-md`) exist but are largely reserved for overlays.
- **Problem:** With one border weight doing all the separating, there's no near/far, no primary/secondary. Everything sits on the same plane, a major contributor to the "wireframe" read.
- **Direction:** Use the existing elevation tokens to create two or three planes (focal surface slightly raised; secondary content flat on background per the "not everything in a card" rule). No new tokens required.

**`DS-3`: Type scale is compressed at the small end (see A11Y-1).** *(visual · P1)* The system leans on 11-13px for almost everything; there's little of the 15-18px comfortable-body / 24-40px display range *inside the app* (display type is reserved for marketing). The app deserves more of the scale's top and middle.

**`DS-4`: The theme-extension contract is good but under-applied.** *(structural · keep→extend)* `themeExtension.ts` + `ThemeScope` correctly scope product color. The gap is *reach* (MMR-1/SHELL-1), not design, extend it to the shell root and consider letting it carry a bit more than accent (surface tint, header treatment) within safe bounds.

---

## 21. Customer-state matrix

For each state: what the user needs · what to make dominant · what to hide · the next action · where it fails today.

| # | State | Needs | Make dominant | Hide | Next action | Fails today |
|---|---|---|---|---|---|---|
| 1 | Signed-out visitor | Understand + feel desire | Problem-led hero + the one real product, shown visually | "Open your library" dead-ends | "Find help" / "Add free" | Shop looks empty (SHOP-1); product page shows no product (SHOP-2) |
| 2 | Signed-in, no products | An invitation to begin | One first-run block in product identity | "Attention needed", "Notifications", Install | "Start Monthly Money Reset" | Home = 3 empty boxes + a mechanism sentence (PH-1, PH-2) |
| 3 | Activating first product | Confidence it worked | Confirmation → straight to value |, | Land in Setup with a live number | **Activation fails (P0, §16)** |
| 4 | Setup incomplete | Resume where they stopped | "Finish setup, step 3 of 5" as the focal action | Full nav clutter | Continue setup | Home Continue card is a generic row, not a resume hero (PH-1) |
| 5 | One active product | The number + the next move | Safe-to-Spend + Next move | 4 secondary cards competing | Quick add / check-in | Workspace tends toward 6-card dashboard (MMR-5) |
| 6 | Returning, unfinished work | Re-find the thread instantly | The single continuation, front and center | Everything else | Continue | Continuation is a small row under a faint label (PH-1) |
| 7 | Fallen behind | No punishment; one small step | "Welcome back, update what changed" | Overdue counts, lost streaks | One small next step | Homepage promises this beautifully; the **app** doesn't yet implement a behind/recovery Home state (only the product's check-in) |
| 8 | Multiple products | Choose which to continue | A clear owned-set with identity | Filter tabs at low count | Open the right one | Home shows latest-per-product rows; Library = database feel (LIB-1) |
| 9 | Completed a cycle | See the result, decide next | The outcome + "start next month" | Setup affordances | Review / start new cycle | History/month-close reviewed in source only; unproven live |
| 10 | Billing/account issue | Fix it, or know it's not built | The one relevant control, honestly | 5 equal account routes | Reset password / contact | Honest but scattered across 5 destinations (ACCT-1) |
| 11 | On mobile | Full capability, thumb-reachable | The dominant action; big-enough type | Chrome, tiny labels | Same as desktop | 11-13px type (A11Y-1); Workspace double-tab height (MMR-2); unverified live |
| 12 | Temporarily offline | Know what still works | A clear "you're offline, work is safe" state | A green "Online" badge the rest of the time | Keep working / it'll sync | Only a passive pill; `offline: "shell-only"` declared but the *experience* of offline is undesigned (NAV-2) |

**The two states that most define success and most fail today:** #3 (activation, hard blocked) and #6 (return & continue, no dominant continuation). Fix these first.

---

## 22. Critical UX problems (P0)

1. **`W1`/§16, Activation fails end to end.** *(technical · rendered symptom, source diagnosis)* `POST /api/products/[slug]/activate` → `grant_free_product` RPC errors → redirect to `?error=1`. **Most likely cause:** the migration `supabase/migrations/202608010001_monthly_money_reset.sql` was never applied (the docs state this explicitly: "This has not been applied to any Supabase project"), so the RPC/tables don't exist. **Customer impact:** the entire authenticated product experience is unreachable; the core promise can't be demonstrated. *(Per instruction I did not attempt to fix, apply, or further diagnose beyond confirming the code path, flagged for the fix phase.)*
2. **`PH-1`: Platform Home has no dominant next action** and opens on two permanently-empty boxes. *(visual/structural)* The most important screen doesn't answer "what now?" This blocks the "return and continue" feeling even once activation works.

---

## 23. High-priority UX problems (P1)

1. **`SHOP-1`: Shop reads as empty inventory** (single card in a catalogue grid).
2. **`SHOP-2`: Product page shows no picture of the product**; buries the CTA.
3. **`PH-2`: First-run Home describes the system instead of inviting a start.**
4. **`LIB-1`/`LIB-2`: Library is a filtered database and duplicates Home's card.**
5. **`NAV-1`: Five account destinations compete with the two core ones.**
6. **`MMR-1`/`SHELL-1`: Product identity confined to module bodies; shell is generic → future families become recolored clones.**
7. **`DS-1`: Missing composition primitives make "another card" the default** (root cause of much blandness).
8. **`DS-3`/`A11Y-1`: Compressed small type + faint eyebrows** (readability, contrast, flatness).
9. **`ACCT-1`: Account area is five routes for ~1.5 screens of real content.**
10. **`ADMIN-1`: No operational visibility into activation/entitlement health** (strategic sequencing).

---

## 24. Medium-priority improvements (P2)

`PUB-1` section rhythm · `PUB-2` "Momentum OS" · `PUB-3` competing CTAs · `NAV-2` always-on Online pill · `NAV-3` over-exposed theme toggle · `MMR-2` double tab strips · `MMR-3` three activation gates · `MMR-5` Workspace card density · `SHELL-3` return-path clarity · `DS-2` single-plane elevation · `A11Y-2` uppercase-faint headers · `A11Y-3` modal semantics · `COPY-1` system vocabulary · `COPY-3` legacy taglines.

---

## 25. Low-priority polish (P3)

`PH-4` greeting placement · `AUTH-2` redirect context copy · `NAV-4` sign-out danger styling · `SHELL-2` back-target context · `COPY-4` em-dash/hedge tightening · cleared-hero empty space on the homepage demo.

---

## 26. Recommended platform information architecture

**Principle:** two things the user *does* (continue, browse) are primary; everything about *managing their account* is secondary and lives in one place.

```
PLATFORM (signed in)
├─ Home        ← the one thing to do next (state-aware focal block)
├─ Library     ← everything you own (identity-carrying collection)
├─ Shop        ← discovery (first-class, not just an empty-state link)
├─ [bell]      ← notifications, count only when non-zero
└─ Account ▾   ← Profile, Settings, Billing (when real), Support, Sign out
                 (theme lives here + in Settings; not in every top bar)

PRODUCT (inside a product, platform rail recedes)
└─ Product shell with continuous product identity (frame + content),
   a clear parent(destinations)/child(views) nav relationship, and an
   obvious "Back to Draftpace (Home)".
```

Removed from top level: Notifications/Account/Settings/Billing/Support as five peers. Added to top level: Shop. Net: **Home · Library · Shop · bell · Account-menu**, a rail whose center of gravity is the work, not the plumbing.

---

## 27. Recommended Platform Home structure

State-aware, one dominant block, no reserved-empty space.

```
┌───────────────────────────────────────────────────────────┐
│  Good morning, {name}.                        (personal,   │
│                                                one line)   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  FOCAL BLOCK, the single most useful thing now,     │  │
│  │  in the product's own identity:                      │  │
│  │                                                       │  │
│  │   • no products → "Start Monthly Money Reset"        │  │
│  │       one confident invitation, product-themed       │  │
│  │   • setup incomplete → "Finish setup · step 3 of 5"  │  │
│  │   • active → Safe-to-Spend figure + "Your next move" │  │
│  │       (a live product preview, not a link-row)       │  │
│  │   • behind → "Welcome back, update what changed"    │  │
│  │                                                       │  │
│  │             [ one primary action ]                    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  Also in your library →   (quiet secondary list, only     │
│                            if >1 owned product)           │
│                                                           │
│  ⚠ Attention needed       (renders ONLY when non-empty)   │
│  🔔 Notifications         (renders ONLY when non-empty)   │
└───────────────────────────────────────────────────────────┘
```

Rules: exactly one focal block, chosen by state; empty sections don't render (no reserved rectangles); the focal block carries the active product's identity so Home feels connected to the work, not to generic chrome; Install/PWA moves below or into Account.

---

## 28. Recommended Library structure

A **collection of owned experiences**, differentiated from Home by scope (all vs. one) and from Shop by ownership.

- **Lead with the products**, each as an identity-carrying `OwnedItem` (MMR shows its forest accent), not a hairline row: title, a **human** status line ("This month · £412 safe to spend · set up") instead of `active · 2026-08`, and one clear open action.
- **No filter bar until it's warranted** (~5+ owned). Below that, a simple recency order. When filters do appear, label lifecycle in human terms ("In progress / Paused / Finished / Archived"), never the raw enum.
- **A quiet "Find more in the Shop" affordance** at the end, Library is where owning leads back to discovering.
- Distinct composition from Home's focal block and Shop's sell-cards, so the three never look interchangeable.

---

## 29. Recommended product-shell structure

- **Continuous identity:** apply the scoped theme at the shell root so the header, tabs, and back bar share the product's palette with the content (fixes MMR-1/SHELL-1), within platform light/dark and accessibility guarantees.
- **One clear nav hierarchy:** destinations (Start/Setup/Workspace/…) as the parent level; any in-screen views (Overview/Activity/…) visually nested under the Workspace, not a second equal tab strip (fixes MMR-2).
- **Structural family archetypes**, not just accents: a small set of shell layouts so Companion, Learning, Tracker, Tool, Guided Program, Automation differ in *what leads* the screen (fixes SHELL-1's clone risk).
- **Obvious, correct return path** to Home/Draftpace (fixes SHELL-2), while the platform rail stays hidden inside the product (keep SHELL-3).
- **Workspace focal hierarchy:** the result + the next move dominate; secondary panels use type-and-space separation over borders (fixes MMR-5).

---

## 30. Recommended visual direction

Do **not** solve flatness with gradients, blobs, icons-per-card, or louder color, the North Star and the design system both forbid it, and it isn't the problem. Solve it with:

1. **Hierarchy through type scale.** Reclaim the middle and top of the scale inside the app (14px body floor, real 20-40px focal figures, fewer 11px faint labels). The Fraunces figure on the Safe-to-Spend card is the model, use that confidence more widely for *results*.
2. **Two or three planes, not one.** Use existing elevation tokens so the focal thing sits forward and secondary content sits flat on the page (DS-2). Fewer borders, more deliberate space.
3. **Product identity that reaches the frame.** Continuous scoped theming (MMR-1) so a product feels like a place.
4. **State-aware composition.** The screen reforms around the user's state (empty ≠ setup ≠ active ≠ behind) rather than pouring data into one static layout.
5. **Contrast of rhythm on long pages.** Vary section pace/background on the homepage and product page instead of uniform bordered bands (PUB-1).

Net aesthetic target: calm, editorial, confident, the homepage's voice, extended into the app.

---

## 31. Recommended content direction

- **Translate every system term** at the customer boundary: "Saved to your account" not "Cloud state"; "This month" not `2026-08`; "In progress" not `active`; drop "Platform Home" as a visible label.
- **Empty states offer a step, not a mechanism** (PH-2/COPY-2).
- **Name the destination on auth redirects** ("Sign in to add Monthly Money Reset").
- **Resolve legacy taglines** ("Digital products that remember you," "Momentum OS"), retire or adopt, don't leave orphaned.
- **Keep the homepage/product voice**: it's the standard the rest of the app should rise to, not something to tone down.

---

## 32. What should remain unchanged

- The homepage's copy and core interactions (S1), refine rhythm only.
- The design tokens and two-family typography (S2).
- The product framework's open, no-switch registry model (S3).
- The Safe-to-Spend card, the setup live preview, and the money-calculation semantics (S4).
- The honesty discipline and the `unavailable` pattern (S5), keep the honesty, improve the *presentation* of it.
- The real security/auth posture and POST-only activation design (S6).
- The admin IA's shape (§16).
- Setup as a 5-step progressive flow (MMR-4).

---

## 33. What should be removed

- The always-on "Online" pill (NAV-2), show only when offline.
- The theme toggle from persistent top bars (NAV-3), keep it in Settings/Account.
- The permanently-rendered empty "Attention needed" and "Notifications" boxes on Home (PH-1), render only when non-empty.
- Notifications/Account/Settings/Billing/Support as five top-level peers (NAV-1/ACCT-1), collapse into one Account menu; Billing becomes a section until purchases exist.
- The Shop category header + 2-col grid at N=1 (SHOP-1), switch on past a threshold.
- Start Here as a *mandatory* first-run gate (MMR-3), keep it as a re-entry surface.
- Raw `cycleKey`/family-slug/lifecycle-enum from customer copy (COPY-1).
- Legacy taglines from metadata/logo (COPY-3), pending the founder's brand call.

## 34. What should be redesigned

- **Platform Home** → state-aware focal block (§27), highest-value redesign.
- **Library** → identity-carrying owned collection (§28).
- **Shop index + product page** → visual-first, threshold-aware selling surfaces (§8).
- **Product shell** → continuous identity + single nav hierarchy + family archetypes (§29).
- **Platform navigation** → Home · Library · Shop · bell · Account-menu (§26).
- **Design-system layer** → add composition primitives; lift the type-scale floor; use elevation for planes (§20).
- **Workspace Overview** → strong hero + quiet secondary, away from a six-card dashboard (MMR-5).

---

## 35. Decisions requiring founder approval

1. **Brand lockup:** retire "Momentum OS" (and "Digital products that remember you"), or formally adopt one as the tagline? (PUB-2/COPY-3), affects the logo asset and metadata.
2. **Activation fix path:** confirm the intended way to make activation real, apply `202608010001_monthly_money_reset.sql` to the linked Supabase project (the docs' stated but unexecuted step). This is a data/migration action the brief told me not to take; it needs your explicit go and review. (§16/§22)
3. **First-run routing:** approve sending freshly-activated users **into Setup** rather than Start Here, keeping Start Here as a returning-user overview. (MMR-3)
4. **Navigation IA:** approve promoting Shop to a top-level destination and collapsing the five account routes into one Account menu, with Billing demoted to a section until purchases exist. (§26)
5. **Scope of product identity:** approve extending scoped theming to the whole product shell (frame + content), and defining structural family archetypes rather than accent-only differentiation. (MMR-1/SHELL-1)
6. **Type-scale floor:** approve raising the app's default small-text floor (affects density across every authenticated screen). (A11Y-1/DS-3)
7. **How far to take the single-product Shop:** a bespoke, richer single-product presentation now, vs. a lighter fix that waits for more inventory. (SHOP-1)

---

## 36. Recommended implementation phases

Sequenced by "does it unblock or define the core loop," not by ease.

**Phase A, Unblock the core loop (P0).**
- Resolve activation (founder-approved migration path, §35.2). Prove: Shop → activate → Setup → Workspace → Safe-to-Spend → return, end to end, on desktop **and** mobile. Nothing else matters until this is real.

**Phase B, Make "continue" and "begin" dominant (P0/P1).**
- Rebuild Platform Home as the state-aware focal block (§27).
- Differentiate Library as an owned collection (§28).
- Add the composition primitives + type-scale floor that make B and C possible (DS-1/DS-3).

**Phase C, Make the product feel like a product (P1).**
- Continuous product identity in the shell (MMR-1/SHELL-1); single nav hierarchy (MMR-2); Workspace focal hierarchy (MMR-5).

**Phase D, Make the one product sell (P1).**
- Visual-first product page + always-available CTA (SHOP-2); threshold-aware Shop (SHOP-1).

**Phase E, Navigation & account consolidation (P1/P2).**
- Home·Library·Shop·bell·Account-menu (§26); remove Online pill and top-bar theme toggle; collapse account routes.

**Phase F, Rhythm, copy, and a11y polish (P2/P3).**
- Homepage/product rhythm (PUB-1); system-vocabulary translation (COPY-1); contrast/eyebrow tuning (A11Y-1/2); brand-lockup resolution.

Public-site rhythm (F) is intentionally last: the public site is already the strongest surface, so it's the lowest-urgency work despite being the most visible, the leverage is in the authenticated loop.

---

## 37. Risks and dependencies

- **The activation fix is a data/infra action, not just code** (applying a reviewed migration to Supabase). It's gated on founder approval and access; everything downstream depends on it. If the true cause is *not* the unapplied migration (e.g. an RLS/`security definer` detail), Phase A could expand, budget for a real diagnosis pass once you approve unblocking it.
- **Mobile and accessibility for the richest surfaces are currently unverifiable** because Workspace/Setup are behind the block. Their live mobile/a11y pass is a launch gate that can't be closed until Phase A lands.
- **Design-system composition primitives (DS-1) are a dependency of the Home/Library/Shell redesigns.** Doing the redesigns without them will re-hand-roll layout and reproduce the blandness. Build the primitives first within Phase B.
- **Family-archetype work (SHELL-1) risks over-engineering for products that don't exist.** Mitigate by defining archetypes only as far as MMR (Companion) needs now, with hooks for the other five, don't build five layouts speculatively.
- **Brand decision (§35.1) touches many surfaces** (logo asset, titles, metadata); resolve it early so later copy work isn't redone.
- **Honest-state regression risk:** as screens get richer, protect the no-fabrication rule, richer must not mean fake activity/metrics.

---

## 38. Definition of "launch-ready"

Draftpace is launch-ready when:

1. **The core loop is provable, live, on mobile:** a new visitor can discover Monthly Money Reset, add it free, sign in if needed, complete setup, see a real Safe-to-Spend number and a clear next move, leave, and return to *exactly* where they were, with no `?error=1`, verified on desktop and a 390/320 phone.
2. **Platform Home answers "what now?" in one dominant action** for each customer state (new, setup-incomplete, active, returning, behind), with no reserved-empty rectangles.
3. **Library reads as owned experiences, not a database**, and is visibly distinct from Home and Shop.
4. **The one product feels like a product**: continuous identity, one clear nav hierarchy, a Workspace with an unmistakable focal point, not a themed panel in a generic frame.
5. **The Shop and product page make someone *want* the product**, including at least one real view of the actual interface, with the add-action always within reach.
6. **Navigation centers the work:** Home · Library · Shop primary; account plumbing consolidated; no always-on Online pill or omnipresent theme toggle.
7. **Type and contrast meet a comfortable, AA-compliant floor** across the authenticated app; keyboard, reduced-motion, and modal semantics verified live.
8. **Customer-facing copy carries no system vocabulary or orphaned legacy taglines**, and empty states help people begin.
9. **Honesty holds:** nothing fabricated; unbuilt capability is still presented as designed, not as a raw placeholder.

Today, criterion 1 fails outright (activation) and 2-6 are partially met at best. None of the gaps require abandoning what's been built, they require finishing the transitions, applying one migration, and making a handful of screens *composed* rather than *assembled*.

---

*End of audit. No files other than this document were created or modified. Awaiting direction on which phase to begin, Phase A (unblocking activation) is the recommended first move and requires the founder decisions in §35.2.*
