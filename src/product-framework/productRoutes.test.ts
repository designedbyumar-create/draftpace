import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";

ensureProductsRegistered();

/**
 * The guard that would have caught the worst bug of the nine-product
 * build: Vehicle Maintenance Companion and Family Health Binder each
 * declared destinations ("vehicles", "members", "timeline") that had no
 * route folder under src/app/app/products/[productSlug]/, so the rail
 * linked to a 404 and neither product could have a vehicle or a person
 * added to it at all. Both shipped that way, past a clean tsc, eslint,
 * test and build run, because a missing route is not a type error and
 * nothing else asserted the mapping.
 *
 * A declared destination is a promise the navigation makes to somebody
 * holding a phone. This asserts the route behind it exists.
 */

const ROUTE_ROOT = path.resolve(process.cwd(), "src/app/app/products/[productSlug]");

const routeSegments = new Set(
  readdirSync(ROUTE_ROOT).filter((entry) => statSync(path.join(ROUTE_ROOT, entry)).isDirectory())
);

describe("every declared destination has a route behind it", () => {
  const products = productRegistry.list();

  it("registers products to check", () => {
    expect(products.length).toBeGreaterThan(0);
  });

  it("has a route folder for every destination in every product's navigation", () => {
    for (const product of products) {
      for (const destination of product.navigation) {
        expect(
          routeSegments.has(destination),
          `${product.slug} declares "${destination}" but src/app/app/products/[productSlug]/${destination}/ does not exist, so that destination is a 404`
        ).toBe(true);
      }
    }
  });

  it("has a page module in every one of those route folders, not just a folder", () => {
    for (const product of products) {
      for (const destination of product.navigation) {
        if (!routeSegments.has(destination)) continue;
        const page = path.join(ROUTE_ROOT, destination, "page.tsx");
        expect(existsSync(page), `${product.slug} -> ${destination} has no page.tsx`).toBe(true);
      }
    }
  });

  /**
   * startRoute is where a product opens. A product whose front door is
   * missing is worse than one with a missing side room.
   */
  it("has a route for every product's startRoute", () => {
    for (const product of products) {
      if (!product.startRoute) continue;
      expect(
        routeSegments.has(product.startRoute),
        `${product.slug} opens at "${product.startRoute}", which has no route`
      ).toBe(true);
    }
  });
});
