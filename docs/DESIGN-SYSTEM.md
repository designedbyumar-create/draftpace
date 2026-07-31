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
  the interface.
- Semantic: `--success`, `--warning`, `--danger`, `--info`, each with a
  `-soft` background pair, muted rather than saturated (avoids the "generic
  SaaS template" bright-green/red look).
- No gradients anywhere in the shared system.

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
