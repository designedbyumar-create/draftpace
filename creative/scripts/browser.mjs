/**
 * Which Chromium the renderers drive. Remotion's default is to download its
 * own headless shell from remotion.media on first use, which fails behind a
 * network allowlist (as in Claude Code cloud sessions) with a 403. Use, in
 * order: REMOTION_BROWSER_EXECUTABLE, a Playwright-installed headless shell
 * if one exists, else null (Remotion's own download, fine on an open
 * network).
 */
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

function playwrightHeadlessShell() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root || !existsSync(root)) return null;
  const dir = readdirSync(root).filter((d) => d.startsWith("chromium_headless_shell-")).sort().pop();
  if (!dir) return null;
  const bin = path.join(root, dir, "chrome-linux", "headless_shell");
  return existsSync(bin) ? bin : null;
}

export const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || playwrightHeadlessShell() || null;
