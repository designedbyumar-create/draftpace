"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Home, WarningCircle, Clock, CheckCircle2 } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { listAppliances } from "../domain/appliances";
import { listMaintenanceTasks } from "../domain/maintenanceTasks";
import { deriveAttentionItems, type AttentionInputs } from "../attention";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * Today: the two-zone snapshot this whole product is built around, what
 * needs attention and a plain "you're fine" otherwise, computed from the
 * same deterministic attention.ts derivation Attention itself uses. No
 * fabricated activity, no rotating tips, nothing to check when nothing's
 * actually due.
 */
export default function WorkspaceModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [records, setRecords] = useState<AttentionInputs | null>(null);
  const [totalActiveRecords, setTotalActiveRecords] = useState(0);

  const load = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    const found = await findHomeManagementCompanionInstanceId();
    if (found.status === "error") {
      setErrorMessage(found.message);
      setStatus("error");
      return;
    }
    if (found.status === "not-found") {
      setStatus("no-instance");
      return;
    }
    const [appliancesResult, tasksResult] = await Promise.all([listAppliances(found.id), listMaintenanceTasks(found.id)]);
    if (!appliancesResult.ok) {
      setErrorMessage(describeResultError(appliancesResult.error));
      setStatus("error");
      return;
    }
    if (!tasksResult.ok) {
      setErrorMessage(describeResultError(tasksResult.error));
      setStatus("error");
      return;
    }
    const appliances = appliancesResult.data.filter((a) => a.status !== "archived");
    const maintenanceTasks = tasksResult.data.filter((t) => t.status !== "archived");
    setRecords({ appliances, maintenanceTasks });
    setTotalActiveRecords(appliances.length + maintenanceTasks.length);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = useMemo(() => new Date(), []);
  const items = useMemo(() => (records ? deriveAttentionItems(records, now) : []), [records, now]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading Today…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Home}
        title="Couldn't load Today"
        description={errorMessage ?? "Something went wrong. Try again."}
        action={
          <Button size="sm" variant="secondary" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }

  if (status === "no-instance" || !records) {
    return <EmptyState icon={Home} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  if (totalActiveRecords === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-[13px] text-[var(--muted)]">Home base</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--text)]">Your home, right now</h1>
        </div>
        <EmptyState
          icon={Home}
          title="Nothing tracked yet"
          description="Add an appliance or a maintenance task, and Today will tell you what's due before it becomes expensive."
          action={
            <Link href="/app/products/home-management-companion/setup">
              <Button size="sm">Set up your home</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const trackedOk = totalActiveRecords - items.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[13px] text-[var(--muted)]">Home base</p>
        <h1 className="mt-1 text-xl font-semibold text-[var(--text)]">Your home, right now</h1>
      </div>

      {items.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">Needs attention ({items.length})</p>
          <ul className="mt-2 flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 transition hover:border-[var(--primary)] ${
                    item.urgency === "needsResolution"
                      ? "border-[var(--warning)]/30 bg-[var(--warning-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  {item.kind === "maintenanceDue" ? (
                    <WarningCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden />
                  ) : (
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--faint)]" aria-hidden />
                  )}
                  <p className="text-[13px] font-medium text-[var(--text)]">{item.message}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {trackedOk > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--success-soft)] p-3.5">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" aria-hidden />
          <p className="text-[13px] font-medium text-[var(--text)]">
            {trackedOk} other {trackedOk === 1 ? "item is" : "items are"} on track.
          </p>
        </div>
      )}

      {items.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--success-soft)] p-3.5">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" aria-hidden />
          <p className="text-[13px] font-medium text-[var(--text)]">Everything&apos;s on track. Nothing needs attention today.</p>
        </div>
      )}
    </div>
  );
}
