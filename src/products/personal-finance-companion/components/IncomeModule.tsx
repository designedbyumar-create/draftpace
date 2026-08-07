"use client";

import type { ProductDefinition } from "@/product-framework/definition";
import { Wallet } from "@/design-system/Icon";
import { listIncomeSources } from "../domain/incomeSources";
import RecordSectionModule from "./RecordSectionModule";

export default function IncomeModule({ definition }: { definition: ProductDefinition }) {
  return (
    <RecordSectionModule
      definition={definition}
      icon={Wallet}
      entityLabel="Income"
      emptyDescription="When money is expected and how confident to be about it. Add/edit UI and the confirmed-vs-estimated confidence badge are built in the next stage."
      list={listIncomeSources}
    />
  );
}
