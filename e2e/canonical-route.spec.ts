import { test, expect } from "@playwright/test";

/**
 * Covers A3: /app/products/[productSlug] always redirects, never renders.
 *
 * Scope note: this only exercises the "instance exists, setup incomplete"
 * branch, which is reliably reachable through the real activation flow
 * (grant_free_product always creates the instance with setup_complete:
 * false). The "no instance for the current cycle yet" and "active" branches
 * need either a brand-new never-activated account or a completed setup
 * wizard to reach honestly — both are better covered once B4 extends this
 * harness with proper fixtures, rather than faked here.
 */

test("visiting the canonical route for an owned, not-yet-set-up product redirects to setup", async ({ page }) => {
  await page.goto("/app/activate/monthly-money-reset");
  await page.getByRole("button", { name: "Add to my library" }).click();
  await expect(page).toHaveURL(/\/app\/products\/monthly-money-reset\/start/);

  await page.goto("/app/products/monthly-money-reset");
  await expect(page).toHaveURL(/\/app\/products\/monthly-money-reset\/setup$/);
});
