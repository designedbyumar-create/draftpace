"use client";

import type { ProductDefinition } from "@/product-framework/definition";
import { Target } from "@/design-system/Icon";
import { listSavingsGoals } from "../domain/savingsGoals";
import RecordSectionModule from "./RecordSectionModule";

export default function SavingsModule({ definition }: { definition: ProductDefinition }) {
  return (
    <RecordSectionModule
      definition={definition}
      icon={Target}
      entityLabel="Savings"
      emptyDescription="Money set aside on purpose — emergencies, goals, or costs seen coming. Add/edit UI and the required-contribution calculation are built in the next stage."
      list={listSavingsGoals}
    />
  );
}
