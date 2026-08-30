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
        Nothing we make will tell you that you are behind.
      </h1>

      <div className="mt-10 flex flex-col gap-6 text-[15px] leading-relaxed text-[var(--text)]">
        <p>
          Draftpace started from a folder we all recognise: a budget spreadsheet, a course we meant to finish, a
          planner that looked perfect and did nothing once it was downloaded. Each one promised to change something,
          then went quiet.
        </p>
        <p>
          What we found when we looked harder was that the file was not really the problem. The problem was that the
          hardest parts of adult life, money and houses and paperwork and the things nobody hands you a manual for,
          all require holding a great deal of connected detail in your head at exactly the moment you have least
          capacity for it. Every tool we tried answered that by asking us to hold more.
        </p>
        <p>
          So we build the opposite. Each Companion takes one of those areas and holds the state and the connections
          for you, works out what genuinely needs you now, and stays quiet when the honest answer is nothing. There
          is no streak in any of them, no completion percentage, and no screen that counts what you did not get to.
          That is not a feature we added. It is the reason the rest of it exists.
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
