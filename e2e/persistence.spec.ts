import { test, expect } from "@playwright/test";

/**
 * Covers A4 (Home visibility) plus the parts of the ownership story that
 * only show up across multiple requests: a reload must not lose what was
 * just shown, and signing out and back in must not lose real, granted
 * ownership. Assumes Monthly Money Reset is already activated for the test
 * account (library.spec.ts's first test does this too, idempotently).
 */

test("Platform Home shows the owned free product, not just Library", async ({ page }) => {
  await page.goto("/app/activate/monthly-money-reset");
  await page.getByRole("button", { name: "Add to my library" }).click();
  await expect(page).toHaveURL(/\/app\/products\/monthly-money-reset\/start/);

  await page.goto("/app");
  await expect(page.getByText("Monthly Money Reset")).toBeVisible();
});

test("refreshing the library keeps the owned product visible", async ({ page }) => {
  await page.goto("/app/library");
  await expect(page.getByText("Monthly Money Reset")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Monthly Money Reset")).toBeVisible();
});

test("signing out and back in preserves ownership and access", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  if (!email || !password) throw new Error("E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set.");

  await page.goto("/app/library");
  await expect(page.getByText("Monthly Money Reset")).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/, { timeout: 15_000 });

  // Signed out: the same product's inner route must bounce to login, not render.
  await page.goto("/app/products/monthly-money-reset/workspace");
  await expect(page).toHaveURL(/\/login/);
  // See e2e/auth.setup.ts for why this matters: fill before hydration
  // attaches React's listeners sets DOM value without updating state.
  await page.waitForLoadState("networkidle");

  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app\/products\/monthly-money-reset\/workspace/, { timeout: 15_000 });

  await page.goto("/app/library");
  await expect(page.getByText("Monthly Money Reset")).toBeVisible();

  // supabase.auth.signOut() defaults to scope: "global" — it revokes the
  // refresh token, not just this browser context's local session. Every
  // later test in this run loads a fresh context from the same on-disk
  // playwright/.auth/user.json snapshot (see auth.setup.ts), so without
  // overwriting it here with the just-reissued session, every test after
  // this one would silently be using a dead session and look logged out.
  await page.context().storageState({ path: "playwright/.auth/user.json" });
});
