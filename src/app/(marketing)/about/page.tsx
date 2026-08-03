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
        We wanted the things we buy to stay alive.
      </h1>

      <div className="mt-10 flex flex-col gap-6 text-[15px] leading-relaxed text-[var(--text)]">
        <p>
          Draftpace started from a folder we all recognized: a budget spreadsheet, a course we meant to finish, a
          planner that looked perfect and did nothing once it was downloaded. Each one promised to change something,
          then went quiet, because a file cannot notice, remind, or adjust on its own.
        </p>
        <p>
          We did not want to make one more of those. Not a template you print, and not an app you rent and forget
          you are paying for. We wanted to buy something that behaves like it is on your side: it remembers you, it
          points you to the next thing, and it is still yours years later.
        </p>
        <p>
          So we started a studio to make exactly that. We call them living products. Each one is built around a
          single real problem and has its own world, and every one shares the same promise: it stays alive the whole
          time you own it, and you can leave and come back without losing anything or starting over.
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
