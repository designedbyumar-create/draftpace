import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/design-system/Container";
import { GUIDES } from "@/content/guides";

export const metadata: Metadata = {
  title: "Guides",
  description: "Practical, specific writing on getting organized, planning, and following through.",
};

export default function GuidesIndexPage() {
  return (
    <Container width="narrow" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Guides</p>
      <h1 className="mt-3 font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        Practical writing, not general advice.
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
        Specific situations, written by people who think about this problem space for a living.
      </p>

      <div className="mt-12 flex flex-col divide-y divide-[var(--border)]">
        {GUIDES.map((guide) => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group py-7 first:pt-0">
            <p className="text-[12px] text-[var(--faint)]">
              {new Date(guide.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })} ·{" "}
              {guide.readingTime}
            </p>
            <h2 className="mt-1.5 text-[19px] font-semibold text-[var(--text)] group-hover:text-[var(--primary)]">
              {guide.title}
            </h2>
            <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-[var(--muted)]">{guide.dek}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
