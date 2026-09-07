import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getLemonSqueezyCheckoutUrl, hasLemonSqueezyCheckout, listCheckoutSlugs } from "./lemonSqueezyCheckout";
import { shopRegistry } from "./registry";
import { ensureShopRegistered } from "./ensureRegistered";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";

ensureShopRegistered();
ensureProductsRegistered();

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf-8");

/**
 * A published paid product with no checkout is a listing that takes a
 * visitor all the way to the decision and then has nothing to sell them.
 * It fails silently: the page renders, the pending state is honest, and
 * nobody notices for a month. These assert the wiring instead.
 */
describe("every published paid product can actually be bought", () => {
  const paid = shopRegistry.listPublishedPaid().filter((product) => product.availability !== "coming-soon");

  it("has paid products to check", () => {
    expect(paid.length).toBeGreaterThan(0);
  });

  /**
   * Products we know cannot be bought yet, so a *new* one slipping through
   * still fails this suite. Emptying this list is the goal; adding to it
   * without a reason is how the gap becomes permanent.
   *
   * family-health-binder: no Buy Link created in Lemon Squeezy yet, so its
   * Shop page shows the honest "Checkout opens soon" state. It is the one
   * paid product of eight with no link.
   */
  const KNOWN_NO_CHECKOUT = new Set(["family-health-binder"]);

  for (const product of paid) {
    const buyable = () => hasLemonSqueezyCheckout(product.slug) || Boolean(product.purchaseAction?.href);

    if (KNOWN_NO_CHECKOUT.has(product.slug)) {
      it(`${product.slug} is still the known gap, and nothing more`, () => {
        expect(
          buyable(),
          `${product.slug} can be bought now. Remove it from KNOWN_NO_CHECKOUT so the real assertion guards it.`
        ).toBe(false);
      });
      continue;
    }

    it(`${product.slug} has a live checkout`, () => {
      expect(
        buyable(),
        `${product.slug} is published and paid but has no Lemon Squeezy Buy Link and no purchaseAction.href, so its buy button renders the "Checkout opens soon" pending state.`
      ).toBe(true);
    });
  }

  it("never points a checkout at a slug that is not a real product", () => {
    for (const slug of listCheckoutSlugs()) {
      expect(shopRegistry.getBySlug(slug), `checkout configured for unknown slug "${slug}"`).toBeDefined();
    }
  });

  it("never puts a checkout on the free product", () => {
    for (const product of shopRegistry.listPublishedFree()) {
      expect(
        hasLemonSqueezyCheckout(product.slug),
        `${product.slug} is free but has a paid checkout link`
      ).toBe(false);
    }
  });
});

describe("the built checkout URL carries everything the overlay and webhook need", () => {
  const slug = "personal-finance-companion";
  const built = getLemonSqueezyCheckoutUrl(slug, { userId: "user-123", email: "someone@example.com" });

  it("builds a URL at all", () => {
    expect(built).not.toBeNull();
  });

  it("asks for the overlay rather than a page navigation", () => {
    expect(new URL(built!).searchParams.get("embed")).toBe("1");
  });

  it("does not duplicate embed when the base URL already carries it", () => {
    // The links pasted out of the Lemon Squeezy dashboard already end in
    // ?embed=1, so appending would produce embed=1&embed=1.
    expect(built!.match(/embed=/g)).toHaveLength(1);
  });

  it("carries the Draftpace user id, which is the only way the webhook knows who bought", () => {
    expect(new URL(built!).searchParams.get("checkout[custom][user_id]")).toBe("user-123");
  });

  it("prefills the email so the buyer does not retype it", () => {
    expect(new URL(built!).searchParams.get("checkout[email]")).toBe("someone@example.com");
  });

  it("omits the email entirely rather than sending an empty one", () => {
    const anonymous = getLemonSqueezyCheckoutUrl(slug, { userId: "user-123", email: null });
    expect(new URL(anonymous!).searchParams.has("checkout[email]")).toBe(false);
  });

  it("colours the checkout button with the product's own accent", () => {
    const accent = productRegistry.getBySlug(slug)?.theme?.accentScale?.base;
    expect(accent, "PFC lost its accent, so the checkout falls back to Lemon Squeezy purple").toBeTruthy();
    expect(new URL(built!).searchParams.get("button_color")).toBe(accent);
  });

  it("returns null for a product with no checkout, rather than a broken URL", () => {
    expect(getLemonSqueezyCheckoutUrl("not-a-product", { userId: "u", email: null })).toBeNull();
  });
});

describe("the overlay is an enhancement, never the only way to pay", () => {
  const source = read("src/components/shop/CheckoutButton.tsx");

  it("uses a plain anchor, so next/link never steals the click from lemon.js", () => {
    expect(source).toContain("<a href={href}");
    expect(source).not.toMatch(/^import .* from "next\/link"/m);
  });

  it("carries the class lemon.js binds its overlay handler to", () => {
    expect(source).toContain("lemonsqueezy-button");
  });

  it("initialises lemon.js explicitly, since afterInteractive misses DOMContentLoaded", () => {
    expect(source).toContain("createLemonSqueezy");
  });
});
