import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/design-system/Container";
import { ArrowRight } from "@/design-system/Icon";
import { NEEDS } from "@/content/needs";

export const metadata: Metadata = {
  title: "What do you need help with?",
  description: "Six common situations Draftpace helps with, and what actually helps in each one.",
};

export default function HelpWithIndexPage() {
  return (
    <Container width="wide" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Get help</p>
      <h1 className="mt-3 max-w-2xl font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        What do you need help with?
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
        Most situations fall into one of these. Pick the one that sounds closest to what you're dealing with.
      </p>

      <div className="mt-12 flex flex-col divide-y divide-[var(--border)]">
        {NEEDS.map((need) => (
          <Link
            key={need.slug}
            href={`/help-with/${need.slug}`}
            className="group flex flex-col gap-2 py-6 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          >
            <div className="max-w-xl">
              <p className="text-[18px] font-semibold text-[var(--text)]">{need.label}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--muted)]">{need.situation}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)]">
              See what helps
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </Container>
  );
}
