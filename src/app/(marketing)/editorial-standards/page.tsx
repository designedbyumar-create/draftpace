import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/design-system/Container";

export const metadata: Metadata = {
  title: "Editorial standards",
  description: "How Draftpace writes, checks, dates and corrects its free guides, and what they are not.",
  alternates: { canonical: "/editorial-standards" },
};

const SECTIONS = [
  {
    title: "Who writes the guides",
    body: "Draftpace does. Each guide is written for a specific problem someone types into a search box, then checked against the current rules and official pages it relies on. We are a software publisher. We are not a law firm, a clinic, a financial adviser or a school district, and no guide claims to be one.",
  },
  {
    title: "What we check",
    body: "Anything a guide states as a rule, a number, a deadline or a form is checked against the official source. Where a guide rests on one, the source is listed at the foot of the page with the date it was last checked. Where a rule differs by state or country, the guide says so instead of guessing, and the UK guides are written separately from the US ones.",
  },
  {
    title: "What we do not do",
    body: "We do not invent customers, quotes, results or statistics. We do not give medical, legal, tax or investment advice. We do not publish a guide for the sake of a keyword: if a page cannot help someone finish the task, it should not exist.",
  },
  {
    title: "Dates",
    body: "Every guide shows when it was published and when it was last updated. The updated date changes when the content changes, not when we touch the page.",
  },
  {
    title: "The commercial fact",
    body: "Guides are free and written to be useful on their own. Draftpace also sells Companions, which are the products these guides eventually point to. When a guide mentions one, it is because it fits the task, and the guide says what to do without it too.",
  },
  {
    title: "Corrections",
    body: "If something is wrong, out of date or unclear, tell us. We correct the guide, change its updated date, and do not quietly leave the old version standing.",
  },
];

export default function EditorialStandardsPage() {
  return (
    <Container width="narrow" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">Editorial standards</p>
      <h1 className="mt-3 font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        How the free guides are written, checked and corrected.
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
        The{" "}
        <Link href="/guides" className="font-semibold text-[var(--primary)] hover:underline">
          guides
        </Link>{" "}
        cover hard life admin. This page says what stands behind them and what does not.
      </p>

      <div className="mt-12 flex flex-col divide-y divide-[var(--border)]">
        {SECTIONS.map((section) => (
          <div key={section.title} className="py-6 first:pt-0">
            <h2 className="text-[16px] font-semibold text-[var(--text)]">{section.title}</h2>
            <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[var(--muted)]">{section.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-[13px] text-[var(--muted)]">
        Corrections and questions:{" "}
        <a href="mailto:support@draftpace.com" className="font-semibold text-[var(--primary)] hover:underline">
          support@draftpace.com
        </a>
      </p>
    </Container>
  );
}
