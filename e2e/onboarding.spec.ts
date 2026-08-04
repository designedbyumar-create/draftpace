import { test, expect, type Page } from "@playwright/test";

/**
 * Covers the onboarding redesign's completion routing: /onboarding's "what
 * brings you here" step (src/components/onboarding/NeedStep.tsx) should
 * route straight to a matching free product's activation screen when one
 * exists (today, only "Get organized" -> monthly-money-reset), and land
 * honestly on /app otherwise. Each test signs up a fresh, disposable
 * account since onboarding is only reachable once, before
 * onboarding_complete is set.
 *
 * Uses a fresh, explicitly unauthenticated browser context per test rather
 * than the default `page` fixture — the "chromium" project's default
 * storageState is the already-authenticated primary test account (see
 * playwright.config.ts), and /signup redirects an already-signed-in visitor
 * straight to /app (src/proxy.ts's isAuthPage check) without ever rendering
 * the form. Same reasoning as access-control.spec.ts's "never activated"
 * test.
 */

async function signupFreshAccount(page: Page) {
  const email = `draftpace-e2e-onboarding-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  const password = `Test-${Math.random().toString(36).slice(2)}-${Date.now()}!Aa1`;

  await page.goto("/signup");
  // See e2e/auth.setup.ts for why: filling before hydration attaches React's
  // listeners sets DOM value without updating state.
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Skip, use my email name" }).click();

  // The client-side redirect chain can settle on /app for a moment before
  // landing on /onboarding — same race noted in access-control.spec.ts.
  await page.waitForURL((url) => url.pathname === "/onboarding" || url.pathname === "/app", { timeout: 20_000 });
  let last = page.url();
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(300);
    if (page.url() === last) break;
    last = page.url();
  }
}

test("selecting a need with a real match routes straight to that product's activation screen", async ({ browser }) => {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();

  await signupFreshAccount(page);
  await expect(page).toHaveURL(/\/onboarding/);

  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("radio", { name: "Get organized" }).click();
  await expect(page.getByText("There's a free product for exactly this: Monthly Money Reset.")).toBeVisible();

  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Enter Draftpace" }).click();

  await expect(page).toHaveURL(/\/app\/activate\/monthly-money-reset/, { timeout: 20_000 });
  await context.close();
});

test("selecting a need with no real match lands honestly on Platform Home", async ({ browser }) => {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();

  await signupFreshAccount(page);
  await expect(page).toHaveURL(/\/onboarding/);

  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("radio", { name: "Learn step by step" }).click();
  await expect(page.getByText(/free product for exactly this/)).not.toBeVisible();

  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Enter Draftpace" }).click();

  await expect(page).toHaveURL(/^http:\/\/localhost:3000\/app\/?$/, { timeout: 20_000 });
  await context.close();
});

test("Skip from the first moment exits onboarding without answering anything", async ({ browser }) => {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();

  await signupFreshAccount(page);
  await expect(page).toHaveURL(/\/onboarding/);

  await page.getByRole("button", { name: "Skip" }).click();

  await expect(page).not.toHaveURL(/\/onboarding/, { timeout: 20_000 });
  await context.close();
});

test("choosing a theme applies it immediately, not after finishing", async ({ browser }) => {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();

  await signupFreshAccount(page);
  await expect(page).toHaveURL(/\/onboarding/);

  await page.getByRole("button", { name: /Dark/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await context.close();
});
