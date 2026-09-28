import type { Metadata } from "next";
import { ArrowRight } from "@/design-system/Icon";
import Button from "@/design-system/Button";
import Container from "@/design-system/Container";

export const metadata: Metadata = {
  title: "Careers",
  description: "Careers at Draftpace, a small team building the Companion Series.",
  alternates: { canonical: "/careers" },
};

const VALUES = [
  { label: "Small on purpose", body: "We're not optimizing for headcount. We're optimizing for impact per person." },
  { label: "Async by default", body: "Deep work matters. We don't fill calendars. We protect time." },
  { label: "Ship, then refine", body: "Real feedback beats internal debate. We get things in front of users fast." },
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Container width="narrow" className="pb-24 pt-28 text-center">
        <p className="text-eyebrow font-bold uppercase text-[var(--brand-ink)]">Careers</p>
        <h1 className="mt-4 text-display font-serif font-semibold tracking-tight">
          Small team, deliberate growth.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-body-lg leading-relaxed text-[var(--muted)]">
          We're building Draftpace with a tight, focused team. No open roles right now, but when we grow, it'll be
          deliberate.
        </p>
      </Container>

      <Container width="narrow" className="pb-24">
        <p className="mb-5 text-eyebrow font-bold uppercase text-[var(--faint)]">How we work</p>
        <div className="flex flex-col gap-3">
          {VALUES.map((value) => (
            <div key={value.label} className="rounded-xl border border-[var(--border)] p-5">
              <p className="text-body font-semibold text-[var(--text)]">{value.label}</p>
              <p className="mt-1.5 text-body-sm leading-relaxed text-[var(--muted)]">{value.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-6 text-center">
          <p className="text-body-sm font-semibold text-[var(--text)]">Think you'd fit?</p>
          <p className="mt-1 text-body-sm text-[var(--muted)]">
            We're not hiring right now, but we're always open to a conversation.
          </p>
          <Button href="mailto:team@draftpace.com" size="sm" iconRight={<ArrowRight size={13} aria-hidden />} className="mt-4">
            Say hello
          </Button>
        </div>
      </Container>
    </main>
  );
}
