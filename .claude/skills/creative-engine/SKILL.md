---
name: creative-engine
description: Draftpace's own internal creative production system — renders real product videos and images (Instagram posts/carousels, Pinterest pins, Reels/TikTok/Shorts/Pinterest video) from real Draftpace UI, real data, and real brand tokens. Use whenever asked to make a product video, social video, social image, carousel, or Pinterest pin for a Draftpace product.
---

# Draftpace Creative Engine

A separate, isolated Remotion workspace at `creative/`. It never modifies
`../src` (the real Next.js app) and is never imported by it — it only reads
specific real files from `../src` as a library: real components, real
calculation functions, real theme tokens. If you're reading this in a new
session, on any model, this document plus the code in `creative/` is
everything you need. Don't rediscover the traps below; they already cost a
lot of debugging time once.

## What this produces

**Two outputs only, by design.** Nothing else — no separate Pinterest-video
pipeline, no animated-GIF tier, no template marketplace.

- **Images.** Two image formats exist, and they are NOT interchangeable:
  - `feature-post.tsx` (a Remotion `<Still>`) — **the one to reach for by
    default.** Advertising-weight promotional posts: pastel blobs, a
    Newsreader display headline, the real UI tilted or windowed into the
    composition like a photograph, not floating flat on plain cream. Each
    post sells one real, specific thing the product does (one real
    `problemsSolved` entry), not a generic screenshot. This is what
    "Pinterest pin," "Instagram post," or "promotional creative" means in
    this engine — there is deliberately no separate, lesser-effort
    "Pinterest pin" template; a pin is just this format at the Pinterest
    ratio. See `shots/monthly-money-reset/feature-posts.json` for the
    reference example.
  - `feature-image.tsx` (also a `<Still>`) — a plainer, single-slide
    layout (headline/card/CTA, flat on the brand background). Useful for
    a literal carousel narrative (`feature-carousel.shot.json`'s
    problem→clarity→next-move→CTA sequence) where the point is the
    sequence, not each image's individual persuasive weight. Don't use
    this when the ask is "sell the product" — use `feature-post.tsx`.
  - Both render at whichever ratio a platform wants, via
    `aspect-ratios.mjs`.
- **Video** (`creative/src/compositions/formats/feature-spotlight.tsx`, a
  Remotion `<Composition>`): used for Instagram/Facebook/TikTok Reels,
  YouTube Shorts, Pinterest video. One format exists so far —
  "Feature Spotlight," a ~18s PROBLEM → NOISE → REVEAL → CLARITY → NEXT
  MOVE arc. Other formats (problem→solution, before/after, launch, etc.)
  are future work, not yet built — see "Adding a new format" below.

Both outputs render through **the same engine** (Remotion), **the same
real-UI adapter pattern**, and **the same brand tokens**. That's the
self-contained part: one system, two outputs, not two separate tools.

**All 9 products are live today**, not just Monthly Money Reset: Personal
Finance Companion, Home Base, Personal Life Affairs Companion,
Homeschooling Companion, ADHD Life Companion (`alongside`), Travel
Companion, Vehicle Maintenance Companion, and Family Health Binder all have
a real theme entry (`theme-registry.ts`), a `feature-posts.json` (4 posts
each), and a `feature-spotlight.shot.json` (one video each). Monthly Money
Reset is the one product with a live-component adapter
(`ui-adapter/monthlyMoneyReset.tsx`, `SafeToSpendCard`/`NextActionCard`
actually mounted and computing); the other 8 use real captured screen
images instead (see "Two ways to show real UI" below) — both are equally
real, the difference is live-and-interactive vs. a real static capture.

## The one hard rule: real UI only

Every screen, card, number and computed result in an output must come from
an actual Draftpace component, calculation function, or captured screen —
never recreated. There are two legitimate ways to do this; pick the
cheaper one unless the richer one is actually needed:

**Option A, real captured screen (what 8 of 9 products use today).**
Fastest, lowest-risk, no component-integration work:
1. Find a real capture in `marketing/product-reference/screens/<product>/`
   (from the earlier product-reference work — honest seeded data, tour
   overlays already dismissed).
2. Copy it into `creative/public/screens/<product>-<screen>.png`.
3. Reference it from a shot/post file: `{ "kind": "screen", "src":
   "screens/<product>-<screen>.png" }`.
No adapter file needed at all for this path — `theme-registry.ts` already
has every product's real colors (see `scripts/video-plan/theme.mjs`,
reused directly, not duplicated).

**Option B, a live component (what Monthly Money Reset's hero card uses).**
Richer — the number is actually computed, not a frozen picture of one —
but real integration work. See `src/ui-adapter/monthlyMoneyReset.tsx`:
1. Import the real presentational component (e.g. `SafeToSpendCard.tsx`).
   It must be prop-driven with no data-fetching of its own — check its
   imports before assuming it'll work standalone.
2. Import the real calculation functions it needs (e.g.
   `computeSafeToSpend`), not reimplemented math.
3. Import the real theme-token functions (e.g.
   `monthlyMoneyResetThemeVars`) for colors, not hand-picked hex values.
4. Feed it a frozen copy of real seeded data (see
   `scripts/product-reference/seed/seed-*.mjs` from the product-reference
   work), with a comment stating exactly which real values it reproduces
   and why it's frozen rather than a live query.

If neither a real screen nor a real component exists yet for what's being
asked, that's a stop condition: say so, don't invent it. The only exception
is the "before Draftpace" half of a Feature Spotlight's story (the
problem/noise beats) — there's no real screen for "before the product," so
that's kinetic typography only, never a fake mocked-up UI.

## Quick start

```bash
cd creative
npm install              # first time only
npm run preview          # Remotion Studio — scrub the timeline, check every beat visually before rendering
node scripts/render-direct.mjs                              # renders EVERY registered video (all 9 products)
node scripts/render-direct.mjs TravelCompanion-FeatureSpotlight   # or just one — see Root.tsx for exact ids
node scripts/render-images.mjs        # renders every registered <Still>: every slide/post x every aspect ratio
node scripts/check-frames.mjs [composition-id]        # frame-gate QA; defaults to Monthly Money Reset
```

(NOT `npm run render` / `remotion render` directly — see trap #1.)

**Always look at the actual render before calling something done** — open
it in Remotion Studio, or load the rendered file in a browser tab and
screenshot/scrub it. A render that "completed without error" is not the
same as one that looks right. This was true for video and stayed true for
images (the first image attempt would have shipped with wrong captions if
not actually viewed).

## Architecture

```
creative/
  webpack-override.mjs        # THE shared webpack fix (alias + PostCSS) — see traps below
  aspect-ratios.mjs           # the 3 image ratios: square/portrait/pinterest
  src/
    index.ts, Root.tsx        # registers every Composition and every Still
    style.css                 # platform tokens (copied verbatim from globals.css) + system font fallback
    motion/                   # shared primitives: camera.ts, typography.ts, transitions.ts, ui.ts, sound.ts
    theme-registry.ts          # every product's real theme tokens (re-exports scripts/video-plan/theme.mjs) + postCssVars()
    compositions/formats/     # feature-spotlight.tsx (video), feature-post.tsx (promotional posts — default for images), feature-image.tsx (plain carousel slides)
    ui-adapter/                # live-component adapters — only monthlyMoneyReset.tsx exists; everything else uses Option A (real screens)
  shots/<product>/            # the data: *.shot.json (video beats) + feature-posts.json (promotional posts), one pair per product
  public/screens/              # real captures copied in for Option A products (from marketing/product-reference/screens/)
  public/audio/                # licensed SFX/BGM (Mixkit, see ATTRIBUTION.md)
  scripts/
    inline-fonts.mjs           # regenerates src/fonts-inline.css from ../public/fonts/*.ttf — see trap #6
    gen-posts-data.mjs, gen-video-data.mjs   # one-time generators that WROTE the 8 non-MMR shot/post JSON files — the JSON is the source of truth now, not these scripts; re-run only if starting that many products over from scratch
    render-direct.mjs, render-images.mjs, check-frames.mjs
  out/                        # rendered output, gitignored
```

**The shot/slide data model is the actual interface.** A new creative is
(almost always) a new JSON file, not new component code:

```jsonc
// video beat, real screen (shots/<product>/feature-spotlight.shot.json) — what 8 of 9 products use
{ "id": "reveal", "kind": "screen", "startFrame": 230, "durationFrames": 200,
  "screen": { "src": "screens/travel-companion-trip.png" },
  "camera": { "move": "pushIn", "fromScale": 1.0, "toScale": 1.07 },
  "transition": { "in": "blurDissolve", "frames": 15 },
  "sound": { "sfx": "click-settle" }, "caption": "..." }

// video beat, live component (MMR only)
{ "id": "clarity", "kind": "safeToSpendCard", "startFrame": 230, "durationFrames": 200, ... }

// promotional post (shots/<product>/feature-posts.json)
{ "id": "01-...", "themeSlug": "travel-companion", "layout": "tilt",
  "eyebrow": "TRAVEL COMPANION", "headline": ["Confirmation numbers live", "in six different", "inboxes."],
  "ui": { "kind": "screen", "src": "screens/travel-companion-itinerary.png" },
  "product": { "name": "Travel Companion", "price": "$34" } }
```

New `kind`s need a small addition to the composition file's switch — adding
a product, a slide, or a new instance of an existing kind needs none.

## Adding a new product

All 9 Draftpace products already have an entry — this is now "add a new
*format/story* for an existing product" far more often than "add a new
product from zero." If a genuinely new product ships later:

**The fast path (Option A, screens — do this first):**
1. `theme-registry.ts` already has every product that's gone through
   `scripts/video-plan/theme.mjs`; if this is a newer product, add its real
   tokens there the same way the existing 9 were (copied from its
   `theme.ts`/`definition.ts`, see that file's own header comment).
2. Copy 1-4 real screens into `creative/public/screens/<product>-<screen>.png`.
3. Write `shots/<product>/feature-posts.json` and/or
   `feature-spotlight.shot.json` using `{ "kind": "screen", ... }` — copy
   an existing product's file as the template, swap theme slug, screens,
   and real `problemsSolved`-grounded copy.
4. Add the new imports to `Root.tsx`'s `ALL_SPOTLIGHTS/ALL_POSTS` arrays.
5. `npm run preview`, scrub every beat/post, then render.

**The richer path (Option B, a live component)** — only when a frozen
screenshot genuinely isn't enough (e.g. the number itself is the point):
follow `ui-adapter/monthlyMoneyReset.tsx`'s pattern, then reference the new
`kind` from a format file the way `SafeToSpendBeat`/`SafeToSpendCard`-kind
posts do.

## Adding a new format

A format is one React component in `compositions/formats/` that interprets
a shot/slide shape, plus whatever new motion primitives it needs in
`motion/`. Before building one: check whether an existing primitive
(camera push, fade-up, blur-dissolve, card pop, count-up) already covers
it. Don't add an abstraction until a second real use needs it — every
rule below was learned by building one thing at a time, not by
architecting ahead of a real need.

## Motion primitives that exist today

- `camera.ts`: `pushIn` (slow continuous scale)
- `typography.ts`: `fadeUpLine` (per-line fade + rise, staggered)
- `transitions.ts`: `blurDissolve` (fade + blur + subtle scale, Draftpace's
  own "calm" easing curve)
- `ui.ts`: `cardPop` (Remotion-native spring reveal), `countUpValue`
  (frame-driven number interpolation)
- `sound.ts`: cue registry, `SFX_FILES` / `BED_FILE` via `staticFile()`

Not built yet (camera orbit/parallax/2.5D depth, kinetic word/character
reveal, wipe/match-cut/zoom transitions, list population, chart animation,
cursor choreography, browser/device frames) — add them when a real
creative actually needs one, following the pattern above.

## Audio

Licensed SFX/BGM live in `public/audio/`, sourced from Mixkit under their
free commercial license (no attribution required) — see
`public/audio/ATTRIBUTION.md` for exactly what was downloaded, from where,
and when. **Never download audio from anywhere without the user's explicit
go-ahead first**, every time, not just the first time — that approval
doesn't carry forward automatically.

## QA

`scripts/check-frames.mjs` samples rendered frames (video) or checks
rendered stills and flags: failed/corrupted frames, missing frames, extreme
luminance jumps. It is a mechanical floor, not a replacement for actually
watching the output. Run it before calling any render finished; a video
that passes the gate but wasn't actually watched is not done.

## Traps already hit (do not re-learn them)

1. **Don't use `npx remotion render` or `npx remotion studio` through the
   CLI's own invocation path for anything you need to trust blindly.** It
   reliably stalled at "Getting composition" in this environment — no
   error, no timeout, just silence for minutes, across multiple otherwise-
   successful setups. `scripts/render-direct.mjs` / `render-images.mjs`
   (calling `@remotion/renderer` directly, same engine, with phase-logging
   and hard per-phase timeouts) is what actually worked. `npm run preview`
   (Studio) is fine for visual debugging via a browser, it just isn't what
   you render the final file with.
2. **Remotion's default webpack config has no PostCSS step.** Dropping a
   `tailwind.config.js`/`postcss.config.js` into the project does nothing
   on its own — nothing reads them. `webpack-override.mjs` inserts
   `postcss-loader` into the `.css` rule explicitly, with the Tailwind
   plugin configured inline (not via file auto-discovery). Without this,
   every real component renders completely unstyled — confirmed by
   inspecting the live stylesheet: `@tailwind base/components/utilities`
   passed through as literal, inert text.
3. **Remotion's own webpack config defines its own `"@"` alias**, pointed
   at its CLI's internal source. Don't spread `currentConfig.resolve.alias`
   and add your own `"@"` key expecting it to win — it doesn't; the old
   entry wins. Replace `resolve.alias` outright instead (see
   `webpack-override.mjs`).
4. **`remotion.config.ts` does not share a module context with
   `__dirname`/`import.meta.url` the way you'd expect.** Remotion evaluates
   it through its own loader: `__dirname` resolves inside
   `node_modules/@remotion/cli/dist`, and `import.meta` is empty (it's
   loaded as CJS). Use `process.cwd()` for paths, and pass webpack loaders
   as bare module-name strings (`"postcss-loader"`), never
   `require.resolve(...)` — there's no reliable `require` to call it with.
5. **`webpack-override.mjs` must be a module shared by both
   `remotion.config.ts` (used by the CLI/Studio) and the direct render
   scripts** — calling `@remotion/bundler`'s `bundle()` directly does NOT
   read `remotion.config.ts` at all. Pass `webpackOverride` to `bundle()`
   explicitly every time.
6. **Real brand fonts work — but only loaded as inline base64 data URIs,
   never as an async fetch.** A live `fonts.googleapis.com` `@import` and a
   self-hosted `public/fonts/` + `staticFile()` `@font-face` each hung the
   render indefinitely, in two different phases — both are async loads the
   renderer has to wait on. The fix that actually works:
   `scripts/inline-fonts.mjs` reads the real `../public/fonts/*.ttf` files
   (Newsreader, IBM Plex Sans — the same ones
   `scripts/pinterest-maple-main/pastel.mjs` already uses successfully) and
   writes `src/fonts-inline.css`, a plain `@font-face` block with the font
   bytes inlined as a `data:` URI. A `data:` URI is resolved synchronously
   by the CSS parser — no network, no `document.fonts.ready` race, nothing
   to hang on. `feature-post.tsx` uses this and it's reliable; re-run
   `node scripts/inline-fonts.mjs` if the source `.ttf` files ever change.
   The video (`feature-spotlight.tsx`) and the plainer image format
   (`feature-image.tsx`) still use the system-font fallback in
   `style.css` (`--font-inter` / `--font-space-mono`) and haven't been
   switched over to this fix yet — doing so is a small, safe follow-up,
   not a research problem anymore.
7. **`SafeToSpendCard`'s own `useReducedMotion()` is forced true** by a
   `window.matchMedia` patch at the top of `src/index.ts`. This uses a
   real, already-shipped accessibility mode of the component (`hidden ===
   visible` when reduced motion is on) to get deterministic, frame-
   seekable rendering — framer-motion's real-time spring physics aren't
   frame-seekable by Remotion's capture model otherwise. It is not a fork.
8. **A still image reuses the exact same motion primitives as the video,
   evaluated at a fixed "settled" frame** (see `feature-image.tsx`,
   `SETTLED_FRAME`), not a separate static layout. This is what keeps a
   carousel slide and a video beat of the same moment looking like the
   same film.
9. **Don't try to animate a real component's own internal numbers
   externally** (e.g. a count-up) without forking it. The working pattern:
   a separate overlay using the real formatting function, crossfading into
   the real component already at rest — see `SafeToSpendBeat` in
   `feature-spotlight.tsx`.
