import { productRegistry } from "@/product-framework/registry";
import { moduleRegistry } from "@/product-framework/moduleRegistry";
import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { monthlyMoneyResetCatalogEntry } from "./monthly-money-reset/catalog";
import { hiddenAccessTestCatalogEntry } from "./hidden-access-test/catalog";
import { personalFinanceCompanionCatalogEntry } from "./personal-finance-companion/catalog";

/**
 * The one auditable list of every real product Draftpace registers. This is
 * the only file allowed to import a specific product's catalog entry —
 * routes, Home, Library, and activation all call the generic
 * ensureProductsRegistered() below and never name a product directly.
 *
 * Adding a second product means one new import and one new array entry here,
 * nothing else. See docs/PRODUCT-FRAMEWORK.md. hidden-access-test is exactly
 * that proof: a second, unrelated product added with no changes anywhere
 * else in this file.
 */
const PRODUCT_CATALOG: ProductCatalogEntry[] = [
  monthlyMoneyResetCatalogEntry,
  hiddenAccessTestCatalogEntry,
  personalFinanceCompanionCatalogEntry,
];

let registered = false;

/**
 * Idempotent and cheap, safe to call on every request. Called defensively at
 * every route that performs a productRegistry lookup, not just once at the
 * top of the tree — a given compiled route's module graph in Next.js dev mode
 * isn't guaranteed to share registration state with a different part of the
 * tree, which is what caused the intermittent client-navigation 404 in the
 * P0 stability incident, 2026-08-04. Collapsing every call site to this one
 * generic function removes the per-product naming duplication; it doesn't
 * remove the need for each route to guarantee its own module instance is
 * registered.
 */
export function ensureProductsRegistered(): void {
  if (registered) return;
  registered = true;

  for (const entry of PRODUCT_CATALOG) {
    const slug = entry.definition.slug as string;
    if (!productRegistry.getBySlug(slug)) {
      productRegistry.register(entry.definition);
    }
    for (const [moduleId, component] of Object.entries(entry.moduleComponents)) {
      if (!moduleRegistry.has(moduleId)) {
        moduleRegistry.register(moduleId, component);
      }
    }
  }
}
