import type { Metadata } from "next";
import Container from "@/design-system/Container";

export const metadata: Metadata = {
  title: "Blog",
  description: "Ideas on personalized products, momentum, and building platforms that remember state.",
};

const TOPICS = [
  "How a platform is different from a template",
  "What makes a digital product remember you",
  "Designing recovery instead of streak guilt",
  "Building one shell for many product families",
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Container width="narrow" className="pb-20 pt-28 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Draftpace Blog</p>
        <h1 className="mt-4 font-serif text-[40px] font-semibold leading-[1.05] tracking-tight sm:text-[52px]">
          Ideas on products that remember you.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-[var(--muted)]">
          We're writing about what makes a product platform different from a static download. First article dropping
          soon.
        </p>
      </Container>

      <Container width="narrow" className="pb-24">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">What's coming</p>
        <div className="flex flex-col">
          {TOPICS.map((topic, index) => (
            <div key={topic} className="flex items-center gap-4 border-b border-[var(--border)] py-4 last:border-0">
              <span className="w-6 shrink-0 text-[11px] font-bold text-[var(--faint)]">0{index + 1}</span>
              <p className="flex-1 text-[14px] font-medium text-[var(--muted)]">{topic}</p>
              <span className="shrink-0 rounded-md bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-bold text-[var(--faint)]">
                Soon
              </span>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
