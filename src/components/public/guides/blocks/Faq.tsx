import { CaretDown } from "@/design-system/Icon";
import { renderInline } from "../inline";

/**
 * Questions and answers, as a native accordion.
 *
 * `<details>`/`<summary>` needs no client JavaScript to open or close:
 * the browser owns that state, keyboard and screen-reader behaviour
 * come free, and the answer text stays in the DOM (and so stays
 * indexable) even while collapsed. That is also why an earlier version
 * of this file rendered every answer fully expanded, reasoning that a
 * collapsed answer was invisible to a search engine: the FAQPage
 * structured data in structuredData.ts is built from this block's own
 * `{q, a}` array, never scraped from the rendered page, so collapsing
 * the visible copy was never actually a search-visibility trade to
 * begin with, only a reading one.
 *
 * The first question opens by default, so a reader who arrived holding
 * it still sees the answer without a click; the rest start closed, so a
 * long FAQ doesn't read as a wall of text.
 */
export default function Faq({ items, idPrefix }: { items: { q: string; a: string }[]; idPrefix: string }) {
  return (
    <div className="mt-2 flex flex-col divide-y divide-[var(--border)]">
      {items.map((item, i) => (
        <details key={item.q} open={i === 0} className="group py-5 first:pt-3 last:pb-0">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-body-lg font-semibold leading-snug text-[var(--text)] [&::-webkit-details-marker]:hidden">
            {item.q}
            <CaretDown
              size={16}
              aria-hidden
              className="shrink-0 text-[var(--faint)] transition-transform duration-[var(--dur)] group-open:rotate-180"
            />
          </summary>
          <p className="mt-2 text-body-lg text-[var(--text)]">{renderInline(item.a, `${idPrefix}-a${i}`)}</p>
        </details>
      ))}
    </div>
  );
}
