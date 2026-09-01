import { ProductDefinition, ProductDefinitionInput, validateProductDefinition } from "./definition";
import { familyRegistry, isCapabilitySupportedByFamily } from "./families";
import { areDevFixturesEnabled } from "./environment";

/**
 * The single product registry. Every product — real or fixture — goes
 * through the same `register()` call and the same Zod validation; fixtures
 * are not a separate code path, they are just definitions with
 * `devFixture: true` (see docs/DATA-BOUNDARIES.md).
 */
class ProductRegistry {
  private products = new Map<string, ProductDefinition>();

  register(input: ProductDefinitionInput): ProductDefinition {
    const definition = validateProductDefinition(input);

    const family = familyRegistry.get(definition.family);
    if (!family) {
      throw new Error(`Unknown product family "${definition.family}" for product "${definition.slug}".`);
    }

    const unsupported = definition.capabilities.filter(
      (capabilityId) => !isCapabilitySupportedByFamily(family, capabilityId)
    );
    if (unsupported.length > 0) {
      throw new Error(
        `Product "${definition.slug}" declares capabilities not supported by family "${family.id}": ${unsupported.join(", ")}`
      );
    }

    if (this.products.has(definition.slug)) {
      throw new Error(`Product slug already registered: ${definition.slug}`);
    }

    this.products.set(definition.slug, definition);
    return definition;
  }

  /** Clears every registered product. Test-only escape hatch. */
  reset(): void {
    this.products.clear();
  }

  getBySlug(slug: string): ProductDefinition | undefined {
    const found = this.products.get(slug);
    if (!found) return undefined;
    if (found.devFixture && !areDevFixturesEnabled()) return undefined;
    return found;
  }

  list(): ProductDefinition[] {
    return [...this.products.values()].filter((product) => !product.devFixture || areDevFixturesEnabled());
  }
}

export const productRegistry = new ProductRegistry();
