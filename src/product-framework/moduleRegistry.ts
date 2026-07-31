import type { ComponentType } from "react";
import { ProductDefinition } from "./definition";

/**
 * Contract for registering a custom, product-specific UI module (e.g. a
 * finance envelope tracker, a room-layout planner, a focus timer) without
 * forcing it through the generic form-style primitives. Phase 1 ships the
 * registry with nothing registered — this proves the contract exists, it
 * does not implement any real module. See docs/PRODUCT-FRAMEWORK.md.
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
