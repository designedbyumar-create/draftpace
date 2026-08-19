import type { ProductDefinition } from "@/product-framework/definition";
import EmptyState from "@/design-system/EmptyState";
import { HandWaving } from "@/design-system/Icon";

/** Placeholder — the real welcome/orientation screen ships in a later phase. */
export default function StartModule({ definition }: { definition: ProductDefinition }) {
  return (
    <EmptyState
      icon={HandWaving}
      title={`Welcome to ${definition.title}`}
      description="This destination is not built yet."
    />
  );
}
