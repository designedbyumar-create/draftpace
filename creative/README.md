# Draftpace Creative Engine

A separate, isolated Remotion workspace. It is never imported by, and never
imports, the Next.js app's own build — it only reads specific real source
files from `../src` as a library. Nothing in `../src` was changed to build
this.

**Read `.claude/skills/creative-engine/SKILL.md` first.** This README is
the setup/status page; that file is the full guide — the data model, the
motion primitives, how to add a product or a format, and every
environment-specific trap already hit, written so any Claude session on
any model can pick this up without re-learning them.

## All 9 products, two outputs each, all real

- **Video**: `out/<Product>-feature-spotlight.mp4` — a 9:16, ~16-19s
  Feature Spotlight (PROBLEM → NOISE → REVEAL → CTA), real licensed audio
  (Mixkit, see `public/audio/ATTRIBUTION.md`). One per product, 9 total.
- **Images**: `out/images/`
  - `Post-*.png` — **the default for "sell the product" asks.** 4
    advertising-weight promotional posts per product, one per real
    `problemsSolved` entry, pastel blobs + Newsreader headline + the real
    UI tilted/windowed into the shot, each product in its own real accent
    color. Rendered at 2 ratios (Instagram 4:5, Pinterest 2:3). 72 files
    (9 products x 4 posts x 2 ratios).
  - `Image-*.png` — a plainer 4-slide literal carousel sequence (Monthly
    Money Reset only, problem→clarity→next-move→CTA), 3 ratios, 12 files.
    Use this only when the point is the sequence itself — see SKILL.md.

## Two ways the real UI gets in

- **Monthly Money Reset**: a live, mounted `SafeToSpendCard` /
  `NextActionCard`, computing real numbers from a frozen copy of real
  seeded data (`ui-adapter/monthlyMoneyReset.tsx`). The number is actually
  computed, not a picture of one.
- **The other 8 products**: real captured screens (from the earlier
  product-reference work, honest seeded data, copied into
  `public/screens/`). No live component wired for these yet — still 100%
  real, just a photograph rather than a live instrument.

Every product's colours come from its own definition (`theme-registry.ts`),
and its name, price, list price and `problemsSolved` from its real Shop
listing (`shop-listings.ts`). Nothing about a product is typed in here;
`tests/creative-guards.test.ts` checks that it stays that way.

## Known gaps

1. **The plain carousel format still uses a system font stack.** The
   video and the promotional posts use the real brand fonts (Newsreader,
   IBM Plex Sans), inlined as base64 (SKILL.md trap #6).
2. **Monthly Money Reset's demo data is frozen, not live** — see above.
3. **The video's count-up (Monthly Money Reset only) is a separate
   overlay**, not `SafeToSpendCard`'s own digits animating — see SKILL.md
   trap #9.
4. **8 of 9 products use real screens, not live components.** A richer,
   live-computed hero (like Monthly Money Reset's) is possible for any of
   them — it's real integration work per product, not yet done.
5. **Screens are 1x captures (390px wide).** Fine in a phone at its usual
   size; a close focus zoom past ~1.2x softens them. Re-capturing at 3x is
   the fix.
6. **One music bed for every product.** The SFX kit is ours and tuned to
   the calm personality; per-product or per-mood music is not chosen yet.

## The director

New videos are planned, not templated: `director/` analyses each brief
(platform, product, audience, real material) and writes a unique,
frame-exact script with a reasoned treatment, which `film.tsx` renders.
See SKILL.md, "The Director". `node scripts/direct.mjs` plans the slate in
`director/slate.json`; every film and its treatment lands in
`shots/<product>/films/`.

## Commands

```bash
cd creative
npm install
npm run preview                          # Remotion Studio for visual review
node scripts/render-direct.mjs           # renders EVERY product's video
node scripts/render-direct.mjs <id>      # or just one — see Root.tsx for ids
npm run render:images                    # renders every slide/post x every aspect ratio, all 9 products
node scripts/check-frames.mjs [id]       # frame gate; defaults to Monthly Money Reset
node scripts/frames.mjs <id> 20 120 300  # just these frames, as a contact sheet
node scripts/synth-sfx.mjs               # regenerate the SFX kit
node scripts/direct.mjs                  # plan every film in director/slate.json
node scripts/render-direct.mjs Film-<part of id>   # render director films -> out/films/
```
