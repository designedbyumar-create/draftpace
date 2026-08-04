import { test, expect } from "@playwright/test";

/**
 * Covers Phase B (B4): proves the entitlement/routing/revocation
 * architecture generalizes to a second, non-free product granted outside
 * the free-activation flow. hidden-access-test (src/products/hidden-access-test/)
 * has no Shop listing and no self-serve activation — its only entry point
 * is grant_admin_product, called manually against the E2E test account
 * (see the Phase B migration and grant/revoke SQL in the session notes).
 *
 * These tests split into two groups by a real, external dependency this
 * suite cannot satisfy itself: granting/revoking requires the
 * service-role-only grant_admin_product/revoke_entitlement RPCs, which are
 * deliberately unreachable from a signed-in user's own session (and so
 * unreachable from here too). "Before grant" needs nothing but the product
 * being registered. "After grant" and "after revoke" require a human to
 * have already run the corresponding SQL — see e2e/README.md.
 */

test.describe("before any grant exists", () => {
  // Only true before the first manual grant, or again after a revoke — not
  // a fact about the code, a fact about which manual step the account has
  // been taken through most recently. Once E2E_HIDDEN_PRODUCT_GRANTED is
  // set, this account really is entitled, so this group would just be
  // asserting something no longer true; skip it in that case unless a
  // revoke has since put it back.
  test.skip(
    process.env.E2E_HIDDEN_PRODUCT_GRANTED === "true" && process.env.E2E_HIDDEN_PRODUCT_REVOKED !== "true",
    "The test account has an active grant right now (E2E_HIDDEN_PRODUCT_GRANTED=true, not yet revoked)."
  );

  test("direct navigation to an inner route redirects to activation, same as any other unentitled product", async ({
    page,
  }) => {
    await page.goto("/app/products/hidden-access-test/workspace");
    await expect(page).toHaveURL(/\/app\/activate\/hidden-access-test/);
  });

  test("does not appear in the library", async ({ page }) => {
    await page.goto("/app/library");
    await expect(page.getByText("Hidden Access Test")).not.toBeVisible();
  });
});

test.describe("after grant_admin_product has been run for the test account (manual precondition)", () => {
  // Same reasoning as the "before any grant" group above: a later revoke
  // supersedes an earlier grant, so this group only means something between
  // the two manual steps, not after both have happened.
  test.skip(
    !process.env.E2E_HIDDEN_PRODUCT_GRANTED || process.env.E2E_HIDDEN_PRODUCT_REVOKED === "true",
    "Set E2E_HIDDEN_PRODUCT_GRANTED=true after running grant_admin_product, and don't also set E2E_HIDDEN_PRODUCT_REVOKED unless testing after a fresh re-grant."
  );

  test("the canonical route resolves and an inner route becomes reachable", async ({ page }) => {
    // hidden-access-test has no "setup" destination (workspace family), so
    // resolveProductDestination sends it straight to workspace, never setup.
    await page.goto("/app/products/hidden-access-test");
    await expect(page).toHaveURL(/\/app\/products\/hidden-access-test\/workspace/, { timeout: 20_000 });

    await page.goto("/app/products/hidden-access-test/workspace");
    await expect(page).toHaveURL(/\/app\/products\/hidden-access-test\/workspace/);
    await expect(page.getByText("This product has no real functionality")).toBeVisible();
  });

  test("appears in the library", async ({ page }) => {
    await page.goto("/app/library");
    await expect(page.getByText("Hidden Access Test")).toBeVisible();
  });

  test("access survives a refresh and a logout/login cycle", async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;
    if (!email || !password) throw new Error("E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set.");

    await page.goto("/app/products/hidden-access-test/workspace");
    await expect(page).toHaveURL(/\/app\/products\/hidden-access-test\/workspace/);

    await page.reload();
    await expect(page).toHaveURL(/\/app\/products\/hidden-access-test\/workspace/);

    // "Sign out" only lives in PlatformShell (Library/Home/Settings/Account),
    // not in ProductShell — a product destination page has no sign-out
    // control of its own, only a "Library" back-link.
    await page.goto("/app/library");
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/, { timeout: 15_000 });

    await page.goto("/app/products/hidden-access-test/workspace");
    await expect(page).toHaveURL(/\/login/);
    await page.waitForLoadState("networkidle");

    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/app\/products\/hidden-access-test\/workspace/, { timeout: 20_000 });

    // supabase.auth.signOut() defaults to scope: "global" — it revokes the
    // refresh token, not just this browser context's local session. Every
    // later test in this run loads a fresh context from the same on-disk
    // playwright/.auth/user.json snapshot (see auth.setup.ts), so without
    // overwriting it here with the just-reissued session, every test after
    // this one would silently be using a dead session and look logged out.
    await page.context().storageState({ path: "playwright/.auth/user.json" });
  });
});

test.describe("after revoke_entitlement has been run for the test account (manual precondition)", () => {
  test.skip(
    !process.env.E2E_HIDDEN_PRODUCT_REVOKED,
    "Set E2E_HIDDEN_PRODUCT_REVOKED=true after running revoke_entitlement for the test account."
  );

  test("access disappears everywhere, including direct URL, without deleting anything", async ({ page }) => {
    await page.goto("/app/products/hidden-access-test/workspace");
    await expect(page).toHaveURL(/\/app\/activate\/hidden-access-test/);

    await page.goto("/app/library");
    await expect(page.getByText("Hidden Access Test")).not.toBeVisible();
  });
});
