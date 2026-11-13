# Posting copy for the Home Base pins (brief for copy writers)

For each pin you are given, write what is typed when posting it by hand on Pinterest: a description, 8 tags and the alt text. The title, board and link come from the idea bank (`../ideas-101.json`) and are added by the packager. Your output is one module `pinterest/homebase/post/copy-<name>.mjs` (see `creative/pinterest/homeschool/post/batch-4.mjs` for the exact shape and tone; read it first):

```js
export const PINS = [
  { n: 10, tags: ["...8 tags..."], description: `...`, alt: `...` },
];
```

Rules:
- `description`: at most 480 characters. Plain US English, no exclamation marks, no em dashes. Use ONLY the guide's own wording and facts (the idea record's `sub`, `items` and `proof`, and the guide in `src/content/guides.ts` found by its slug, or the product listing `src/shop/products/home-management-companion.ts` for product pins). Search words early. Never state a price, a discount or a deadline. Never claim bank linking, that the app cancels anything, net worth calculation, investment tracking, tax preparation or financial advice. Keep a guide's own limit when it states one ("a month-level estimate", "you type everything in"). Guide pins end with nothing promotional; product pins may name Home Base and the real feature in plain words from the listing. Where a figure is the guide's own made-up example, say it is an example ("Example only"). Where a pin concerns the user's own situation, add the guide's own caution if it has one.
- `tags`: exactly 8 Pinterest "tagged topics": real phrases a US adult types (lowercase, 2 to 4 words), the pin's own search phrase (`query` in the record) first, then closely related ones; no hashtags, no brand names of other products or banks.
- `alt`: at most 480 characters. LOOK at the pin image (the PNG path is given; the Read tool shows images) and describe what is visible in plain words: the scene, the objects, and the text printed on the pin (headline and the main items). Never describe what is not there.
- Do not edit any other file; do not commit. Verify lengths with a short node script before you finish (description and alt <= 480, 8 tags each, no "$" followed by the listing price, no "!" and no "—"). Report the count, and anything you could not ground.
