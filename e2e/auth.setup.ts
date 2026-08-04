import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

/**
 * Signs in once with a dedicated test account and reuses the resulting
 * session for every authenticated spec, instead of scripting a login per
 * test. Credentials come from the environment — never commit a real
 * account's email/password here, and never point this at anything but a
 * throwaway test account: it owns whatever the suite grants and revokes.
 */
setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set to run the authenticated Playwright suite. " +
        "Use a dedicated test account, never a real user's credentials."
    );
  }

  await page.goto("/login");
  // Wait past hydration, not just DOM paint — the email/password inputs are
  // React-controlled, so filling before the client bundle attaches its
  // listeners sets DOM value without updating state, leaving "Sign in"
  // permanently disabled. This was seen for real on a slow/cold dev-server
  // compile, not a hypothetical.
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // This is always the very first navigation of a run, so /app pays a real,
  // one-time cold-compile cost nothing has warmed yet (observed 20s+ on a
  // freshly started dev server) — well past the suite's normal 15s expect
  // timeout. Every later test benefits from /app already being compiled.
  await expect(page).toHaveURL(/\/app(\/|$)/, { timeout: 45_000 });
  await page.context().storageState({ path: authFile });
});
