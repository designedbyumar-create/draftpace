import { test, expect } from "@playwright/test";

/**
 * Covers A4: Library is entitlement-first, and a read failure at the
 * entitlements layer degrades to a retry state rather than looking like
 * "you own nothing." Uses the authenticated storageState from
 * e2e/auth.setup.ts (see playwright.config.ts).
 */

test("owning the free product shows it in the library", async ({ page }) => {
  // Activation is idempotent (grant_free_product upserts), so this is safe
  // to run every time regardless of whether the test account already owns
  // Monthly Money Reset.
  await page.goto("/app/activate/monthly-money-reset");
  await page.getByRole("button", { name: "Add to my library" }).click();
  await expect(page).toHaveURL(/\/app\/products\/monthly-money-reset\/start/);

  await page.goto("/app/library");
  await expect(page.getByText("Monthly Money Reset")).toBeVisible();
});

test("an entitlements read failure shows a retry state, never zero products", async ({ page }) => {
  await page.route("**/rest/v1/entitlements*", (route) => {
    if (route.request().method() !== "GET") return route.continue();
    return route.fulfill({ status: 500, body: JSON.stringify({ message: "simulated failure" }) });
  });

  await page.goto("/app/library");

  await expect(page.getByText("Couldn't load your library")).toBeVisible();
  await expect(page.getByText("Nothing here yet")).not.toBeVisible();
});
