import type { Metadata } from "next";
import Container from "@/design-system/Container";

export const metadata: Metadata = {
  title: "About",
  description: "Why Draftpace exists and how we build it.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <Container width="narrow" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">About</p>
      <h1 className="mt-3 font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        We got tired of rebuilding the same plan from scratch.
      </h1>

      <div className="mt-10 flex flex-col gap-6 text-[15px] leading-relaxed text-[var(--text)]">
        <p>
          Draftpace started from a specific frustration. Every time something got complicated, moving, planning an
          event, working through a decision, we'd cobble together a notes app, a spreadsheet, and a browser tab that
          stayed open for three weeks because closing it felt risky. It worked, barely, until life got busy and the
          whole thing fell apart. Picking it back up felt like more effort than starting over.
        </p>
        <p>
          We didn't want another productivity app that assumes you already have a system and just needs a nicer
          interface. We wanted something that starts from the actual situation you're in, remembers it, and tells
          you what to do next without a wall of overdue tasks waiting to make you feel behind.
        </p>
        <p>
          That's what we're building. Guided tools for specific, recognizable situations, not one general-purpose
          dashboard pretending to handle everything. Each one is built around the problem it solves. What they share
          is one account, one place your progress lives, and a consistent promise: you can leave and come back
          without losing anything or starting over.
        </p>
      </div>

      <div className="mt-14 border-t border-[var(--border)] pt-10">
        <h2 className="text-[16px] font-semibold text-[var(--text)]">How we work</h2>
        <div className="mt-4 flex flex-col gap-4">
          {[
            {
              title: "Small on purpose",
              body: "We're not optimizing for headcount. We're optimizing for the quality of what a small number of people can build carefully.",
            },
            {
              title: "Ship, then refine",
              body: "Real feedback from real use beats a long internal debate. We'd rather get something in front of people and adjust than perfect it in isolation.",
            },
            {
              title: "No punishment loops",
              body: "We don't use guilt, broken streaks, or urgency to keep you coming back. If something isn't useful to you anymore, that's fine.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-[var(--border)] p-5">
              <p className="text-[14px] font-semibold text-[var(--text)]">{item.title}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
