import { ProductDefinition } from "./definition";
import { productRegistry } from "./registry";

/**
 * Resolves a product slug (+ optional requested version) to its definition.
 * Phase 1 only ever registers one version per slug, so resolution is
 * trivial today — the contract exists so a future multi-version registry
 * (see docs/PRODUCT-FRAMEWORK.md's versioning notes) is a drop-in swap
 * behind this same function, not a call-site rewrite.
 */
export function resolveProductVersion(slug: string, requestedVersion?: string): ProductDefinition | undefined {
  const product = productRegistry.getBySlug(slug);
  if (!product) return undefined;
  if (requestedVersion && requestedVersion !== product.version) return undefined;
  return product;
}
