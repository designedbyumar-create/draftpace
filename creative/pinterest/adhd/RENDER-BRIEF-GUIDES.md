# The 81 guide pins (builder addendum). Read RENDER-BRIEF.md first; everything there applies.

The 20 product pins are finished: LOOK at them in `creative/out/adhd/pins/` (027, 031, 033, 035, 037, 041 are the whole-page guide-style pins; 003 to 023 printable mockups; promos 001 to 029) so the style stays one family. The remaining 81 pins link to FREE GUIDES: the foot says "Free guide" (use `footFor(i)`, never write a price). They are `page()` designs from `creative/pinterest/v3/kit.mjs` with `idea(n)` and `footFor(i)` from `../kit/bank.mjs`: a paper header block carrying the bank headline split at its colon, a scene, a paper footer. Headline at least 56 px (70 to 76 px as in the finished pins), never touching the product line. Pins whose record has `flags: ["example-tag"]` show the kit's small "Example" tag (24 px or more) next to any guide example figure, name, or amount.

Angles: script-card (a real opening line or script large on a card or screen, in quote marks), checklist (the real items, handwritten or typeset, boxes), how-to-steps (numbered steps, the real wording), question (the question and the real answer lines), scenario (a drawn desk moment from the guide's own example), before-after (two real states, an arrow), comparison (two columns, this-not-that), infographic (a diagram that carries the real labels), myth-vs-truth, quote-card, template-preview (a filled-in sheet or note from the guide's own example, with the Example tag). Words on a pin are the record's `headline`, `sub`, `items` (verbatim, capitalisation may change) or labels real to the thing drawn. Never invent words, numbers, dates, names or amounts; where the guide's example has names or figures they come from `items`/`proof` and carry the Example tag.

No app screens on guide pins unless a record's `visual` names one (then use the captures listed in RENDER-BRIEF.md). Never write lazy, cure, fix, diagnose or treat; no scores, streaks, percentages, "late" badges or countdown drama; no logos of real companies, banks, airlines or clinics; no real brand names on props.

## Worlds (each builder owns exactly one; every pin of yours must differ from your others in surface, layout, tilt, colour mood, hero objects, and nothing may use another builder's world)
w01 telephone desk: a landline handset and curly cord, an address book, a notepad under a pen, a desk lamp, a headset; plum, brass and walnut.
w02 inbox and laptop: drawn laptop and monitor windows (compose window, inbox rows with blurred non-words, a send button without words that are not on the record), a keyboard edge, a mug; cool blue-grey and white.
w03 mail pile: kraft and window envelopes, a letter opener, a recycling bin, rubber bands, a mail tray, a door mat; warm kraft, cream, a slice of floor.
w04 folders and filing: manila folders with tabs, a filing box, paper clips, a stamp pad, dividers, a cabinet drawer edge; manila, olive, steel.
w05 kitchen counter and fridge: a counter with a fruit bowl and a mug, a fridge door with magnets and a calendar, a tea towel, a tiled splashback; sage-cream, terracotta, white.
w06 sticky notes and monitor edge: a monitor bezel, walls and columns of butter sticky notes, a desk lamp, a pen pot, coloured flags; butter, graphite, a little teal.
w07 clock and calendar: wall clock, wall calendar page with circled cells (no numerals unless the record gives one), a kitchen timer, an alarm clock, a wristwatch; navy, brass, paper white.
w08 planner and stationery: open planners, washi tape, pens, a stack of notebooks, a pencil case, paperclips, ribbon bookmarks; blush, gold, deep plum.
w09 Sunday reset table: a tray, three small baskets, a mug of tea, a small plant, a kitchen timer, a cloth napkin, morning window light; oatmeal, sage, soft mulberry.
w10 whiteboard and corkboard: a whiteboard with marker strokes, a corkboard with pushpins and string, index cards pinned, a marker tray, a magnet row; white, cork, a mulberry marker.
w11 waiting room and clinic desk: a clipboard with a form, an appointment card, a plastic chair, a plant, a pen on a chain, a reception counter edge; teal-grey, cream, soft green.
w12 brain-fog evening: a sofa arm, a throw blanket, a rainy window, a mug, a lamp's soft glow, a phone face down, a knitted cushion; dusk blue, warm grey, a candle.
w13 winter holidays: kraft wrapping, string, evergreen sprigs, gift tags, a returns box, a package with tape, a candle; deep green, kraft and a little red-berry, with mulberry accents (no Santa, no logos).
w14 study desk: a banker's lamp with a green shade, a stack of notebooks, a pencil cup, a desk blotter, a bookshelf edge, a globe; green, brown leather, cream.

Name your file `ad-wNN.mjs` (the filter must include `.mjs`) and render with `cd creative && node pinterest/adhd/render-pins.mjs ad-wNN.mjs --only <your numbers>`. Finish when every pin is one you would post, then report (pin numbers and PNG paths, what each shows, every word not verbatim from the bank, deviations).
