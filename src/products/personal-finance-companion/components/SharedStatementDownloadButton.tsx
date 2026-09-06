"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import { Download } from "@/design-system/Icon";
import { findPersonalFinanceCompanionInstanceId } from "../setupStateData";
import { listBills } from "../domain/bills";
import { listSubscriptions } from "../domain/subscriptions";

/**
 * Generates and downloads the Shared Responsibility statement on demand ,
 * client-side, from the same live bills/subscriptions data the Bills and
 * Subscriptions sections show, never a stale pre-baked file. Only ever
 * reaches @react-pdf/renderer via this dynamic import, matching every
 * other generatePdf.tsx in this repo.
 */
export default function SharedStatementDownloadButton() {
  const [state, setState] = useState<"idle" | "working" | "error">("idle");

  async function handleDownload() {
    setState("working");
    const found = await findPersonalFinanceCompanionInstanceId();
    if (found.status !== "found") {
      setState("error");
      return;
    }
    const [bills, subscriptions] = await Promise.all([listBills(found.id), listSubscriptions(found.id)]);
    if (!bills.ok || !subscriptions.ok) {
      setState("error");
      return;
    }
    const items = [...bills.data, ...subscriptions.data].filter((item) => item.shared);
    const { downloadSharedStatement } = await import("../printables/generateSharedStatement");
    await downloadSharedStatement({
      generatedLabel: new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
      items,
      origin: window.location.origin,
      slug: "personal-finance-companion",
    });
    setState("idle");
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <Button size="sm" variant="secondary" onClick={handleDownload} disabled={state === "working"} iconLeft={<Download size={14} aria-hidden />}>
        {state === "working" ? "Preparing…" : "Download shared statement"}
      </Button>
      {state === "error" && <p className="text-[12px] text-[var(--danger)]">Couldn&apos;t generate the statement. Try again.</p>}
    </div>
  );
}
