import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

/**
 * There is no test-mode auth bypass in this app by design (see
 * src/proxy.ts / CLAUDE.md — /app protection is real, not a temporary
 * gate). Authenticated specs reuse a storageState generated once by
 * e2e/auth.setup.ts against a real, dedicated test account — never a
 * developer's own account, and never hardcoded credentials in this repo.
 */
export default defineConfig({
  testDir: "./e2e",
  // The dev webServer below is one shared Next.js process — several browser
  // contexts hitting it at once caused real, observed flakiness (auth
  // requests timing out mid-compile). One worker at a time is slower but
  // deterministic; revisit if this ever runs against a production build.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  // A route hit for the first time in a run pays a real, one-time dev-server
  // compile cost (observed up to ~25s) before the very first navigation even
  // resolves. A 30s test budget leaves almost nothing for the rest of the
  // test once that lands on a route nothing earlier in the run has warmed.
  timeout: 60_000,
  // Same reasoning, for individual assertions: the default 5s expect()
  // timeout is tighter than a cold compile.
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "playwright/.auth/user.json" },
      dependencies: ["setup"],
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
