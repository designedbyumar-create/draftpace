"use client";

import type { ProductDefinition } from "@/product-framework/definition";
import { CalendarCheck } from "@/design-system/Icon";
import { listBills } from "../domain/bills";
import RecordSectionModule from "./RecordSectionModule";

export default function BillsModule({ definition }: { definition: ProductDefinition }) {
  return (
    <RecordSectionModule
      definition={definition}
      icon={CalendarCheck}
      entityLabel="Bills"
      emptyDescription="Required recurring obligations. Add/edit UI, the funded toggle, and the upcoming-due timeline are built in the next stage."
      list={listBills}
    />
  );
}
