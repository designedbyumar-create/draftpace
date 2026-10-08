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

**Draftpace Studio** (`studio/`, `npm run studio`, port 3100) is the
person-facing workspace on top of this engine: Make (plan a film from a
product or guide, watched live before saving), Voice-over, Library
(live preview, script with sources, review, render, publishing copy),
Calendar, Sources, Channels, Email, Results. It plans, saves and renders
through the same code as the scripts below (`director/write.ts`,
`scripts/render-direct.mjs`), so either route gives the same files. See
`studio/README.md`.

## What this produces

**Two outputs only, by design.** Nothing else — no separate Pinterest-video
pipeline, no animated-GIF tier, no template marketplace.

- **Images.** Two image formats exist, and they are NOT interchangeable:
  - `feature-post.tsx` (a Remotion `<Still>`) — **the one to reach for by
    default.** An advertising-weight promotional post that sells one real
    problem the product solves (`problem`: an index into the product's real
    Shop `problemsSolved`) with three real things: the problem as the
    headline (Newsreader, `emphasis` words in the accent), the real UI in a
    3D phone or a live component, and the product's own `solution` text
    for that problem as a proof chip. Layouts: `tilt`, `window`, `fan`
    (three of the product's real screens, `ui.also`). A Pinterest pin is
    just this format at the Pinterest ratio; there is no separate pin
    template.
  - `feature-image.tsx` (also a `<Still>`) — a plainer, single-slide
    layout for a literal carousel narrative (`feature-carousel.shot.json`).
    Don't use it when the ask is "sell the product".
  - Posts render at `portrait` (4:5) and `pinterest` (2:3); carousel
    slides at all three ratios in `aspect-ratios.mjs`.
- **Video** (`feature-spotlight.tsx`, a `<Composition>`) for Reels,
  TikTok, Shorts, Pinterest video: "Feature Spotlight", ~19s, PROBLEM →
  NOISE → REVEAL → CLARITY → (NEXT MOVE) → CTA. One continuous set (the
  product's Backdrop under every beat), kinetic brand type, a 3D phone
  that enters, scrolls the real page and can focus a region of it, the real
  Draftpace monogram on the reveal and end card, the real list and sale
  price on the end card, sound designed from the beats, and a mastered
  soundtrack. Other video formats (before/after, launch) are future work.

**All 9 products are live**: each has a `feature-posts.json` (4 posts) and
a `feature-spotlight.shot.json` (one video). Monthly Money Reset is the one
product with a live-component adapter (`ui-adapter/monthlyMoneyReset.tsx`,
`SafeToSpendCard`/`NextActionCard` actually mounted and computing); the
other 8 use real captured screens.

## The Director: every video planned, none templated

**For any new video, use the director, not a fixed format.** It analyses
the brief and writes a unique, frame-exact script; the Film composition
renders whatever it writes. (The older Feature Spotlight is one fixed
sequence and stays only for the existing per-product spotlights.)

```
brief (product · platform · goal)            director/slate.json
  → platform profile                           director/platforms.ts   canvas, length, pacing, hook-by, sound on/off, safe area, close
  → product dossier                            director/dossier.ts     every real copy unit with its exact source, screens, motif, palette
  → structure, angle, treatment, sound          director/direct.ts      each decision recorded with its reason
  → script (scenes, frames, copy+source, shots, transitions, sfx)        director/film.ts
  → treatment document                         shots/<product>/films/<platform>--<goal>.md
  → render                                     src/compositions/formats/film.tsx (FilmComposition)
```

```bash
node scripts/direct.mjs                                  # plan the whole slate -> shots/*/films/*.film.json + .md + src/films.generated.ts
node scripts/frames.mjs Film-<product>--<platform>--<goal> --even 8   # look at it
node scripts/render-direct.mjs Film-travel               # render matching films (mastered) -> out/films/
```

**To make a new video**: add a brief to `director/slate.json` (order
matters: each film is planned knowing every film before it), run
`direct.mjs`, read the treatment `.md`, look at frames, then render. To
change a film, change the brief, the director, or the product's own
listing/screens and re-direct; never hand-edit a `.film.json` (a guard
fails on it).

How it decides:
- **Placements** (`platforms.ts`): Instagram Reel/feed, Facebook
  feed/Reel, TikTok, YouTube Short, Pinterest video, each with its own
  canvas, length range, shot length, hook deadline, reading speed,
  sound-on/off, safe area, voice and close (price / soft / save).
- **Copy is chosen, never written.** The dossier breaks the Shop listing
  into units with exact sources (`searchedProblems[2].phrase`,
  `promise#1`, `inclusions[0]:head`). The only other words allowed are
  the reviewed `MICROCOPY` list and text visible in a real capture
  (`screen:<src>#<region>`, from `director/screens.catalog.json`).
- **Nine structures**: cascade, searched (in their words), walkthrough,
  is-this-you, honest-no, what-you-get, one-screen, before/after,
  question. Each is scored for the placement and goal; a structure
  already used for this product is heavily penalised, one used on this
  platform penalised, and only structures suited to the placement
  (fit > 0) are considered.
- **Treatment from the product's identity motif** (its `theme.identity.
  motif`): timeline → lateral slides and a progress rail; ledger → row
  wipes and ruled lines; gauge → radial sweeps and an arc; card/index →
  card slides and tabs; book → page turns and a spine; register →
  line-wipes and check-ticks; focus → iris and a spotlight; tag → rising
  tags. Camera, ground rhythm and voice follow the placement's energy and
  the accent's temperature.
- **Timing is reading time**: each scene holds for its words at the
  placement's seconds-per-word; pace only tightens the air around them.
  Too long → trim list items, cut optional scenes (a short placement's
  brand beat first: the end card names the product), shorter real
  captions (the same idea in the product's own words only), then
  re-plan with fewer words per unit, then the runner-up structure.
- **Never the same film twice**: a film's *shape* (structure, scene
  kinds/variants, grounds, transitions, poses, camera, voice) is compared
  with every film already in the slate; above 0.7 similarity the director
  varies its own treatment and records why.
- **Sound is designed from the script**: transition cues by motif
  (page-turn for book, ticks for ledger/register), ticks under lists, a
  riser into an impact on the reveal when the placement has energy, pops
  as UI lands, a tap on focus, a settle on the close; lighter and quieter
  on sound-off placements; bed level by energy, ducked under the big
  moments; mastered.

**Guards** (`creative/tests/film-guards.test.ts`, run by the root
`npm run test`): every on-screen word equals its source; screens are the
product's own and focus regions sit inside the capture; every scene is
held long enough to read; canvas, length range, hook-by and sound cues
per placement; no structure or hook repeated within a product; no two
films' shapes at or above 0.7; and the committed films equal what the
director produces now, so a listing change forces a re-direct.

**Adding a structure**: one entry in `STRUCTURES` (`direct.ts`) with its
purpose, platform and goal fit, an `available` check against the dossier,
and a `plan` that builds scenes from real copy units. Adding a scene kind
or variant: the `Scene` type, a block in `film.tsx`, and sound in
`soundFor`. Adding a screen: capture it, run `screens-manifest.mjs`, and
describe it (heading, what it shows, focus regions in capture px) in
`screens.catalog.json`.

## Guide-driven Shorts: teach first, then the product

`slate.json`'s `guides` list names a guide and a placement (today: each
life area's three start-here guides as YouTube Shorts). The product is
never chosen by hand: it is the first of the area's products **the guide
itself links to** (`productForGuide` in `director/guide.ts`).

- **Words come from the guide**, with sources like
  `guide:<slug>/body[3].items[1]#0` (an item's first sentence: guides
  write the instruction first and explain after) or
  `guide:<slug>/body[2].steps[0].when`; links and emphasis are stripped
  to their words, nothing else changes. `guide:<slug>/url` is the
  address the film ends on.
- **Four guide structures** (`GUIDE_STRUCTURES`): *In order* (the guide's
  timeline, its real markers as eyebrows), *Do this* (numbered steps, only
  an unbroken run from the guide's step 1, numbered as the guide numbers
  them), *The checklist* (a tickable list, or a list whose heading can sit
  above it), *The question people ask* (an FAQ question and its answer's
  first sentence).
- **The turn** to the product uses the listing's own answer written for
  that guide (a `searchedProblems` entry with `guideSlug`) when there is
  one, else its line closest to the guide's topic, never a line opening
  on "Then/And". The screen (or live component) is matched to that
  caption by `relevance()`, which weights words by how rare they are
  across every product, so "subscriptions" counts and "own" does not.
- **The close** is the guide's address first, the product and price
  beneath it (`cta` variant `guide`).
- Guide films run 18–45s on YouTube (`GUIDE_RUNTIME`): they teach.
  Written to `shots/guides/<guide>/<platform>.film.json` and `.md`.

Guards: the product is the one the guide links; at least two scenes of
the guide before any product words; ends on the guide's address; step
numbers equal the guide's own.

## Voice-over to visuals: your words, real pictures, your length

When you have a script (and maybe a recording) and need visuals for it:

```bash
mkdir voiceover/my-video                 # script.txt; optional captions.srt and voice.mp3/.wav/.m4a
node scripts/voiceover.mjs my-video --product travel-companion --seconds 60
node scripts/voiceover.mjs my-video --guide what-to-do-when-a-parent-dies   # product from the guide
node scripts/render-direct.mjs Film-vo-my-video
```

- **Length**: `--seconds` 10–180 (15, 30, 45, 60, 90, 120, 180 are the
  usual). With a recording the film runs as long as the recording; with a
  caption file (SRT, which CapCut, Descript and most editors export)
  every cut lands exactly on its line. The shot list says when the pace
  is too fast or slow for the chosen length and what length suits it.
- **Each line gets the visual whose words match it best**: a real screen
  (with the matching region in focus), a live component, a guide
  checklist (only on a strong match, once), the line itself as type
  (short lines, and always the opening line), the name reveal when the
  line says the product's name, and the end card on the last line. Never
  the same visual twice in a row; a line over 6s is split into pictures
  (none under 2.4s) at caption breaks. When nothing matches, the shot
  list says it is B-roll rather than claiming a match.
- **Captions are your words**, cut where a person pauses (optimised over
  the whole line, never ending on "the"/"your"/"it"), each on screen
  while it is said. Source `vo:<name>#<line>@<from>-<to>` is checked
  against the script by the guards.
- Settings persist in `voiceover/<name>/voiceover.json` (including the
  recording's measured length), so re-running needs only the name, and
  `node scripts/voiceover.mjs` alone re-plans them all. Recordings
  themselves are gitignored.

Guards: every line captioned in full and in order, captions in time and
inside their shot, the length is the recording's / caption file's /
chosen one, and the caption cutter's behaviour.

## Where every fact in a creative comes from

Nothing about a product is typed into this workspace. A creative reads:

| What | From |
|---|---|
| Colours | `theme-registry.ts`, which reads each product's own `definition.ts` (`theme.accentScale` + `theme.ground`), the platform ground (pinned to `globals.css` by a test) for products without one, and Monthly Money Reset's scoped `theme.ts` |
| Name, price, list price | `shop-listings.ts`, which reads `src/shop/products/<slug>.ts` — the same object the Shop and checkout read. Shot text says `{price}` / `{name}`, never a figure |
| The problem a creative sells and the answer it shows | that listing's `problemsSolved[problem]` |
| UI | a real captured screen in `public/screens/`, or a live component |
| Logo | `@/design-system/Logo` (`LogoMark`), coloured with the product accent |

Change any of those in the app and the creatives follow on the next
render.

## The one hard rule: real UI only

Every screen, card, number and computed result in an output must come from
an actual Draftpace component, calculation function, or captured screen —
never recreated. There are two legitimate ways to do this; pick the
cheaper one unless the richer one is actually needed:

**Option A, real captured screen (what 8 of 9 products use today).**
1. Capture the real screen (honest seeded data, tour overlays dismissed)
   at the 390px iPhone viewport. A capture may be taller than one viewport
   (a whole page); the phone scrolls it.
2. Save it as `creative/public/screens/<product>-<screen>.png` and run
   `node scripts/screens-manifest.mjs` (the phone needs each capture's
   height; a test fails if the manifest is stale).
3. Reference it: `{ "kind": "screen", "src": "screens/<product>-<screen>.png" }`.

**Option B, a live component (what Monthly Money Reset's cards use).**
See `src/ui-adapter/monthlyMoneyReset.tsx`:
1. Import the real presentational component. It must be prop-driven with
   no data-fetching of its own.
2. Import the real calculation functions it needs, not reimplemented math.
3. Wrap it in the product's real scoped theme tokens (`demo.themeStyle`) —
   without them the card renders without its own colours.
4. Feed it a frozen copy of real seeded data, with a comment stating which
   real values it reproduces.

If neither a real screen nor a real component exists yet for what's being
asked, that's a stop condition: say so, don't invent it. The only exception
is the "before Draftpace" half of a Feature Spotlight (problem/noise
beats) — kinetic typography only, never a mocked-up UI.

**The rule is enforced, not just written down.** `creative/tests/
creative-guards.test.ts` (run by the main `npm run test`) fails on: a
screen that isn't on disk, another product's screen, a hardcoded price, a
headline that doesn't read as the real problem it names, an emphasis word
the text doesn't contain, an unknown sound cue, a stale screen manifest,
and theme drift from the products or `globals.css`.

## Quick start

```bash
cd creative
npm install              # first time only (the app's own npm install must have run too)
npm run preview          # Remotion Studio — scrub the timeline
node scripts/render-direct.mjs                                    # every video, mastered
node scripts/render-direct.mjs TravelCompanion-FeatureSpotlight   # one video (ids: Root.tsx)
node scripts/render-images.mjs                                    # every still
node scripts/render-images.mjs travel-companion --ratio pinterest # filtered: id substrings, one ratio
node scripts/frames.mjs TravelCompanion-FeatureSpotlight 20 120 300   # just these frames + a contact sheet
node scripts/contact-sheet.mjs out/sheet.png 6 out/images/Post-*-portrait.png
node scripts/check-frames.mjs [composition-id]                    # frame-gate QA
node scripts/synth-sfx.mjs                                        # regenerate the SFX kit
```

(NOT `npm run render` / `remotion render` directly — see trap #1.)

**Always look at the actual render before calling something done.** Use
`frames.mjs` for a video (seconds, not a full render) and `contact-sheet.mjs`
for a batch of stills, then read the sheet. A render that "completed
without error" is not the same as one that looks right: in this engine's
history that step caught wrong captions, a headline wrapping word by word,
words running together, a live card rendering without its colours, a
duplicated "Free", and a phone overlapping the footer.

## Architecture

```
creative/
  webpack-override.mjs        # THE shared webpack fix (alias + PostCSS) — see traps below
  aspect-ratios.mjs (+ .d.mts) # the 3 image ratios: square/portrait/pinterest
  src/
    index.ts, Root.tsx        # registers every Composition and every Still
    theme-registry.ts         # every product's palette, read from its own definition
    shop-listings.ts          # name / price / list price / problemsSolved, from the real Shop listing
    screens-manifest.json     # pixel size of every capture (scripts/screens-manifest.mjs)
    visual/                   # Backdrop (light fields, grain, vignette), Phone (3D device, scroll, focus), Kinetic (word reveal, emphasis, fitFontSize)
    motion/                   # camera, typography, transitions (edgeStyle: blurDissolve|wipe|zoomThrough|slideUp), ui (count-up), sound-cues (cue -> file), sound
    compositions/formats/     # feature-spotlight.tsx (video), feature-post.tsx (posts), feature-image.tsx (carousel slides)
    ui-adapter/               # live-component adapters (monthlyMoneyReset.tsx)
  shots/<product>/            # the data: feature-spotlight.shot.json + feature-posts.json
  public/screens/             # real captures
  public/audio/               # Mixkit bed + legacy SFX (ATTRIBUTION.md); audio/kit/ = our own synthesized SFX
  scripts/                    # render-direct (+ master-audio), render-images, frames, contact-sheet, check-frames, synth-sfx, screens-manifest, capture-screens, stale-screens, review, publish-pinterest, browser, inline-fonts
  tests/                      # the real-UI guards (run by the root vitest)
  out/                        # rendered output, gitignored
```

**The shot data model is the interface.** A new creative is almost always a
JSON edit, not new component code:

```jsonc
// spotlight (shots/<product>/feature-spotlight.shot.json)
{ "product": "travel-companion", "themeSlug": "travel-companion", "problem": 0, "beats": [
  { "id": "problem", "kind": "typography", "startFrame": 0, "durationFrames": 85,
    "typography": { "lines": ["Confirmation numbers live", "in six different", "inboxes."], "emphasis": ["six"] },
    "transition": { "out": "blurDissolve", "frames": 15 } },
  { "id": "reveal", "kind": "screen", "startFrame": 230, "durationFrames": 200,
    "screen": { "src": "screens/travel-companion-trip.png",
                "scroll": [[0.3, 0], [0.85, 0.5]],                     // optional; tall pages auto-scroll
                "focus": { "at": 0.6, "top": 0.42, "height": 0.12 } }, // optional; region of the page
    "transition": { "in": "zoomThrough" }, "caption": "..." },
  { "id": "cta", "kind": "cta", "startFrame": 430, "durationFrames": 90,
    "typography": { "headline": "Available now." }, "cta": { "label": "Shop", "url": "draftpace.com/shop" } } ] }

// post (shots/<product>/feature-posts.json)
{ "id": "01-travel-companion", "themeSlug": "travel-companion", "problem": 0, "layout": "tilt",
  "eyebrow": "TRAVEL COMPANION", "headline": ["Confirmation numbers live", "in six different", "inboxes."],
  "emphasis": ["six"], "ui": { "kind": "screen", "src": "screens/travel-companion-itinerary.png" } }
```

Line breaks in `lines`/`headline` are deliberate and never re-wrapped:
`fitFontSize` sets a long line smaller instead. Keep text inside the
spotlight's `SAFE` area (platform UI covers the top ~240px and the bottom
~420px of a 9:16 frame).

## From capture to publishing

```
capture-screens.mjs  ->  render  ->  review.mjs  ->  publish-pinterest.mjs
(real app, 3x,           (render-direct,   (out/review/index.html:   (approved pins -> hosted JPEGs +
 provenance)              render-images)    approve/reject, export)    Pinterest bulk-upload CSV)
```

- **Capture**: `CAPTURE_EMAIL=... CAPTURE_PASSWORD=... node
  scripts/capture-screens.mjs [filter]` re-takes every screen in
  `public/screens/` from its own route (`<product>-<destination>.png` is
  `/app/products/<product>/<destination>`), at 3x, as a returning user
  sees it (tour marked seen via the app's own `draftpace-tour-<slug>`
  key), and records route + commit + time in `src/screens-provenance.json`.
  Needs the app running against a Supabase project with a **seeded demo
  account, never a real person's**. Not possible inside a container
  without that (no Docker daemon in Claude Code cloud sessions).
- **Freshness**: `node scripts/stale-screens.mjs` lists screens whose
  product UI changed in git since capture (and screens with no
  provenance). CI prints it to the job summary; `--strict` makes it fail.
- **Review**: `node scripts/review.mjs`, open `out/review/index.html`,
  approve/reject with notes, "Export decisions" -> `approvals.json`.
- **Publish (Pinterest)**: `node scripts/publish-pinterest.mjs
  approvals.json` converts approved pin-ratio posts to
  `public/store/pinterest-creative/<product>/<id>.jpg` and writes
  `out/pinterest-<date>.csv` in Pinterest's bulk-upload columns. Title,
  description, link, name and price all come from the post and the real
  Shop listing; boards come from `creative/publishing.json`
  (`{ "pinterestBoards": { "<slug>": "<board>" } }`) and are left blank,
  with a warning, when unset. It prepares an upload; it posts nothing.
  The JPEGs only resolve as Media URLs once deployed.

## Adding a new product

1. Nothing to do for colours, name or price: `theme-registry.ts` and
   `shop-listings.ts` each need one import line for the new product's
   definition and Shop listing.
2. Capture 1-4 real screens (Option A above), run `screens-manifest.mjs`.
3. Copy an existing product's `feature-posts.json` and
   `feature-spotlight.shot.json`; write headlines from the product's real
   `problemsSolved` and set `problem` to match.
4. Add the imports to `Root.tsx`'s `ALL_SPOTLIGHTS/ALL_POSTS`.
5. `npm run test` (guards), `frames.mjs` / `contact-sheet.mjs`, read them,
   then render.

## Adding a new format

A format is one React component in `compositions/formats/` that interprets
a shot shape, built from `visual/` and `motion/`. Check what exists first
(below). Don't add an abstraction until a second real use needs it.

## Visual and motion primitives that exist today

- `visual/Backdrop`: the product palette as slowly drifting light fields,
  animated film grain, vignette. `frame` drives it; `motion={0}` for stills.
- `visual/Phone`: a real capture in a 3D phone (`rotateX/Y/Z`), `scroll`
  0..1 down the real page, `focus` (dim the rest, ring the region);
  `scrollToFocus`, `overflowPx`, `screenSize` helpers.
- `visual/Kinetic`: `KineticHeadline` (masked word rise with blur, accent
  emphasis with a drawn underline; at a large `frame` it is the settled
  headline, which is how stills use it), `fitFontSize`.
- `motion/transitions`: `edgeStyle(kind, "in"|"out", p)` for
  `blurDissolve`, `wipe`, `zoomThrough`, `slideUp`; legacy `blurDissolve`.
- `motion/ui`: `countUpValue`, `cardPop`. `motion/camera`: `pushIn`.

Not built yet: cursor choreography, list population, chart animation,
match cuts, light leaks. Add them when a real creative needs one.

## Audio

**Sound design is derived from the beats** (`soundCues()` in
`feature-spotlight.tsx`), not placed by hand: whoosh/swish on each
transition, ticks under the noise beat, a riser into the reveal landing on
a soft impact plus shimmer, a pop as UI lands, a tap on a focus, a settle
on the CTA. The bed ducks under the riser, impact and settle. A beat's own
`sound.sfx` still plays on top.

**The SFX kit is ours**: `scripts/synth-sfx.mjs` synthesizes it
(deterministic, seeded) into `public/audio/kit/`. Tune a sound there and
re-run it; check the result with a spectrogram and level readout (a model
can't listen), looking for hard tail cuts, ringing and clipping.

**Mastering**: `render-direct.mjs` masters every video
(`scripts/master-audio.mjs`): gain to about -15 dB, look-ahead limiter at
-1 dBFS, video stream copied untouched. Remotion's own mix is right in
balance but ~10 dB too quiet for social platforms.

The music bed and the legacy SFX are Mixkit (see
`public/audio/ATTRIBUTION.md`). **Never download audio from anywhere
without the user's explicit go-ahead first**, every time.

## QA

- `npm run test` (root) runs the real-UI guards.
- `scripts/check-frames.mjs` samples a video's frames for corrupted or
  missing frames and extreme luminance jumps.
- The Creative CI workflow (`.github/workflows/creative.yml`) typechecks
  this workspace, renders one post per product and one frame-gated video
  on every relevant change, and uploads the renders as an artifact.
- None of these replace looking: see Quick start.

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
   Both `feature-spotlight.tsx` and `feature-post.tsx` set type in
   "Newsreader" / "IBM Plex Sans" from this file; only the plain carousel
   (`feature-image.tsx`) still uses the system fallback in `style.css`.
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
10. **Remotion downloads its own Chromium on first render**, from
    remotion.media, which a network allowlist (Claude Code cloud sessions)
    answers with a 403. `scripts/browser.mjs` passes `browserExecutable`
    to every renderer call: `REMOTION_BROWSER_EXECUTABLE`, else a
    Playwright headless shell under `PLAYWRIGHT_BROWSERS_PATH`, else
    Remotion's own download. Any new script that renders must pass it too.
11. **A render script that finishes but never exits** is a pending
    `withTimeout` timer, not a hang: the 15-minute timeout kept the
    process alive long after "done". The scripts now end with
    `process.exit(0)`; keep that in any new one, or CI burns 15 minutes.
12. **The root typecheck must not see `creative/`.** Root `tsconfig.json`
    excludes it and root eslint ignores it, because CI's root `npm ci`
    never installs creative's dependencies (remotion and friends); the day
    the engine was first committed, that turned main's CI red. creative/
    has its own typecheck in the Creative workflow. Code under
    `creative/tests` must therefore import nothing from remotion (that's
    why `motion/sound-cues.ts` exists apart from `motion/sound.ts`).
13. **Inline-block word spans eat the space between words.** Kinetic type
    splits a line into one span per word; the space has to be padding on
    each span (`0.25em`), or "numbers live" renders as "numberslive". And
    an SVG `pathLength` dash trick breaks with
    `vector-effect: non-scaling-stroke` (the underline rendered dashed).
14. **Live components need their scoped theme tokens.** Monthly Money
    Reset's cards read `--mmr-*`, set by `demo.themeStyle`; any new stage
    that mounts them must spread it, or the hero panel renders white.
15. **Remotion's ffmpeg is a minimal build** (no `showspectrumpic`,
    `loudnorm`, `ebur128`). It decodes, encodes AAC and muxes, which is
    all `master-audio.mjs` needs; analysis is done in plain JS on PCM.
16. **Guide films depend on `src/content/guides.ts`.** Editing a guide
    (or a listing) changes the films planned from it, and the guard that
    compares committed films fails until `node scripts/direct.mjs` is
    re-run and committed. That is the point: a film never quotes a guide
    that has since changed.
17. **Plain word overlap picks the wrong screen.** A caption about
    subscriptions matched the Debt screen on "own", "find" and "date".
    Match captions to screens with `relevance()` (weighted by rarity
    across all products), not `overlap()`. Product films still use
    `overlap()` because they were reviewed with it; move them over only
    with a re-review.
