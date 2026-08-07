"use client";

import type { ProductDefinition } from "@/product-framework/definition";
import { RotateCcw } from "@/design-system/Icon";
import { listSubscriptions } from "../domain/subscriptions";
import RecordSectionModule from "./RecordSectionModule";

export default function SubscriptionsModule({ definition }: { definition: ProductDefinition }) {
  return (
    <RecordSectionModule
      definition={definition}
      icon={RotateCcw}
      entityLabel="Subscriptions"
      emptyDescription="Optional recurring charges, kept visibly distinct from Bills. Add/edit UI and the one-tap decision control are built in the next stage."
      list={listSubscriptions}
    />
  );
}
