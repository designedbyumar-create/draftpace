# Rendering the Homeschooling Companion mockup pins (brief for pin builders)

You build some of the 26 mockup-style pins (10 app-store promos like `reference-mockup.png`, 16 printed-page mockups). A pin is one module in `creative/pinterest/homeschool/pins/` exporting `pins` (an array of `{ n, id, html }`; `n` is the idea's number in `ideas-101.json`). Look first at the two finished examples and their renders:

- `pins/app-example.mjs` (idea 55: an app promo) -> `creative/out/homeschool/pins/055-*.png`
- `pins/printable-example.mjs` (idea 4: a printed page on a clipboard) -> `creative/out/homeschool/pins/004-*.png`

Render yours from `creative/` with `node pinterest/homeschool/render-pins.mjs --only 59,63` (idea numbers). It prints `⚠` when a headline/feature/list overflows, leaves the page or runs into the product line. Then READ each PNG (the Read tool shows images) and fix what you see until you would post it. Contact sheet: `out/homeschool/pins/sheet-<numbers>.png`.

## The kit (`pinterest/homeschool/kit/`, do not edit)
- `bank.mjs`: `idea(n)`; `C` (plum, plumDeep, plumSoft, cream, oak, kraft, ochre, sage...); `footFor`.
- `assets.mjs`: `bookPage(n)` (1-30, the real pages of The Homeschool Year at 200 dpi, 1700x2200), `screen("kids"|"record"|"workspace")` (the three real app screens, 390 px wide), `asset(name)` (anything else produced under out/homeschool/assets, e.g. record pages from a capture run).
- `phone.mjs`: `phone({ src, y0, y1, width, tilt, x, y, closed })`: a phone showing the strip y0..y1 of a REAL screenshot (capture pixels; crop above the dev badge at about y 780 and the tab bar).
- `promo.mjs`: `promo({ n, screen: { src, y0, y1, width, tilt }, prop, tone: "plum"|"deep"|"berry", wave: 0|1|2, display, highlight, features, headSize, extraCss })`. App name, tagline, display lines, highlight and feature rows default to the bank's own for that idea; a display line may use only words of the idea's headline (it throws otherwise). The headline and the feature column are on the left, the phone below the headline on the right bleeding off the edge, the product line on the band at the foot. For a custom phone arrangement pass `phone: "<html>"` instead of `screen` (absolutely placed in the 1000x1500 pin).
- `printable.mjs`: `printable({ n, scene, paper, extraCss })` and `SCENE_TOP` (372): the cream header block with the bank's headline (split at its colon into a small title and a big line) and sub, and a cream footer with the product line. Your `scene` is HTML that fills y 372..1354 (start desks/backgrounds at `top: SCENE_TOP`).
- `paper.mjs`: props in pin coordinates: `desk`, `sheet({ src, x, y, w, tilt, crop })` (a real page; `crop` is fractions of the page), `pencil`, `mug`, `clipboard`, `binderClip`, `books`, `drawing`. You may add your own props and scenes in your pin file (SVG/CSS): ring binder, kraft folder, cork board, washi tape, push pins, kitchen table, wall, folder tabs, a ruler, an eraser... Draw them well: flat vector, soft shadows, real colour (oak, kraft, cream, ochre, sage, plum), like the examples.
- `icons.mjs`: `icon("calendar-check", { size, color, weight })` (Phosphor only).

## Rules
1. Words. Every word on a pin comes from the idea bank (headline, sub, items, features, proof) or is a label that is real on the page/screen being shown. No invented words, numbers, dates, claims or entries. A printed page stays exactly as printed (no ticks, no filled-in rows). Real screens are used as captured (demo rows like Ava and Leo appear as the screen shows them; never edit a screen).
2. Never redraw a screen or a page; crop and place the real image. The page or screen is the hero: a printed page at least 55% of the pin width; a phone at least 430 px wide.
3. Every pin must look different from its neighbours: a different scene/background, tilt, colour mood and props. App promos: vary `tone`, `wave`, tilt direction (positive leans right, negative left), crop, and prop. Printables: no two on the same desk-and-clipboard scene.
4. Props go where they do not cover text: in an app promo the left column is full of feature rows, so put props at the bottom right in front of the phone's foot or in the very bottom strip (y > 1290); in a printable keep props off the page's text.
5. Text you set yourself (labels, callouts) is at least 22 px, high contrast. Price only in the product line, never in the art.
6. Only create your own `pins/<name>.mjs`. Do not edit kit files or other pins, and do not commit. If the kit needs a fix, say so in your report.
7. Report: the pin numbers and PNG paths, what each shows (scene, screen/page, crop), anything you could not do and why.
