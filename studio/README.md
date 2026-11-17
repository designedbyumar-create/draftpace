# Draftpace Studio

The internal content studio: log in, pick what you want, click Make, review,
render, schedule. It drives the Creative Engine (`../creative`) directly, so
everything it shows is real: real products and guides from the site, real
screens, the real film composition playing live in the browser.

## Run it on your computer

You need [Node.js](https://nodejs.org) (version 22 or newer; the "LTS" download is right) and
this project on your computer. Then, in the project folder:

```bash
npm install        # first time only
npm run studio     # every time: starts Studio and opens it in your browser
```

- The first start also installs the video engine's own packages (a few
  minutes, once). The first page then takes about a minute to prepare.
- Studio runs at http://localhost:3100 while that window is open. Press
  **Ctrl+C** there to stop it.
- The first render downloads Remotion's own browser (once). Renders run on
  your computer: a 30-second film takes a few minutes.
- Works on Mac, Windows and Linux. Nothing here costs money.
- What you make is saved as files in `creative/` (films, scripts,
  voice-overs) and `studio/.data/` (reviews and the calendar). Commit and
  push `creative/` to keep your films in GitHub; `studio/.data/` stays on
  your computer.

## What each area does

| Area | What you do | Works now |
|---|---|---|
| **Today** | What needs review, what goes out in the next 14 days, which guides to make Shorts from next (areas with the fewest first), channel status | Yes |
| **Make** | Product or guide → placement → goal → **Plan**. The director plans against the whole library so it never repeats; the film plays live; **Save** adds the brief to `creative/director/slate.json` and writes it to `creative/shots/` | Yes |
| **Voice-over** | Paste a script, pick 15s–3 min (or let a recording or caption file set it), see pace, the shot list to scale, and the film live as you type; add a recording; save | Yes |
| **Library** | Every film with filters; each film page has the live player, the rendered file, the scene-by-scene script with sources and reasons, review (approve / changes / reject), render with progress, download, scheduling, and publishing copy (title, caption, alt text, tracked link) drafted from the film's own words | Yes |
| **Calendar** | Month view of scheduled posts; mark posted; approved films waiting for a day | Yes, saved locally; posting by hand until a channel connects |
| **Sources** | The 9 products and every guide, with what each has made and a Make button | Yes |
| **Channels** | Each platform's job, what connecting it takes, and whether its credentials are set | Status is real; posting APIs are the next phase |
| **Email** | Any guide as an email, previewed; sending status | Drafts work; sending needs consent and a Resend key |
| **Results** | Every tracked link that went out | Links yes; visit counts once Google Analytics is connected |

## How it is built

- A Next.js app in its own folder, on the website's toolchain (`npm run
  studio` = `next dev studio`). It imports the website's design system and
  tokens (`@/…`), and the engine (`@engine/…`); see `next.config.ts`.
- **Live preview** is `@remotion/player` running the engine's own
  `FilmComposition`, so what plays is what renders. The engine's
  `public/` (screens, sound, fonts) is served at `/screens`, `/audio`, …
- **Server-only code** lives in `lib/server/` (the engine bridge, the store,
  render jobs). Pure logic (`lib/publish.ts`, `lib/email.ts`,
  `lib/access.ts`, `lib/channels.ts`) is guarded by `tests/studio.test.ts`,
  which the root `npm run test` runs.
- **State** (reviews, schedule, render history) is one JSON file in local
  mode, `studio/.data/state.json`. Hosted Studio moves it to Supabase:
  `supabase/schema.sql` has the same shapes.
- **Rendering** runs `creative/scripts/render-direct.mjs` as a child
  process, one film at a time, progress read from its log.
- **Saving** writes through `creative/director/write.ts`, the same code the
  command-line scripts use, so a film saved here is byte for byte what
  `node scripts/direct.mjs` writes. Commit the changed `creative/` files to
  keep them.

## Access

Open on your own machine in development. Set `STUDIO_ACCESS_KEY` to require
a key (stored as a hashed, httpOnly cookie). In production Studio refuses to
run without one. Supabase login replaces this when Studio is hosted.

## Checks

```bash
npm run studio:typecheck
npx vitest run studio/tests
npx eslint studio
node studio/scripts/screenshots.mjs / /library /make      # look at pages (Studio running)
node studio/scripts/flow.mjs <film-id>                    # approve → schedule → render, through the UI
```
