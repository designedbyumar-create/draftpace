import Link from "next/link";
import { ArrowRight } from "@/design-system/Icon";
import type { Guide } from "@/content/guides";

type Pick = { guide: Guide; reason: string };

/**
 * Where a reader goes when the guide has done its job.
 *
 * It replaces the previous/next cards, which were neighbours in a list and
 * so gave a reader no reason to click, and a "related" grid that was
 * mostly unrelated. Every link here comes with the reason to follow it,
 * because that sentence is what makes an internal link worth clicking and
 * what tells a search engine what the target is about.
 */
export default function NextSteps({
  next,
  also,
  hub,
}: {
  next?: Pick;
  also: Pick[];
  hub?: { href: string; label: string };
}) {
  if (!next && also.length === 0 && !hub) return null;
  return (
    <section aria-labelledby="next-steps" className="mt-14 border-t border-[var(--border)] pt-8">
      <h2 id="next-steps" className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
        Where to go next
      </h2>

      {next && (
        <Link
          href={`/guides/${next.guide.slug}`}
          className="group mt-4 block rounded-[var(--radius-lg)] border border-[var(--area)] bg-[var(--area-soft)] p-5 transition-opacity hover:opacity-90"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--area)]">If this is where you are</span>
          <span className="mt-1.5 flex items-center gap-2 text-[17px] font-semibold leading-snug text-[var(--text)]">
            {next.guide.title}
            <ArrowRight size={15} aria-hidden className="shrink-0 text-[var(--area)]" />
          </span>
          <span className="mt-1.5 block text-[14.5px] leading-relaxed text-[var(--muted)]">{next.reason}</span>
        </Link>
      )}

      {also.length > 0 && (
        <ul className="mt-5 flex flex-col gap-4">
          {also.map((pick) => (
            <li key={pick.guide.slug}>
              <Link href={`/guides/${pick.guide.slug}`} className="text-[15.5px] font-semibold leading-snug text-[var(--area)] hover:underline">
                {pick.guide.title}
              </Link>
              <p className="mt-1 text-[14px] leading-relaxed text-[var(--muted)]">{pick.reason}</p>
            </li>
          ))}
        </ul>
      )}

      {hub && (
        <Link href={hub.href} className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--area)] hover:underline">
          {hub.label}
          <ArrowRight size={14} aria-hidden />
        </Link>
      )}
    </section>
  );
}
