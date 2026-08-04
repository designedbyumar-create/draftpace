import { test, expect } from "@playwright/test";

/**
 * Covers A2: the server-side entitlement gate in
 * src/app/app/products/[productSlug]/layout.tsx.
 *
 * The "not entitled" case targets internal-workspace-fixture (a dev-only
 * fixture, never shown in the Store, never activated by anything) rather
 * than signing up a fresh account. A fresh signup also works, but lands on
 * /onboarding first (src/app/app/layout.tsx gates every /app/** route on
 * user_metadata.onboarding_complete) and that flow turned out to have its
 * own real, pre-existing flakiness around how soon its
 * supabase.auth.updateUser() write is visible to the very next
 * request — unrelated to entitlements, and not something to paper over
 * here. The primary test account is already onboarded and stable, and it
 * has never activated the fixture, so reusing its session isolates this
 * test to exactly what it's meant to check.
 */

test("signed out, direct navigation to an inner destination route redirects to login", async ({ browser }) => {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();

  await page.goto("/app/products/monthly-money-reset/workspace");
  await expect(page).toHaveURL(/\/login/);

  await context.close();
});

test("signed in but never activated, direct navigation to an inner destination route redirects to activation", async ({
  page,
}) => {
  await page.goto("/app/products/internal-workspace-fixture/workspace");
  await expect(page).toHaveURL(/\/app\/activate\/internal-workspace-fixture/);
});
