import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Real validation of public/manifest.webmanifest against Chrome's PWA
 * installability requirements, not a structural string check: parses the
 * actual JSON and asserts on the actual fields, so a future edit that drops
 * a required field or points an icon at a file that no longer exists fails
 * here instead of only showing up as a silent "not installable" in Chrome.
 */
const manifestPath = join(process.cwd(), "public/manifest.webmanifest");
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

describe("PWA manifest: installability requirements", () => {
  it("is valid JSON with name, short_name, start_url, and scope", () => {
    expect(manifest.name).toBe("Draftpace");
    expect(manifest.short_name).toBe("Draftpace");
    expect(manifest.start_url).toBe("/app");
    expect(manifest.scope).toBe("/");
  });

  it("declares standalone display mode", () => {
    expect(manifest.display).toBe("standalone");
  });

  it("has both a >=192x192 and a >=512x512 icon, required for the install prompt", () => {
    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });

  it("has at least one maskable icon, so Android doesn't crop a plain square badly", () => {
    const maskable = manifest.icons.filter((icon: { purpose?: string }) => icon.purpose === "maskable");
    expect(maskable.length).toBeGreaterThan(0);
  });

  it("every icon file referenced in the manifest actually exists in public/", () => {
    for (const icon of manifest.icons as { src: string }[]) {
      const iconPath = join(process.cwd(), "public", icon.src);
      expect(existsSync(iconPath), `${icon.src} does not exist`).toBe(true);
    }
  });

  it("uses PNG icons, not SVG, since Chrome's installability check is unreliable with SVG-only icon sets", () => {
    for (const icon of manifest.icons as { type: string }[]) {
      expect(icon.type).toBe("image/png");
    }
  });

  it("theme_color and background_color are valid hex colors matching the current brand palette", () => {
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/i);
    // The old build shipped a stale indigo (#3730A3) left over from a
    // retired palette; the live app's --primary/--logo-mark is teal.
    expect(manifest.theme_color.toLowerCase()).toBe("#0e6e75");
  });
});

describe("Apple touch icon and other referenced PWA assets exist", () => {
  it("apple-touch-icon.png exists", () => {
    expect(existsSync(join(process.cwd(), "public/logo/apple-touch-icon.png"))).toBe(true);
  });

  it("the service worker's precached assets all exist", () => {
    const swSource = readFileSync(join(process.cwd(), "public/sw.js"), "utf-8");
    const appShellMatch = swSource.match(/const APP_SHELL = \[([\s\S]*?)\];/);
    expect(appShellMatch).not.toBeNull();
    const entries = [...(appShellMatch?.[1].matchAll(/"([^"]+)"/g) ?? [])].map((match) => match[1]);
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      if (entry === "/offline" || entry === "/manifest.webmanifest") continue;
      expect(existsSync(join(process.cwd(), "public", entry)), `${entry} does not exist`).toBe(true);
    }
  });

  it("the service worker never intercepts /app routes, so authenticated pages are never cached", () => {
    const swSource = readFileSync(join(process.cwd(), "public/sw.js"), "utf-8");
    expect(swSource).not.toMatch(/pathname\.startsWith\(["']\/app["']\)/);
  });
});
