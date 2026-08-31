import { describe, expect, it } from "vitest";
import {
  discountPercent,
  formatCompareAtPrice,
  formatPrice,
  validateShopProduct,
  type ShopProductInput,
} from "./definition";

/**
 * Guards on the pricing primitives introduced for launch pricing
 * (Phase 0 of the pricing plan). The one invariant that actually matters
 * is enforced at the schema level, not just in a formatter: a listing
 * can never claim a discount that isn't real, because compareAtPrice is
 * refused unless it's a genuine number above what's actually charged.
 */

const BASE: Omit<ShopProductInput, "access" | "price" | "compareAtPrice"> = {
  id: "test-product",
  slug: "test-product",
  publicationStatus: "draft",
  title: "Test Product",
  promise: "A promise.",
  problem: "A problem.",
  howItWorks: [],
  seo: { title: "Test Product", description: "A test product." },
  availability: "available",
};

describe("formatPrice", () => {
  it("reads Free for a free product regardless of any price field", () => {
    expect(formatPrice(validateShopProduct({ ...BASE, access: "free" }))).toBe("Free");
  });

  it("reads Price not yet set for a paid product with no price", () => {
    expect(formatPrice(validateShopProduct({ ...BASE, access: "paid" }))).toBe("Price not yet set");
  });

  it("drops the trailing .00 on a whole-dollar price", () => {
    const product = validateShopProduct({ ...BASE, access: "paid", price: { amount: 28, currency: "USD" } });
    expect(formatPrice(product)).toBe("$28");
  });

  it("keeps real cents", () => {
    const product = validateShopProduct({ ...BASE, access: "paid", price: { amount: 28.5, currency: "USD" } });
    expect(formatPrice(product)).toBe("$28.50");
  });
});

describe("formatCompareAtPrice and discountPercent", () => {
  it("return null when no launch discount is set", () => {
    const product = validateShopProduct({ ...BASE, access: "paid", price: { amount: 28, currency: "USD" } });
    expect(formatCompareAtPrice(product)).toBeNull();
    expect(discountPercent(product)).toBeNull();
  });

  it("format and compute correctly together when a discount is set", () => {
    const product = validateShopProduct({
      ...BASE,
      access: "paid",
      price: { amount: 28, currency: "USD" },
      compareAtPrice: { amount: 35, currency: "USD" },
    });
    expect(formatCompareAtPrice(product)).toBe("$35");
    // (35 - 28) / 35 = 20%, exactly the number this whole pricing pass is built around.
    expect(discountPercent(product)).toBe(20);
  });
});

describe("the compareAtPrice invariant", () => {
  it("refuses a compareAtPrice that is not genuinely higher than price", () => {
    expect(() =>
      validateShopProduct({
        ...BASE,
        access: "paid",
        price: { amount: 28, currency: "USD" },
        compareAtPrice: { amount: 28, currency: "USD" },
      })
    ).toThrow();

    expect(() =>
      validateShopProduct({
        ...BASE,
        access: "paid",
        price: { amount: 28, currency: "USD" },
        compareAtPrice: { amount: 20, currency: "USD" },
      })
    ).toThrow();
  });

  it("refuses a compareAtPrice on a listing with no real price to compare it against", () => {
    expect(() =>
      validateShopProduct({
        ...BASE,
        access: "paid",
        compareAtPrice: { amount: 35, currency: "USD" },
      })
    ).toThrow();
  });

  it("accepts a compareAtPrice that is genuinely a discount", () => {
    expect(() =>
      validateShopProduct({
        ...BASE,
        access: "paid",
        price: { amount: 28, currency: "USD" },
        compareAtPrice: { amount: 35, currency: "USD" },
      })
    ).not.toThrow();
  });
});
