"use client";

import Link from "next/link";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import { CheckCircle2 } from "@/design-system/Icon";
import type { FinancialArea } from "../../state";
import type { CapabilityRow } from "../../companion/capability";
import type { AttentionItem } from "../../attention";
import { AREA_CONFIGS } from "./companionAreas";

export interface SessionChange {
  area: FinancialArea;
  created: number;
  edited: number;
  skipped: boolean;
}

/**
 * The end-of-session recap (launch spec Stage C §11) — built entirely
 * from this session's actual changes and the current, real capability/
 * attention state. No generic "great job!" copy: if nothing changed,
 * this screen says so.
 */
export default function SessionRecap({
  changes,
  capabilities,
  attentionItems,
  onReopenCompanion,
}: {
  changes: SessionChange[];
  capabilities: CapabilityRow[];
  attentionItems: AttentionItem[];
  onReopenCompanion: () => void;
}) {
  const touched = changes.filter((c) => c.created > 0 || c.edited > 0 || c.skipped);
  const readyCapabilities = capabilities.filter((c) => c.status !== "waiting");
  const nextAttentionItem = attentionItems[0] ?? null;

  return (
    <Surface elevated className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Session complete</p>
        <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">Here&apos;s what changed.</h2>
      </div>

      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">What changed</p>
        {touched.length === 0 ? (
          <p className="mt-2 text-[14px] text-[var(--muted)]">Nothing was added or changed this time.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5">
            {touched.map((c) => (
              <li key={c.area} className="flex items-center gap-2 text-[14px] text-[var(--text)]">
                <CheckCircle2 size={15} aria-hidden className="text-[var(--success)]" />
                {c.created > 0 && (
                  <span>
                    {c.created} {c.created === 1 ? AREA_CONFIGS[c.area].singularNoun : AREA_CONFIGS[c.area].pluralNoun} added
                  </span>
                )}
                {c.created > 0 && c.edited > 0 && <span>·</span>}
                {c.edited > 0 && <span>{c.edited} updated</span>}
                {c.created === 0 && c.edited === 0 && c.skipped && <span>{AREA_CONFIGS[c.area].title} left for later</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">What Draftpace can show now</p>
        {readyCapabilities.length === 0 ? (
          <p className="mt-2 text-[14px] text-[var(--muted)]">Not enough is recorded yet for a current picture.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {readyCapabilities.map((c) => (
              <li key={c.key} className="rounded-full border border-[var(--border)] px-3 py-1 text-[12px] font-semibold text-[var(--text)]">
                {c.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {nextAttentionItem && (
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">Next useful action</p>
          <Link
            href={nextAttentionItem.deepLink}
            className="mt-2 block rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[13px] font-medium text-[var(--text)] hover:border-[var(--primary)]"
          >
            {nextAttentionItem.message}
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-2.5 border-t border-[var(--border)] pt-4">
        <Button size="md" variant="secondary" onClick={onReopenCompanion}>
          Add more now
        </Button>
        <Link href="/app/products/personal-finance-companion/workspace">
          <Button size="md">See my current picture</Button>
        </Link>
      </div>
    </Surface>
  );
}
