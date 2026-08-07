"use client";

import type { ProductDefinition } from "@/product-framework/definition";
import { Bank } from "@/design-system/Icon";
import { listAccounts } from "../domain/accounts";
import RecordSectionModule from "./RecordSectionModule";

export default function AccountsModule({ definition }: { definition: ProductDefinition }) {
  return (
    <RecordSectionModule
      definition={definition}
      icon={Bank}
      entityLabel="Accounts"
      emptyDescription="Where money currently sits — the foundation for available cash. Add/edit UI, the balance-staleness flag, and the funding-source picker are built in the next stage."
      list={listAccounts}
    />
  );
}
