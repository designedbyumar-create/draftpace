# Playwright E2E suite

Requires a dedicated Supabase test account (never a real user's) and a dev
server. Set before running:

```bash
export E2E_TEST_EMAIL="you+e2e-test@example.com"
export E2E_TEST_PASSWORD="the account's password"
npx playwright install chromium   # once
npm run test:e2e
```

`playwright.config.ts` starts `npm run dev` for you unless
`PLAYWRIGHT_BASE_URL` is set (point it at a running server, local or
deployed, to skip that). The `setup` project (`e2e/auth.setup.ts`) signs in
once and saves the session to `playwright/.auth/user.json` (gitignored);
every other spec reuses it.

The suite runs with a single worker on purpose (`workers: 1` in the config):
several browser contexts hitting the one shared dev server at once caused
real, observed flakiness (auth requests timing out mid-compile). Slower, but
deterministic.

`access-control.spec.ts`'s "never activated" case targets
`internal-workspace-fixture` (a dev-only fixture, not a real product) rather
than signing up a fresh account. A fresh signup also works for reaching
that state, but lands on `/onboarding` first, and that flow has its own
real, pre-existing timing flakiness around how soon its
`supabase.auth.updateUser()` write becomes visible to the very next
request — unrelated to entitlements, worth its own investigation, and not
something this suite should paper over.

To create the dedicated test account itself the first time, sign up through
the real app once (`/signup`), then set `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD`
to match and activate Monthly Money Reset for it
(`/app/activate/monthly-money-reset`) so `library.spec.ts` and
`canonical-route.spec.ts` have real ownership state to check against —
`grant_free_product` is idempotent, so re-running activation is always safe.
