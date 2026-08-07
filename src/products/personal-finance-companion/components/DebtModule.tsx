"use client";

import type { ProductDefinition } from "@/product-framework/definition";
import { CreditCard } from "@/design-system/Icon";
import { listDebts } from "../domain/debts";
import RecordSectionModule from "./RecordSectionModule";

export default function DebtModule({ definition }: { definition: ProductDefinition }) {
  return (
    <RecordSectionModule
      definition={definition}
      icon={CreditCard}
      entityLabel="Debt"
      emptyDescription="What is owed — the foundation for a future payoff view. Add/edit UI and the missing-interest-rate flag are built in the next stage."
      list={listDebts}
    />
  );
}
