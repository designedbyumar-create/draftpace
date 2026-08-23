import { shopRegistry } from "../registry";
import { monthlyMoneyResetShopProduct } from "./monthly-money-reset";
import { personalFinanceCompanionShopProduct } from "./personal-finance-companion";
import { homeManagementCompanionShopProduct } from "./home-management-companion";
import { personalLifeAffairsCompanionShopProduct } from "./personal-life-affairs-companion";
import { homeschoolingCompanionShopProduct } from "./homeschooling-companion";

/**
 * Real, published Shop listings, never gated by the dev-fixture check
 * (unlike src/shop/fixtures/index.ts, which is dev-only preview content).
 * A real listing is registered in every environment, same as a real product
 * in the product-framework registry.
 */
const PRODUCTS = [
  monthlyMoneyResetShopProduct,
  personalFinanceCompanionShopProduct,
  homeManagementCompanionShopProduct,
  personalLifeAffairsCompanionShopProduct,
  homeschoolingCompanionShopProduct,
];

let registered = false;

export function registerRealShopProducts(): void {
  if (registered) return;
  registered = true;

  for (const product of PRODUCTS) {
    if (!shopRegistry.getBySlug(product.slug as string)) {
      shopRegistry.register(product);
    }
  }
}
