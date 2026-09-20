import { ChevronRight } from "@/design-system/Icon";
import { AFFAIR_DOMAIN_LABEL, type AffairArea } from "../affairsKnowledge";
import { needsReview, type AffairItem } from "../lifeAffairs";

/**
 * How a record reads in a list: what it is, then the one or two things
 * that identify it. Never every field, because a list of everything is
 * the detail page and there would then be no reason to open one.
 */
export function summarise(item: AffairItem): string[] {
  const lines: string[] = [];
  if (item.personName && item.personName !== item.label) lines.push(item.personName);
  if (item.fields.relationship) lines.push(item.fields.relationship);
  if (item.fields.role) lines.push(item.fields.role);
  if (item.whereabouts) lines.push(item.whereabouts);
  return lines.slice(0, 2);
}

/**
 * What this product knows, set as the contents page of the book: a small-caps
 * head per area, then each record in the person's own words with a leader to
 * the way in. Only what exists is listed; an area with nothing in it has no
 * head, because a head over nothing is a checklist row.
 */
export default function AffairsContents({
  groups,
  now,
  onOpen,
}: {
  groups: { area: AffairArea; entries: AffairItem[] }[];
  now: Date;
  onOpen: (id: string) => void;
}) {
  return (
    <>
      {groups.map(({ area, entries }) => (
        <section key={area} aria-label={AFFAIR_DOMAIN_LABEL[area]}>
          <h2 className="border-b border-[var(--border)] pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            {AFFAIR_DOMAIN_LABEL[area]}
          </h2>
          <div className="mt-1 flex flex-col">
            {entries.map((item) => {
              const stale = needsReview(item, now);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpen(item.id)}
                  className="group block w-full border-b border-dotted border-[var(--border-strong)] py-3 text-left transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <span className="flex items-baseline gap-2">
                    <span
                      className="text-[16px] text-[var(--text)]"
                      style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
                    >
                      {item.label}
                    </span>
                    <span aria-hidden className="min-w-4 flex-1 border-b border-dotted border-[var(--border-strong)]" />
                    <ChevronRight
                      size={15}
                      aria-hidden
                      className="shrink-0 self-center text-[var(--muted)] transition-colors group-hover:text-[var(--text)]"
                    />
                  </span>
                  {summarise(item).map((line) => (
                    <span key={line} className="mt-0.5 block text-[12.5px] leading-relaxed text-[var(--muted)]">
                      {line}
                    </span>
                  ))}
                  {stale && (
                    <span className="mt-0.5 block text-[11.5px] font-semibold text-[var(--primary)]">
                      Worth checking again
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
