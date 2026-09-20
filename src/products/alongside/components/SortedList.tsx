import Link from "next/link";
import { daysSince, describeDaysSince, type LifeItem } from "../life";

/**
 * Things the person has dealt with, kept where they can be found again.
 *
 * Closed is not the same as gone: the reference number from a call, or the
 * name of who said it would be fine, is exactly what someone needs a month
 * later. Collapsed by default and carrying no count, because a growing
 * number of finished things would be a score, and this product keeps none.
 * Newest first, so the thing you are looking for is usually at the top.
 */
export default function SortedList({ items, now }: { items: LifeItem[]; now: Date }) {
  const sorted = items
    .filter((item) => item.status === "done")
    .sort((a, b) => (b.lastTouchedAt ?? "").localeCompare(a.lastTouchedAt ?? ""));
  if (sorted.length === 0) return null;

  return (
    <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 text-[14px] font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] [&::-webkit-details-marker]:hidden">
        Sorted
        <span
          aria-hidden
          className="text-[12px] font-medium text-[var(--muted)] group-open:hidden"
        >
          Show
        </span>
        <span
          aria-hidden
          className="hidden text-[12px] font-medium text-[var(--muted)] group-open:inline"
        >
          Hide
        </span>
      </summary>
      <div className="border-t border-[var(--border)] px-4 pb-2 pt-3">
        <p className="text-[13px] leading-5 text-[var(--muted)]">
          Things you dealt with. Kept here in case you need to look something up.
        </p>
        <ul className="mt-1 flex flex-col">
          {sorted.map((item) => {
            const days = daysSince(item.lastTouchedAt, now);
            return (
              <li
                key={item.id}
                className="flex flex-col gap-0.5 border-b border-[var(--border)] py-3 last:border-b-0"
              >
                <Link
                  href={`/app/products/alongside/item/${item.id}`}
                  className="text-[15px] leading-6 text-[var(--text)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--primary)]"
                >
                  {item.title}
                </Link>
                {days !== null && (
                  <p className="text-[12px] text-[var(--faint)]">Sorted {describeDaysSince(days)}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}
