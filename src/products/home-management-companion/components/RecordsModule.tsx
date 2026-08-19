"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import { Home, Wrench, User, ChevronRight, Layers3 } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { listAppliances } from "../domain/appliances";
import { listMaintenanceTasks } from "../domain/maintenanceTasks";
import { listServiceProviders } from "../domain/serviceProviders";
import type { Appliance, MaintenanceTask, ServiceProvider } from "../state";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * Records: the coherent home for Home Base's three record types. Same
 * hub-of-summary-cards shape as PFC's own RecordsModule, scoped down to
 * three areas and without an attention-count badge yet, that's added
 * once the deterministic Attention derivation exists (a later phase),
 * not invented ad hoc here.
 */
export default function RecordsModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);

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
    const [appliancesResult, tasksResult, providersResult] = await Promise.all([
      listAppliances(found.id),
      listMaintenanceTasks(found.id),
      listServiceProviders(found.id),
    ]);
    const results = [appliancesResult, tasksResult, providersResult];
    const failed = results.find((r) => !r.ok);
    if (failed && !failed.ok) {
      setErrorMessage(describeResultError(failed.error));
      setStatus("error");
      return;
    }
    setAppliances(appliancesResult.ok ? appliancesResult.data.filter((a) => a.status !== "archived") : []);
    setTasks(tasksResult.ok ? tasksResult.data.filter((t) => t.status !== "archived") : []);
    setProviders(providersResult.ok ? providersResult.data.filter((p) => p.status !== "archived") : []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading Records…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Layers3}
        title="Couldn't load Records"
        description={errorMessage ?? "Something went wrong. Try again."}
        action={
          <Button size="sm" variant="secondary" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }

  if (status === "no-instance") {
    return <EmptyState icon={Layers3} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const totalRecords = appliances.length + tasks.length + providers.length;
  const withWarranty = appliances.filter((a) => a.warrantyExpiresAt).length;
  const neverLogged = tasks.filter((t) => !t.lastDoneAt).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">Records</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          {totalRecords === 0 ? "Nothing recorded yet across any area." : "What's actually in your home, area by area."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AreaCard href="/app/products/home-management-companion/appliances" icon={Home} label="Appliances">
          {appliances.length === 0 ? (
            <EmptyLine>Add an appliance to start tracking warranties.</EmptyLine>
          ) : (
            <>
              <Headline>{appliances.length}</Headline>
              <DetailLine>
                {appliances.length === 1 ? "appliance" : "appliances"} tracked
                {withWarranty > 0 && ` · ${withWarranty} with warranty on file`}
              </DetailLine>
            </>
          )}
        </AreaCard>

        <AreaCard href="/app/products/home-management-companion/maintenance" icon={Wrench} label="Maintenance">
          {tasks.length === 0 ? (
            <EmptyLine>Add a repeating task to track what's due.</EmptyLine>
          ) : (
            <>
              <Headline>{tasks.length}</Headline>
              <DetailLine>
                {tasks.length === 1 ? "task" : "tasks"} tracked
                {neverLogged > 0 && ` · ${neverLogged} never logged`}
              </DetailLine>
            </>
          )}
        </AreaCard>

        <AreaCard href="/app/products/home-management-companion/providers" icon={User} label="Service providers">
          {providers.length === 0 ? (
            <EmptyLine>Add who you've called before.</EmptyLine>
          ) : (
            <>
              <Headline>{providers.length}</Headline>
              <DetailLine>{providers.length === 1 ? "provider" : "providers"} saved</DetailLine>
            </>
          )}
        </AreaCard>
      </div>
    </div>
  );
}

function AreaCard({
  href,
  icon: Icon,
  label,
  children,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Surface className="flex h-full flex-col gap-2 transition hover:border-[var(--primary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <Icon size={15} aria-hidden />
            </div>
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">{label}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--faint)]" aria-hidden />
        </div>
        <div>{children}</div>
      </Surface>
    </Link>
  );
}

function Headline({ children }: { children: React.ReactNode }) {
  return <p className="text-[22px] font-semibold tabular-nums leading-tight text-[var(--text)]">{children}</p>;
}

function DetailLine({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-[var(--muted)]">{children}</p>;
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-[var(--muted)]">{children}</p>;
}
