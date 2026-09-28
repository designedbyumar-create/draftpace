import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@/design-system/Icon";
import TextLink from "@/design-system/TextLink";
import type { Guide } from "@/content/guides";

type Pick = { guide: Guide; reason: string; thumb?: string };

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
      <h2 id="next-steps" className="text-eyebrow font-bold text-[var(--faint)]">
        Where to go next
      </h2>

      {next && (
        <Link
          href={`/guides/${next.guide.slug}`}
          className="group mt-4 flex gap-4 rounded-[var(--radius-lg)] border border-[var(--area)] bg-[var(--area-soft)] p-5 transition-opacity hover:opacity-90"
        >
          {next.thumb && (
            <Image src={next.thumb} alt="" width={800} height={600} sizes="150px" className="hidden h-[112px] w-[150px] shrink-0 rounded-lg sm:block" />
          )}
          <span className="min-w-0">
          <span className="text-eyebrow font-bold text-[var(--area)]">If this is where you are</span>
          <span className="mt-1.5 flex items-center gap-2 text-body-lg font-semibold leading-snug text-[var(--text)]">
            {next.guide.title}
            <ArrowRight size={15} aria-hidden className="shrink-0 text-[var(--area)]" />
          </span>
          <span className="mt-1.5 block text-body leading-relaxed text-[var(--muted)]">{next.reason}</span>
          </span>
        </Link>
      )}

      {also.length > 0 && (
        <ul className="mt-5 flex flex-col gap-4">
          {also.map((pick) => (
            <li key={pick.guide.slug}>
              {/* Not <TextLink>: this pairs the link with a separate reason
                  paragraph underneath it, not one line of "text with
                  somewhere to go", and TextLink hard-codes body-sm, which
                  would flatten a real recommendation to footer-link weight. */}
              <Link href={`/guides/${pick.guide.slug}`} className="text-body font-semibold leading-snug text-[var(--area)] hover:underline">
                {pick.guide.title}
              </Link>
              <p className="mt-1 text-body-sm leading-relaxed text-[var(--muted)]">{pick.reason}</p>
            </li>
          ))}
        </ul>
      )}

      {hub && (
        <TextLink href={hub.href} arrow className="mt-6">
          {hub.label}
        </TextLink>
      )}
    </section>
  );
}
