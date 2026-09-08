import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf-8");

/**
 * The handful of things that decide whether an installed Companion feels
 * like an app or like a website someone bookmarked. Each of these was
 * missing, and each is invisible on a desktop, which is exactly why they
 * survived every previous pass.
 */
describe("the service worker degrades instead of failing", () => {
  const sw = read("public/sw.js");

  it("serves the offline page for a navigation, not the browser's error", () => {
    // Without this branch /offline was cached on install and then never
    // reachable: every offline navigation fell through to the browser.
    expect(sw).toContain('request.mode === "navigate"');
    expect(sw).toContain('caches.match("/offline")');
  });

  it("still caches /offline, so there is something to serve", () => {
    expect(sw).toContain('"/offline"');
    expect(sw).toMatch(/APP_SHELL[^;]*"\/offline"/);
  });

  it("never caches a navigation response, because /app is per-user", () => {
    // The navigate branch must be network-first with a cache *fallback*
    // only. Putting a navigation in the cache would risk serving one
    // account's rendered page to another.
    const navigateBlock = sw.slice(sw.indexOf('request.mode === "navigate"'));
    const untilReturn = navigateBlock.slice(0, navigateBlock.indexOf("return;"));
    expect(untilReturn).not.toContain("cache.put");
  });
});

describe("the touch defaults that give a web page away", () => {
  const css = read("src/app/globals.css");

  it("kills the blue tap flash", () => {
    expect(css).toContain("-webkit-tap-highlight-color: transparent");
  });

  it("stops the page rubber-banding past its own content", () => {
    expect(css).toContain("overscroll-behavior-y: contain");
  });

  it("stops a long press selecting a nav label", () => {
    expect(css).toContain("user-select: none");
  });

  it("floors coarse-pointer controls at the 44px platform minimum", () => {
    expect(css).toContain("@media (pointer: coarse)");
    expect(css).toContain("min-height: 44px");
  });

  it("applies that floor to summary, the control that was 24px tall", () => {
    const block = css.slice(css.indexOf("@media (pointer: coarse)"));
    expect(block.slice(0, 400)).toContain("summary");
  });
});

describe("the buy action stays reachable on a phone", () => {
  const bar = read("src/app/(marketing)/shop/[productSlug]/StickyBuyBar.tsx");
  const page = read("src/app/(marketing)/shop/[productSlug]/page.tsx");

  it("is rendered on the product page", () => {
    expect(page).toContain("<StickyBuyBar");
  });

  it("shows the same GetAction as the inline button, never a second link", () => {
    // A hardcoded href here could drift from the resolved checkout and
    // send a paying visitor somewhere the page did not intend.
    expect(bar).not.toContain("href=");
    expect(page).toMatch(/<StickyBuyBar[^>]*>\s*\n\s*<GetAction/);
  });

  it("is mobile only, since desktop never loses sight of the buy box", () => {
    expect(bar).toContain("lg:hidden");
  });

  it("clears the home indicator", () => {
    expect(bar).toContain("env(safe-area-inset-bottom)");
  });

  it("is hidden from assistive tech, being a shortcut rather than a control", () => {
    expect(bar).toContain("aria-hidden");
  });

  it("reads scroll position rather than observing intersection", () => {
    // An IntersectionObserver is defeated by the marketing layout's
    // overflow-x: clip, which computes clip on both axes and becomes the
    // observer root, so the sentinel never reports leaving it. Comments
    // stripped first: the file explains that, and would match itself.
    const code = bar.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    expect(code).not.toContain("IntersectionObserver");
    expect(code).toContain("getBoundingClientRect");
  });
});

describe("the public header floats on mobile", () => {
  const nav = read("src/components/public/PublicNav.tsx");

  it("sits away from the top edge, below the notch", () => {
    expect(nav).toContain("env(safe-area-inset-top)");
  });

  it("is rounded on all four corners, not welded to the screen edge", () => {
    expect(nav).toContain("rounded-2xl");
    expect(nav, "still rounded only at the bottom").not.toContain("rounded-b-2xl");
  });
});

/**
 * The registration itself, which is what everything above depends on.
 *
 * This shipped broken and looked fine: the component existed, was mounted
 * in the root layout, and did nothing, because it attached a `load`
 * listener from inside an effect that runs after `load` has fired. A live
 * check found zero service worker registrations after a full page load,
 * which meant no offline page could ever be served, the push handler was
 * unreachable, and Chrome had no controlling worker to base an install
 * prompt on.
 */
describe("the service worker actually registers", () => {
  const source = read("src/components/providers/PWARegister.tsx");

  it("registers immediately when the page has already loaded", () => {
    // The whole bug in one line: without this branch, an effect that runs
    // post-hydration waits forever for an event that already happened.
    expect(source).toContain('document.readyState === "complete"');
  });

  it("still defers to load when the page genuinely is still loading", () => {
    expect(source).toContain('window.addEventListener("load", register)');
  });

  it("removes its listener, so a remount cannot stack registrations", () => {
    expect(source).toContain('window.removeEventListener("load", register)');
  });
});
