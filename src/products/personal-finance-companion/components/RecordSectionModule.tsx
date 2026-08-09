"use client";

import { useEffect, useState } from "react";
import type { ProductDefinition } from "@/product-framework/definition";
import type { DraftpaceIcon } from "@/design-system/Icon";
import type { Result } from "@/product-framework/result";
import { describeResultError } from "@/product-framework/result";
import { findPersonalFinanceCompanionInstanceId } from "../setupStateData";
import InfrastructurePlaceholder from "./InfrastructurePlaceholder";
import Badge from "@/design-system/Badge";

/**
 * Shared infrastructure-verification shell for each of the seven direct
 * financial sections. Not the section's real UI (no add/edit form, no
 * list rendering beyond a count) — its job is to prove, live, that
 * entitlement, routing, the product's continuous instance lookup, and
 * this specific entity's domain repository (list()) are correctly wired
 * end to end, which is exactly the infrastructure this session is
 * responsible for. Real section UI is explicitly out of scope (see
 * docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md).
 */
export default function RecordSectionModule<T>({
  definition,
  icon,
  entityLabel,
  emptyDescription,
  list,
}: {
  definition: ProductDefinition;
  icon: DraftpaceIcon;
  entityLabel: string;
  emptyDescription: string;
  list: (productInstanceId: string) => Promise<Result<T[]>>;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "no-instance" | "error">("loading");
  const [count, setCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const found = await findPersonalFinanceCompanionInstanceId();
      if (cancelled) return;
      if (found.status === "error") {
        setErrorMessage(found.message);
        setStatus("error");
        return;
      }
      if (found.status === "not-found") {
        setStatus("no-instance");
        return;
      }
      const result = await list(found.id);
      if (cancelled) return;
      if (!result.ok) {
        setErrorMessage(describeResultError(result.error));
        setStatus("error");
        return;
      }
      setCount(result.data.length);
      setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [list]);

  return (
    <InfrastructurePlaceholder
      definition={definition}
      icon={icon}
      title={`${entityLabel}: no add/edit UI yet`}
      description={emptyDescription}
    >
      <div className="mt-4 flex items-center justify-center gap-2">
        {status === "loading" && <Badge tone="neutral">Checking live data access…</Badge>}
        {status === "ready" && (
          <Badge tone="success">
            Live query OK: {count} {count === 1 ? "record" : "records"} in {entityLabel.toLowerCase()}
          </Badge>
        )}
        {status === "no-instance" && <Badge tone="warning">No product instance found for this user yet</Badge>}
        {status === "error" && <Badge tone="danger">Data access check failed: {errorMessage}</Badge>}
      </div>
    </InfrastructurePlaceholder>
  );
}
