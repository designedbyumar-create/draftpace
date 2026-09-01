"use client";

import type { ProductDefinition } from "@/product-framework/definition";
import { ListChecks } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import InfrastructurePlaceholder from "./InfrastructurePlaceholder";
import { useSetupState } from "./useSetupState";
import { financialAreaSchema } from "../state";

/**
 * Infrastructure verification for the Financial Setup Centre (launch spec
 * section 13) — the returning-user status grid across all seven areas.
 * Real UI (consolidated missing-information list, needs-review list,
 * "add another source", reopen Companion) is the next stage; this
 * destination proves the per-area status readout has somewhere real to
 * read from (pfc_setup_state.areaProgress) rather than inventing its own
 * second status source.
 */
export default function SetupCentreModule({ definition }: { definition: ProductDefinition }) {
  const { status, state } = useSetupState();
  const areas = financialAreaSchema.options;

  return (
    <InfrastructurePlaceholder
      definition={definition}
      icon={ListChecks}
      title="Setup Centre: status grid not built yet"
      description="The consolidated missing-information list, needs-review list, and 'add another source' action are the next stage. This destination currently only proves per-area status reads from the same setup-state row Companion writes to."
    >
      {status === "ready" && state && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          {areas.map((area) => (
            <Badge key={area} tone={state.areaProgress[area] === "complete" ? "success" : "neutral"}>
              {area}: {state.areaProgress[area] ?? "not-started"}
            </Badge>
          ))}
        </div>
      )}
    </InfrastructurePlaceholder>
  );
}
