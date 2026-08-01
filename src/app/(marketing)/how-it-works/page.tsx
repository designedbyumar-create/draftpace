import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/design-system/Container";
import Button from "@/design-system/Button";
import { ArrowRight } from "@/design-system/Icon";

export const metadata: Metadata = {
  title: "How it works",
  description: "What actually happens when you start using a Draftpace tool, from setup to the times you come back.",
};

const STEPS = [
  {
    number: "01",
    title: "You start with your situation, not a blank page",
    body: "Setup asks a few questions that actually change what happens next. Rough answers are fine. Anything you're not sure about, you skip, and it stays out of your way instead of blocking you.",
  },
  {
    number: "02",
    title: "You get something useful before you've done much",
    body: "The point of setup is to reach a real, specific result quickly, not to fill out a long form. You should be able to look at the result and understand where it came from.",
  },
  {
    number: "03",
    title: "Everything saves as you go",
    body: "You don't need to remember to save. If you're offline for a moment, your changes wait and sync once you're back, and you can always tell whether something is saved to your account or just sitting on your device.",
  },
  {
    number: "04",
    title: "You come back when it's convenient, not on a schedule",
    body: "Open it again on a different device and it picks up exactly where you left it. No summary to reread first. Just what changed and what's next.",
  },
  {
    number: "05",
    title: "You update what changed, not the whole plan",
    body: "When a detail shifts, a date moves, a decision gets made, you update that one thing. The parts of the plan connected to it adjust. The parts that aren't connected stay exactly as they were.",
  },
  {
    number: "06",
    title: "If you step away for a while, coming back is easy",
    body: "There's no penalty screen, no broken streak, no wall of things marked overdue. You're asked what's changed since you were last here, and given one small step to restart with.",
  },
];

export default function HowItWorksPage() {
  return (
    <Container width="narrow" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">How it works</p>
      <h1 className="mt-3 font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        What actually happens when you use Draftpace.
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
        Not a features list. This is the sequence, in order, from the first time you open something to the fifth
        time you come back to it.
      </p>

      <div className="mt-14 flex flex-col divide-y divide-[var(--border)]">
        {STEPS.map((step) => (
          <div key={step.number} className="grid gap-2 py-8 first:pt-0 sm:grid-cols-[64px_1fr] sm:gap-6">
            <span className="font-serif text-[26px] font-semibold text-[var(--faint)]">{step.number}</span>
            <div>
              <h2 className="text-[16px] font-semibold text-[var(--text)]">{step.title}</h2>
              <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[var(--muted)]">{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 border-t border-[var(--border)] pt-10">
        <h2 className="text-[16px] font-semibold text-[var(--text)]">A note on what's true today</h2>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          This describes how the platform works. The first guided tools built on it are still in progress, so this
          page describes the mechanics you'll get, not a specific tool you can use yet. When one is ready, it'll be
          in the{" "}
          <Link href="/shop" className="font-semibold text-[var(--primary)] hover:underline">
            Shop
          </Link>
          .
        </p>
      </div>

      <div className="mt-10">
        <Button href="/signup" size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
          Create an account
        </Button>
      </div>
    </Container>
  );
}
