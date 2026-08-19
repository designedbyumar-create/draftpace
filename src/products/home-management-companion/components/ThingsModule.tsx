"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Home, Plus, ChevronRight } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import EmptyState from "@/design-system/EmptyState";
import Button from "@/design-system/Button";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { listHomeItems, createHomeItem } from "../domain/homeItems";
import { HOME_ITEM_TYPE_BY_ID } from "../homeKnowledge";
import type { HomeItem } from "../state";
import SectionShell from "./shared/SectionShell";
import { StatRow, StatTile } from "./shared/StatRow";
import { STATUS_LABEL, STATUS_TONE } from "./shared/lifecycle";
import ThingFormSheet, { thingFormValuesToPatch, type ThingFormValues } from "./things/ThingFormSheet";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";
type SaveResult = { ok: true; thing: HomeItem } | { ok: false; message: string };

function typeLabel(type: string): string {
  return HOME_ITEM_TYPE_BY_ID[type]?.label ?? "Other";
}

/**
 * Things: what's actually in the home. Replaces AppliancesModule, same
 * shell, wider entity. A row is now a link to the Thing's own detail page
 * (Identity/Care/History/Records/People), not an inline edit sheet; Archive
 * moved there too. Quick-add still opens a form sheet here, which itself
 * offers deterministic maintenance suggestions once a new Thing is saved.
 */
export default function ThingsModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [things, setThings] = useState<HomeItem[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const addButtonRef = useRef<HTMLDivElement>(null);

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
    setInstanceId(found.id);
    const result = await listHomeItems(found.id);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      setStatus("error");
      return;
    }
    setThings(result.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(values: ThingFormValues): Promise<SaveResult> {
    if (!instanceId) return { ok: false, message: "Couldn't find your home. Try reloading the page." };
    const result = await createHomeItem(instanceId, thingFormValuesToPatch(values));
    if (!result.ok) return { ok: false, message: describeResultError(result.error) };
    setThings((prev) => [...prev, result.data]);
    return { ok: true, thing: result.data };
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Home}
        title="Couldn't load your home"
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
    return <EmptyState icon={Home} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const active = things.filter((t) => t.status !== "archived");
  const archived = things.filter((t) => t.status === "archived");
  const withWarranty = active.filter((t) => t.warrantyExpiresAt).length;

  return (
    <SectionShell
      icon={Home}
      title="Your home"
      purpose="Everything Home Base is keeping an eye on."
      recordsLabel="In your home"
      onAdd={() => setFormOpen(true)}
      addLabel="Add something"
      summary={
        <StatRow>
          <StatTile label="Tracked" value={String(active.length)} />
          <StatTile label="With warranty on file" value={String(withWarranty)} tone="muted" />
        </StatRow>
      }
      dominantAction={null}
    >
      {active.length === 0 ? (
        <EmptyState
          icon={Home}
          title="Home Base doesn't know your home yet"
          description="Add what's in your home, and Home Base starts keeping its warranty, its upkeep and its history for you."
          action={
            <div ref={addButtonRef} className="inline-block">
              <Button size="sm" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setFormOpen(true)}>
                Add something
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {active.map((thing) => (
            <ThingRow key={thing.id} thing={thing} />
          ))}
        </ul>
      )}

      {archived.length > 0 && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
          >
            {showArchived ? "Hide" : "Show"} {archived.length} archived {archived.length === 1 ? "item" : "items"}
          </button>
          {showArchived && (
            <ul className="mt-2.5 flex flex-col gap-2.5 opacity-70">
              {archived.map((thing) => (
                <ThingRow key={thing.id} thing={thing} />
              ))}
            </ul>
          )}
        </div>
      )}

      <ThingFormSheet
        open={formOpen}
        thing={null}
        instanceId={instanceId}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        triggerRef={addButtonRef}
      />
    </SectionShell>
  );
}

function ThingRow({ thing }: { thing: HomeItem }) {
  return (
    <li>
      <Link
        href={`/app/products/home-management-companion/things/${thing.id}`}
        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--primary)]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="min-w-0 truncate text-[14px] font-semibold text-[var(--text)]">{thing.name}</p>
            {thing.status !== "active" && <Badge tone={STATUS_TONE[thing.status]}>{STATUS_LABEL[thing.status]}</Badge>}
          </div>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            {typeLabel(thing.type)}
            {thing.brand && ` · ${thing.brand}`}
            {thing.location && ` · ${thing.location}`}
          </p>
          {thing.warrantyExpiresAt && (
            <p className="mt-1 text-[12px] text-[var(--muted)]">Warranty expires {thing.warrantyExpiresAt}</p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--faint)]" aria-hidden />
      </Link>
    </li>
  );
}
