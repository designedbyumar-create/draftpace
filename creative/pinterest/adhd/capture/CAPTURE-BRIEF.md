# ADHD Life Companion: capturing the missing real screens

Template: `creative/pinterest/homebase/capture/` (`screens.mjs`, `harness/`, `lib/screen-harness.mjs`) and `creative/pinterest/pfc/capture/`. Copy them into `creative/pinterest/adhd/capture/` and adapt. Remember the Tailwind bug: `tailwind.config.js` is an ES module, so use `mod.default ?? mod`. Mount the REAL components of `src/products/alongside/components/` (NowView / NowModule, CompanionRun with the real playbooks in `src/products/alongside/playbooks/`, SettingsView, LifeModule) with the Supabase layer and Next navigation stubbed, light theme, 390 css px wide, device scale 2 (780 px), no dev badge, no header or tab bar unless it is part of the screen, fixed clock. Output to `creative/out/adhd/assets/` and list each file in `CAPTURES.md` with what it shows and how it was reached.

Screens wanted (all stub data typed the way a person would; every word on screen is computed by the real code):
1. `now-quiet.png`: Now with nothing needing attention ("Nothing needs you right now", "Anything you have recorded is still here in Life.", Keep something button).
2. `now-first-run.png`: Now in the first-run state ("What is one thing that has been sitting there?" and the four ways to start).
3. `now-one-card.png`: Now with one real card (a plain stub item such as a dated "something to do"; use a bland title typed as a person would, like "Ring the dentist").
4. `opening-line.png`: Make a phone call walkthrough at the "Your opening" step with the "Cancelling something" suggested line and the "Change any of this, or write your own." note.
5. `first-physical-step.png`: Break something down at "What is the first physical step?" with its why line and the real placeholder "Ring the charity shop about collection".
6. `how-did-it-go.png`: the "How did it go?" outcome step of Make a phone call with its four choices.
7. `billing-worth-having.png`: Sort out a billing problem at the "Worth having in front of you" step.
8. `reminders.png`: Settings > Reminders with remindersEnabled true ("Remind me on the date I chose", "Say what it is about" off, Quiet hours).
9. Optional: `difficult-call-opening.png` (Make a difficult phone call, opening step) if cheap.
Check each PNG by looking at it. Never show an activation code. Do not edit anything under `src/`. If a screen cannot be reached honestly, say why instead of faking it.
