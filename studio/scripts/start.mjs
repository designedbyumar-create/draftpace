#!/usr/bin/env node
/**
 * `npm run studio`: start Draftpace Studio on this computer and open it.
 *
 * First run installs the Creative Engine's own packages (creative/), then
 * starts Studio on http://localhost:3100 and opens the browser once it is
 * ready. Works the same on Mac, Windows and Linux. Ctrl+C stops it.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const PORT = process.env.STUDIO_PORT ?? "3100";
const URL = `http://localhost:${PORT}`;
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

if (!existsSync(path.join(ROOT, "node_modules", "next"))) {
  console.log("\n  First, install the site's packages: run `npm install` in the project folder, then `npm run studio` again.\n");
  process.exit(1);
}
if (!existsSync(path.join(ROOT, "creative", "node_modules", "remotion"))) {
  console.log("\n  Installing the Creative Engine's packages (first run only, a few minutes)...\n");
  const r = spawnSync(npm, ["install"], { cwd: path.join(ROOT, "creative"), stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const next = createRequire(import.meta.url).resolve("next/dist/bin/next", { paths: [ROOT] });
const child = spawn(process.execPath, [next, "dev", "studio", "--webpack", "--port", PORT], { cwd: ROOT, stdio: ["inherit", "pipe", "inherit"] });

let opened = false;
child.stdout.on("data", (d) => {
  process.stdout.write(d);
  if (!opened && /Ready/.test(d.toString())) {
    opened = true;
    console.log(`\n  Draftpace Studio is running: ${URL}\n  The first page takes a minute to prepare. Press Ctrl+C here to stop Studio.\n`);
    if (!process.env.STUDIO_NO_OPEN) openBrowser(URL);
  }
});
child.on("exit", (code) => process.exit(code ?? 0));
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => child.kill(sig));

function openBrowser(url) {
  const [cmd, args] = process.platform === "darwin" ? ["open", [url]] : process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : ["xdg-open", [url]];
  const p = spawn(cmd, args, { stdio: "ignore", detached: true });
  p.on("error", () => {}); // no browser opener (a server): the URL is printed above
  p.unref();
}
