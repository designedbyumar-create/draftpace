import { formatGuideDate, type GuideSource } from "@/content/guides";

/**
 * "Where this came from", at the foot of a guide that states a rule, a
 * number or a deadline. Each source shows the day somebody last checked
 * it, because a link with no date claims a freshness it cannot back.
 * Draftpace is a software publisher, not a law firm or a clinic, so this
 * is the honest form of authority: name what the guide rests on and let
 * the reader go and read it.
 */
export default function Sources({ sources }: { sources: GuideSource[] }) {
  if (sources.length === 0) return null;
  return (
    <section aria-labelledby="sources" className="mt-12 border-t border-[var(--border)] pt-6">
      <h2 id="sources" className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
        Sources and how we checked
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {sources.map((source) => (
          <li key={source.url} className="text-[14px] leading-relaxed text-[var(--muted)]">
            <a href={source.url} rel="noopener" className="font-semibold text-[var(--area)] underline underline-offset-2">
              {source.name}
            </a>
            {source.note ? `: ${source.note}` : ""}
            <span className="ml-1 text-[var(--faint)]">Checked {formatGuideDate(source.retrieved)}.</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
