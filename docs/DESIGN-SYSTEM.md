# Design System

One shared system across the public site, platform, product shell, and
admin. Source of truth: `src/app/globals.css` (tokens) and `src/design-system/`
(primitives). This documents the decisions; it isn't a copy of the CSS.

## Typography

Two families, deliberately not four:

- **Fraunces** (serif, variable optical size) — display/editorial use only:
  marketing hero headlines, section headers on the public site. This is the
  primary way Draftpace signals "premium/intentional" rather than through
  color or decoration. Used via `font-serif`.
- **Inter** — everything else: all UI text, platform chrome, forms, body
  copy, headings inside the app. Default `font-sans`.
- **Space Mono** — reserved, rare use for genuinely numeric/technical
  content (version strings, ids). Not a primary role. `font-mono`.

Hanken Grotesk (used pre-Phase-2) was dropped — a third UI-adjacent sans
competing with Inter added inconsistency without a clear job.

## Color

CSS custom properties on `html`, redefined under `html[data-theme="dark"]`
and inside `@media (prefers-color-scheme: dark)` scoped to
`html[data-theme="system"]` — see `docs/DECISIONS.md` for the
`system|light|dark` model.

- Surfaces: `--bg`, `--app-bg`, `--surface`, `--surface-muted`,
  `--surface-strong`, `--overlay` (dialog/sheet backdrops).
- Text: `--text`, `--muted`, `--faint`.
- Borders: `--border` (hairline), `--border-strong` (emphasis).
- Brand: `--primary` / `--primary-strong` / `--primary-soft` /
  `--primary-contrast` — one accent, used deliberately, not saturated across
  the interface. Inside a product shell these are re-pointed at that
  product's own accent, see **Per-product accent** below.
- Semantic: `--success`, `--warning`, `--danger`, `--info`, each with a
  `-soft` background pair, muted rather than saturated (avoids the "generic
  SaaS template" bright-green/red look).
- No gradients anywhere in the shared system.

## Per-product accent

A product declares its own colour once, in its `definition.ts`, as
`theme.accentScale` (`base` / `strong` / `soft` / `contrast`, plus an
optional `wash`). `productThemeStyle()`
(`src/product-framework/themeExtension.ts`) turns that into inline custom
properties on the product shell's root, which also carries
`data-product-theme`.

Two rules matter here, both learned the hard way:

- **Inline styles emit light/dark *pairs*, never the live value.**
  `productThemeStyle()` sets `--product-primary-light` and
  `--product-primary-dark`; `globals.css` selects between them under
  `[data-product-theme]`, `:root[data-theme="dark"] [data-product-theme]`
  and the `prefers-color-scheme` copy. An inline style cannot answer a
  media query, so setting `--primary` inline directly is what once made
  every themed product unreadable in dark mode.
- **A dark accent is derived, not guessed.** `deriveDarkTones()`
  (`src/design-system/accentTone.ts`) lifts a light accent to a real
  contrast target against the dark surface, preserving hue and restoring
  chroma, and leaves a near-neutral accent neutral. A product may still
  supply `accentScaleDark` explicitly to override it.

Monthly Money Reset's bespoke `--mmr-*` tokens are the one documented
exception to this mechanism, not a second undocumented system.

## Store images (`public/store/`)

Four generated images per product, 1600×1200 WebP, named
`<slug>-1-cover`, `-2-screen`, `-3-screen`, `-4-screen`. The cover carries
the product's name and promise and is used where the image travels alone
— the detail page's OG image and its Product JSON-LD. The three screen
frames carry a caption instead, and `-2-screen` is the Shop grid's
thumbnail, because the card already prints the title and promise itself.

`src/app/(marketing)/shop/storeImages.test.ts` guards that both lists of
slugs agree and that every file is really on disk.

Each frame is one straight, whole phone (the shared `PhoneFrame`, showing
a real screen from `productScreens.tsx`) on a pale ground in that
product's own hue. **The ground goes through HSL, not `color-mix` with
white.** Mixing an accent with white scales its chroma by the same
fraction, so a low-saturation accent turns grey long before it turns
light while a saturated one is still vivid at the same percentage — which
is how nine products end up looking like one product. Setting lightness
(~0.90–0.97 across the gradient) and saturation (clamped to roughly
0.34–0.50) independently gives every product a ground of the same
paleness in its own hue.

To regenerate: render the frames at 1600×1200 from a temporary route
under `src/app/`, screenshot each by id with Playwright at
`deviceScaleFactor: 2` (hide the Next dev badge — `nextjs-portal{display:none}`
— or it lands in the bottom-left corner of every capture), convert with
`sharp` at quality 88, and delete the route. All 36 come to ~1.4 MB.

## Buttons: two registers, one system

`src/design-system/buttonStyles.ts` is the source of truth, and its doc
comment is the long version.

- **Marketing register:** `primary`. A persuasive CTA with gradient
  material and an accent glow, for the public site, where a button's job
  is to be taken.
- **Product register:** `action` and `commit`. Inside the app a button's
  job is to be available without competing. `action` is an ordinary
  action, tinted in the product's own accent. `commit` is the single real
  commitment on a screen: solid, but flat.
- Both product variants follow `--primary`, so they are that product's
  colour in both themes with no per-product button code anywhere.
- `secondary`, `outline`, `ghost`, `danger` work in either register.

Defaulting in-app buttons to `primary` is what once put the marketing CTA
on roughly 175 product buttons that never asked for a variant.

## Shared product-layer components

Built once, used by every product, rather than re-implemented per
product:

- `src/design-system/motion.ts` — the named variants (`entranceVariant`,
  `staggerContainer`/`staggerItem`, `settleVariant`, `pressProps`,
  `liftProps`), each guarded by `useReducedMotion()`.
- `src/design-system/PrintableDocument.tsx` — the shared
  `@react-pdf/renderer` shell (cover, header, footer, pagination,
  palette) behind every printable. Printable modules import
  `@react-pdf/renderer` and must therefore only ever be reached via a
  dynamic import.
- `src/app/(marketing)/shop/PhoneFrame.tsx` — one phone frame,
  parameterised by accent, instead of a copy per marketing mockup file.
- `src/components/platform/ProductBadge.tsx` — reads a product's own
  `accentScale`, so a product's icon is its own colour outside its shell
  too, not platform teal.
- `src/components/platform/GuidedTour.tsx` +
  `useFirstRunTour.ts` + `FirstRunTour.tsx` — the first-run tour. A step
  targets an `id` or a `data-tour-id`; steps whose target is not on
  screen are dropped, and a tour with no surviving steps finishes rather
  than pointing at nothing. `EmptyState` carries
  `data-tour-id="empty-state"` and both shells mark destinations as
  `rail-<id>`, because those are the only things a brand new, empty
  account actually renders.

## Spacing, radius, containers, breakpoints

- Spacing: Tailwind's default 4px-based scale, used directly — no custom
  spacing tokens to keep in sync.
- Radius: tightened from the pre-reset interface (which leaned on
  `rounded-2xl`/`rounded-3xl` everywhere — reads as a consumer/"digital
  planner" aesthetic). Convention: `rounded-lg` (8px) for controls
  (buttons, inputs, badges), `rounded-xl` (12px) for surfaces/cards, nothing
  larger by default.
- Elevation: `--shadow-xs` (hairline lift), `--shadow-soft` (card/surface),
  `--shadow-md` (dialogs, popovers, overlays). No heavier.
- Containers (`src/design-system/Container.tsx`): `wide` (max-w-6xl,
  marketing), `standard` (max-w-5xl, platform surfaces), `narrow` (max-w-3xl,
  product shell / auth / single-column reading).
- Breakpoints: Tailwind defaults (sm 640 / md 768 / lg 1024 / xl 1280 /
  2xl 1536), used consistently rather than customized.

## Motion, focus, accessibility

- `:focus-visible` gets a visible 2px ring globally (`globals.css`) — every
  interactive primitive relies on this rather than inventing its own.
- `@media (prefers-reduced-motion: reduce)` collapses all animation/
  transition durations globally.
- `color-scheme` is set per theme so native form controls (scrollbars,
  date pickers) render correctly in dark mode.
- Text-size and browser-zoom resilience: layouts use relative units and
  flex/grid with wrapping, not fixed pixel containers that clip at larger
  text sizes.

## Primitives (`src/design-system/`)

`Button`, `Input`, `Badge` (status only, used sparingly), `EmptyState` (the
required honest-empty-state primitive — no fabricated data anywhere in the
platform routes uses anything else), `Alert`, `Container`, `Surface`
(bordered wrapper, used deliberately, not as a default for every section —
avoids "everything in a card"), `Toggle`.

Native HTML elements (`<select>`, `<details>`) are used for simple
menu/disclosure needs instead of building custom Dialog/Menu/Tooltip
components — kept out of scope this phase rather than shipped half-built.

## Visual rules (enforced by convention, not lint)

No unnecessary gradients. No excessive pill/badge usage — badges are status
indicators, not decoration. Not every section lives inside a bordered card —
most platform content sits directly on the page background, with type scale
and spacing doing the separating work. No fabricated metrics, empty charts,
or decorative illustrations.

## Icons

Phosphor Icons only, via `src/design-system/Icon.tsx`. No decorative icon
next to every heading; icons are used for navigation, recognizable actions,
or status. Icon-only controls always carry an accessible label. The
Draftpace logo mark is branding, not part of this icon system.
