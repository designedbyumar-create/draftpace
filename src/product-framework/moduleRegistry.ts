import type { ComponentType } from "react";
import { ProductDefinition } from "./definition";
import type { ProductDestinationId } from "./destinations";

/**
 * Contract for registering a custom, product-specific UI module (e.g. a
 * finance envelope tracker, a room-layout planner, a focus timer) without
 * forcing it through the generic form-style primitives. See
 * docs/PRODUCT-FRAMEWORK.md.
 */
export type ProductModuleComponent = ComponentType<{ definition: ProductDefinition }>;

class ModuleRegistry {
  private modules = new Map<string, ProductModuleComponent>();

  register(id: string, component: ProductModuleComponent): void {
    if (this.modules.has(id)) {
      throw new Error(`Product module already registered: ${id}`);
    }
    this.modules.set(id, component);
  }

  get(id: string): ProductModuleComponent | undefined {
    return this.modules.get(id);
  }

  has(id: string): boolean {
    return this.modules.has(id);
  }
}

export const moduleRegistry = new ModuleRegistry();

/**
 * Looks up whether a product has registered a real UI module for a given
 * destination. Used by the shared `/app/products/[productSlug]/{destination}`
 * pages to render a product's own component when one exists, falling back to
 * the generic structural description otherwise — the shell branches on
 * "does a module exist for this destination", never on family or slug.
 */
export function resolveProductModule(
  definition: ProductDefinition,
  destination: ProductDestinationId
): ProductModuleComponent | undefined {
  const registration = definition.modules.find((module) => module.destination === destination);
  if (!registration) return undefined;
  return moduleRegistry.get(registration.id);
}
