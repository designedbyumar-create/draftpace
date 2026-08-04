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

## Phase B: hidden-access-test

`hidden-access-test.spec.ts` covers the service-role-only grant/revoke RPCs
(`supabase/migrations/202608040001_grant_admin_purchased_and_revoke.sql`).
Those RPCs are deliberately unreachable from a signed-in session, so this
suite can't grant or revoke the product itself — the "before grant" tests
run unconditionally, but "after grant" and "after revoke" are gated behind
env flags that only mean something once a human has actually run the SQL
against the test account:

```bash
# after applying the migration and running grant_admin_product for E2E_TEST_EMAIL:
export E2E_HIDDEN_PRODUCT_GRANTED=true

# after running revoke_entitlement for the same account:
export E2E_HIDDEN_PRODUCT_REVOKED=true
```

Grant SQL (looks the account up by email, no need to find its UUID):

```sql
select * from grant_admin_product(
  (select id from auth.users where email = 'YOUR_E2E_TEST_EMAIL'),
  'hidden-access-test',
  '0.1.0',
  to_char(now(), 'YYYY-MM'),
  'E2E verification grant'
);
```

Revoke SQL:

```sql
select revoke_entitlement(
  (select id from auth.users where email = 'YOUR_E2E_TEST_EMAIL'),
  'hidden-access-test'
);
```
