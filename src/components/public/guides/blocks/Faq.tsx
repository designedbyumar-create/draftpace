import { renderInline } from "../inline";

/**
 * Questions and answers, visible, one under the other.
 *
 * Not an accordion, on purpose. A collapsed answer is invisible to a
 * skimming reader and worth less to a search engine choosing a snippet,
 * and the reader who arrived holding one of these questions should see
 * it answered without a click. The question is an h3 under the section's
 * h2, so it can be a People Also Ask match in its own right.
 */
export default function Faq({ items, idPrefix }: { items: { q: string; a: string }[]; idPrefix: string }) {
  return (
    <div className="mt-2 flex flex-col divide-y divide-[var(--border)]">
      {items.map((item, i) => (
        <div key={item.q} className="py-5 first:pt-3 last:pb-0">
          <h3 className="text-[17px] font-semibold leading-snug text-[var(--text)]">{item.q}</h3>
          <p className="mt-2 text-[16.5px] leading-[1.75] text-[var(--text)]">{renderInline(item.a, `${idPrefix}-a${i}`)}</p>
        </div>
      ))}
    </div>
  );
}
