import { productRegistry } from "./registry";
import type { ProductDefinition } from "./definition";
import type { EntitlementSummary } from "./entitlements";
import type { ListInstancesResult, ProductInstanceSummary } from "./instances";

/**
 * What Library and Platform Home actually render, one row per owned
 * product. An entitlement is the only thing that ever removes a row (it
 * genuinely isn't owned); every other kind of failure degrades the row
 * instead of hiding it, so a read error is never mistaken for "you don't
 * own this." The one place this derivation happens — see resolveDestination.ts
 * for the equivalent for "where does it link to."
 */
export type OwnedProductRow =
  | {
      kind: "ready";
      productSlug: string;
      entitlement: EntitlementSummary;
      definition: ProductDefinition;
      /** null means no instance exists yet for the current cycle, not a load failure. */
      instance: ProductInstanceSummary | null;
      sortTimestamp: string;
    }
  | {
      kind: "progress-unavailable";
      productSlug: string;
      entitlement: EntitlementSummary;
      definition: ProductDefinition;
      sortTimestamp: string;
    }
  | {
      kind: "definition-missing";
      productSlug: string;
      entitlement: EntitlementSummary;
      sortTimestamp: string;
    };

export function deriveOwnedProducts(
  entitlements: EntitlementSummary[],
  instances: ListInstancesResult
): OwnedProductRow[] {
  const rows = entitlements.map((entitlement): OwnedProductRow => {
    const definition = productRegistry.getBySlug(entitlement.productSlug);

    if (!definition) {
      return {
        kind: "definition-missing",
        productSlug: entitlement.productSlug,
        entitlement,
        sortTimestamp: entitlement.grantedAt,
      };
    }

    if (instances.status === "error") {
      return {
        kind: "progress-unavailable",
        productSlug: entitlement.productSlug,
        entitlement,
        definition,
        sortTimestamp: entitlement.grantedAt,
      };
    }

    // Rows are ordered by last_activity_at desc, so the first match per slug is the latest.
    const instance = instances.rows.find((row) => row.productSlug === entitlement.productSlug) ?? null;

    return {
      kind: "ready",
      productSlug: entitlement.productSlug,
      entitlement,
      definition,
      instance,
      sortTimestamp: instance?.lastActivityAt ?? entitlement.grantedAt,
    };
  });

  return rows.sort((a, b) => (a.sortTimestamp < b.sortTimestamp ? 1 : -1));
}
