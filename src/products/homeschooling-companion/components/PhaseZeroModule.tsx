"use client";

import EmptyState from "@/design-system/EmptyState";
import type { DraftpaceIcon } from "@/design-system/Icon";

/**
 * Phase 0's honest placeholder.
 *
 * Every destination this product declares is reachable from today, and
 * every one of them says plainly that it is not built yet. That is the
 * platform's rule 8, and it is also the only way to verify the shell,
 * the rail, the routing and the entitlement gate before there is a
 * single feature to hide behind.
 *
 * One shared component rather than four near-identical files, because
 * four files that differ by a string are four files to keep in step.
 * Each destination replaces it with something real in its own phase,
 * and this component should be deleted when the last one does.
 */
export default function PhaseZeroModule({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: DraftpaceIcon;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">{eyebrow}</p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          {title}
        </h1>
      </div>
      <EmptyState icon={icon} title="Not built yet" description={description} />
    </div>
  );
}
