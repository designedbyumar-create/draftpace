/**
 * A product's name, price and problemsSolved, read from its real Shop
 * listing (src/shop/products/<slug>.ts), the same object the Shop page and
 * the checkout read. A creative never states a price of its own: change
 * the price there (after Lemon Squeezy, see docs/COMMERCE.md) and every
 * post shows the new one on its next render.
 */
import { alongsideShopProduct } from "@/shop/products/alongside";
import { familyHealthBinderShopProduct } from "@/shop/products/family-health-binder";
import { homeManagementCompanionShopProduct } from "@/shop/products/home-management-companion";
import { homeschoolingCompanionShopProduct } from "@/shop/products/homeschooling-companion";
import { monthlyMoneyResetShopProduct } from "@/shop/products/monthly-money-reset";
import { personalFinanceCompanionShopProduct } from "@/shop/products/personal-finance-companion";
import { personalLifeAffairsCompanionShopProduct } from "@/shop/products/personal-life-affairs-companion";
import { travelCompanionShopProduct } from "@/shop/products/travel-companion";
import { vehicleMaintenanceCompanionShopProduct } from "@/shop/products/vehicle-maintenance-companion";
import type { ShopProductInput } from "@/shop/definition";

export const SHOP_LISTINGS: Record<string, ShopProductInput> = {
  alongside: alongsideShopProduct,
  "family-health-binder": familyHealthBinderShopProduct,
  "home-management-companion": homeManagementCompanionShopProduct,
  "homeschooling-companion": homeschoolingCompanionShopProduct,
  "monthly-money-reset": monthlyMoneyResetShopProduct,
  "personal-finance-companion": personalFinanceCompanionShopProduct,
  "personal-life-affairs-companion": personalLifeAffairsCompanionShopProduct,
  "travel-companion": travelCompanionShopProduct,
  "vehicle-maintenance-companion": vehicleMaintenanceCompanionShopProduct,
};

export function listingFor(slug: string): ShopProductInput {
  const listing = SHOP_LISTINGS[slug];
  if (!listing) throw new Error(`No Shop listing for "${slug}". Known: ${Object.keys(SHOP_LISTINGS).join(", ")}`);
  return listing;
}

/** "Free", or the listing's price as the Shop shows it ("$34"; cents only when there are any). */
export function displayPrice(listing: ShopProductInput): string {
  if (listing.access === "free" || !listing.price) return "Free";
  const { amount, currency } = listing.price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

/** What a post's footer prints: the real listing title and price. */
export function productLine(slug: string): { name: string; price: string } {
  const listing = listingFor(slug);
  return { name: listing.title, price: displayPrice(listing) };
}
