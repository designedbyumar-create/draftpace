"use client";

import type { ProductDefinition } from "@/product-framework/definition";
import { Clock } from "@/design-system/Icon";
import { listTransactions } from "../domain/transactions";
import RecordSectionModule from "./RecordSectionModule";

export default function TransactionsModule({ definition }: { definition: ProductDefinition }) {
  return (
    <RecordSectionModule
      definition={definition}
      icon={Clock}
      entityLabel="Transactions"
      emptyDescription="What actually happened — the basis for spending awareness. Manual entry, CSV import, and duplicate/transfer review are built in the next stage."
      list={listTransactions}
    />
  );
}
