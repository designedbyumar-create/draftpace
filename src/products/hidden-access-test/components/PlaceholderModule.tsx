import type { ProductDefinition } from "@/product-framework/definition";
import EmptyState from "@/design-system/EmptyState";
import { ShieldCheck } from "@/design-system/Icon";

/**
 * The whole product. It has no real functionality by design — its only
 * job is to exist as a second, non-free product so Phase B's access
 * architecture (entitlement grant, canonical routing, revocation) can be
 * proven against something other than Monthly Money Reset.
 */
export default function PlaceholderModule({ definition }: { definition: ProductDefinition }) {
  return (
    <EmptyState
      icon={ShieldCheck}
      title="This product has no real functionality"
      description={`${definition.title} exists only to verify that access, routing, and revocation work correctly for a product granted outside the free-activation flow.`}
    />
  );
}
