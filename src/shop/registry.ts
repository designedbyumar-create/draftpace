import { ShopProduct, ShopProductInput, validateShopProduct } from "./definition";
import { areDevFixturesEnabled } from "@/product-framework/environment";

/**
 * The public Shop registry. Uses the same dev-fixture gate as the internal
 * product framework (areDevFixturesEnabled) so both systems agree on what
 * "development-only" means, but keeps its own separate list of listings —
 * publishing a product here is a deliberate customer-facing decision, not
 * something that happens automatically when a product is registered
 * internally.
 */
class ShopRegistry {
  private products = new Map<string, ShopProduct>();

  register(input: ShopProductInput): ShopProduct {
    const product = validateShopProduct(input);
    if (this.products.has(product.slug)) {
      throw new Error(`Shop product slug already registered: ${product.slug}`);
    }
    this.products.set(product.slug, product);
    return product;
  }

  reset(): void {
    this.products.clear();
  }

  private isVisible(product: ShopProduct): boolean {
    if (product.devFixture && !areDevFixturesEnabled()) return false;
    return true;
  }

  getBySlug(slug: string): ShopProduct | undefined {
    const found = this.products.get(slug);
    if (!found || !this.isVisible(found)) return undefined;
    return found;
  }

  /** Published listings only — what a customer should ever see. */
  listPublished(): ShopProduct[] {
    return [...this.products.values()].filter(
      (product) => this.isVisible(product) && product.publicationStatus === "published"
    );
  }

  /** Everything visible in this environment, any status — for internal use only. */
  listAll(): ShopProduct[] {
    return [...this.products.values()].filter((product) => this.isVisible(product));
  }
}

export const shopRegistry = new ShopRegistry();
