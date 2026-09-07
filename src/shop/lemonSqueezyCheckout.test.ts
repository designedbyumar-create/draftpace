import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getLemonSqueezyCheckoutUrl, hasLemonSqueezyCheckout, listCheckoutSlugs } from "./lemonSqueezyCheckout";
import { shopRegistry } from "./registry";
import { ensureShopRegistered } from "./ensureRegistered";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { grantedVersionFor, listMappedVariantSlugs } from "@/shop/lemonSqueezyVariants";

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

/**
 * The two halves of a sale are configured in two different files, and
 * nothing but this connects them. A product with a live Buy Link but no
 * variant id takes the money and grants nothing: the payment succeeds,
 * the webhook returns 400, and the only symptom is a customer emailing to
 * ask where their product went.
 */
describe("anything that can be bought can also be granted", () => {
  const mapped = new Set(listMappedVariantSlugs());

  /**
   * Slugs with a live Buy Link whose numeric variant id the founder has
   * not supplied yet. Every entry here is a product that must not be sold
   * until it is removed. Shrinking this to empty is the release gate.
   */
  const AWAITING_VARIANT_ID = new Set([
    "home-management-companion",
    "personal-life-affairs-companion",
    "homeschooling-companion",
    "alongside",
    "travel-companion",
    "vehicle-maintenance-companion",
  ]);

  for (const slug of listCheckoutSlugs()) {
    if (AWAITING_VARIANT_ID.has(slug)) {
      it(`${slug} is still awaiting its variant id`, () => {
        expect(
          mapped.has(slug),
          `${slug} has a variant id now. Remove it from AWAITING_VARIANT_ID so the real assertion guards it.`
        ).toBe(false);
      });
      continue;
    }

    it(`${slug} can be granted after payment`, () => {
      expect(
        mapped.has(slug),
        `${slug} has a live Buy Link but no Lemon Squeezy variant id, so a purchase is charged and then rejected by the webhook with "Unrecognized variant_id". Add it to PURCHASABLE in src/shop/lemonSqueezyVariants.ts.`
      ).toBe(true);
    });
  }

  it("never maps a variant to a slug that has no checkout", () => {
    for (const slug of listMappedVariantSlugs()) {
      expect(
        hasLemonSqueezyCheckout(slug),
        `${slug} has a variant id but no Buy Link, so the mapping is unreachable`
      ).toBe(true);
    }
  });

  /**
   * The webhook states each product's version rather than reading it from
   * the registry, to keep a serverless route from importing every product
   * definition on every cold start. This is what makes that safe: a
   * version bump fails here, in CI, instead of silently granting the
   * previous version to a paying customer.
   */
  for (const slug of listCheckoutSlugs()) {
    it(`${slug} grants the version its definition actually declares`, () => {
      const declared = productRegistry.getBySlug(slug)?.version;
      expect(declared, `${slug} has no product definition`).toBeTruthy();
      expect(
        grantedVersionFor(slug),
        `${slug} is at version ${declared}, but a purchase would grant ${grantedVersionFor(slug)}. Update PURCHASABLE in src/shop/lemonSqueezyVariants.ts.`
      ).toBe(declared);
    });
  }
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

  it("returns the buyer to the welcome screen, not to the Shop page they were on", () => {
    // Straight to /app/products/... would race the webhook and bounce a
    // paying customer to an activation page. /app/welcome waits.
    const success = new URL(built!).searchParams.get("checkout[success_url]");
    expect(success).toContain(`/app/welcome/${slug}`);
    expect(success).not.toContain("/shop");
  });

  it("returns null for a product with no checkout, rather than a broken URL", () => {
    expect(getLemonSqueezyCheckoutUrl("not-a-product", { userId: "u", email: null })).toBeNull();
  });
});

/**
 * The post-purchase screen is the one place in the product where somebody
 * has already paid. Two things must hold there no matter what: it can
 * never grant access itself, and it can never tell a paying customer they
 * do not own what they bought.
 */
describe("the welcome screen is honest and grants nothing", () => {
  const page = read("src/app/app/welcome/[productSlug]/page.tsx");
  const awaiting = read("src/components/platform/AwaitingGrant.tsx");
  const endpoint = read("src/app/api/products/[productSlug]/entitlement/route.ts");

  it("only ever reads the entitlement, never writes one", () => {
    // A POST, an RPC, or an insert here would be a way to obtain a paid
    // product by visiting a URL.
    expect(page).not.toMatch(/\.rpc\(|\.insert\(|\.upsert\(/);
    expect(page).toContain('.from("entitlements")');
    expect(page).toContain(".select(");
  });

  it("exposes no write path from the polling endpoint either", () => {
    expect(endpoint).not.toMatch(/\.rpc\(|\.insert\(|\.upsert\(/);
    expect(endpoint).toContain("export async function GET");
    expect(endpoint).not.toContain("export async function POST");
  });

  it("requires a real session to answer, so it cannot report on somebody else", () => {
    expect(endpoint).toContain("auth.getUser()");
    expect(endpoint).toContain("401");
  });

  it("treats a read failure as unknown, never as not-granted", () => {
    // Returning granted:false on an error would make a database blip look
    // identical to a webhook that has not arrived, and the screen would
    // stop waiting for something that already happened.
    expect(endpoint).toMatch(/if \(error\) return NextResponse\.json\([^)]*503/);
  });

  it("gives up into a real next step rather than a dead end", () => {
    expect(awaiting).toContain("timedOut");
    expect(awaiting).toContain("/support");
  });

  it("never tells a paying customer the purchase failed", () => {
    // Comments stripped first: this is about what the screen says, and
    // the file's own doc comment discusses the wording it must avoid.
    const copy = awaiting
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "")
      .toLowerCase();

    for (const forbidden of ["do not own", "don't own", "not found", "no access", "failed", "error"]) {
      expect(copy, `the waiting state says "${forbidden}" to somebody who has paid`).not.toContain(forbidden);
    }
  });

  it("is kept out of search results, being a per-customer page", () => {
    expect(page).toContain("robots:");
    expect(page).toContain("index: false");
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
