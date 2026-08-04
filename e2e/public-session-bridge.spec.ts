import { test, expect } from "@playwright/test";

/**
 * Covers the public-marketing session bridge: the public site must
 * recognize an already-signed-in visitor (no Sign in/Get started shown to
 * them), "Open Draftpace" must route to /app without a second sign-in, and
 * "Visit Draftpace website" from inside the app must return to / without
 * ever touching the session. Each state is validated independently with its
 * own browser context, matching the pattern in access-control.spec.ts,
 * rather than relying on the shared authenticated `page` fixture for the
 * signed-out cases.
 */

test("signed-out public header shows Sign in and Get started, not Open Draftpace", async ({ browser }) => {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();

  await page.goto("/");
  // The homepage body also has an unrelated "Already using Draftpace? Sign
  // in" CTA, scope to the header itself so this only checks PublicNav.
  const header = page.locator("header");
  await expect(header.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Get started" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Open Draftpace" })).toHaveCount(0);

  await context.close();
});

test("signed-in public header shows Open Draftpace and the account trigger, not Sign in/Get started", async ({
  page,
}) => {
  await page.goto("/");
  const header = page.locator("header");
  await expect(header.getByRole("link", { name: "Open Draftpace" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Sign in" })).toHaveCount(0);
  await expect(header.getByRole("link", { name: "Get started" })).toHaveCount(0);
});

test("Open Draftpace routes to /app and the session carries over, no second sign-in", async ({ page }) => {
  await page.goto("/");
  await page.locator("header").getByRole("link", { name: "Open Draftpace" }).click();
  await expect(page).toHaveURL(/\/app$/);
  // A dropped session here would redirect to /login (src/proxy.ts) instead.
  await expect(page).not.toHaveURL(/\/login/);
});

test("Visit Draftpace website returns to / without signing out, session still valid on return", async ({
  page,
}) => {
  await page.goto("/app");
  // Desktop: a plain, always-visible sidebar link, not behind the account menu.
  await page.getByRole("link", { name: "Visit Draftpace website" }).click();
  await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/);

  // Still signed in on the public site: the header shows the signed-in
  // state, not Sign in/Get started, proving the round trip never touched
  // the session.
  await expect(page.locator("header").getByRole("link", { name: "Open Draftpace" })).toBeVisible();

  // And the session is still good for a real protected navigation, not
  // just a cached header render.
  await page.goto("/app/library");
  await expect(page).not.toHaveURL(/\/login/);
});

test("product primary navigation stays separate from the platform bottom navigation on mobile", async ({
  browser,
}) => {
  const context = await browser.newContext({
    storageState: "playwright/.auth/user.json",
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();

  await page.goto("/app/library");
  await expect(page.locator('nav[aria-label="Primary"]')).toBeVisible();

  await page.goto("/app/products/monthly-money-reset/workspace");
  await expect(page.locator('nav[aria-label="Primary"]')).toHaveCount(0);
  await expect(page.locator('nav[aria-label="Product"]')).toBeVisible();

  await context.close();
});
