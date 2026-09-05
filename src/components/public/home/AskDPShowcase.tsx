"use client";

import Link from "next/link";
import { ArrowRight } from "@/design-system/Icon";
import AskDP from "@/components/public/help/AskDP";

/**
 * "No model, anywhere... it never guesses" is a claim two sections up on
 * this same page. A claim about not generating text is exactly the kind
 * of thing nobody should have to take on faith, so this puts the real
 * Ask DP widget here to let it get tested instead of just stated. Same
 * component /help-with runs, not a homepage-only mockup of it: whatever
 * it does here, including the honest "nothing here yet" when a question
 * misses, is the real product, not a demo standing in for it.
 */
export default function AskDPShowcase() {
  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">Ask DP</p>
        <h2 className="mt-4 font-serif text-[30px] font-semibold leading-[1.12] tracking-tight sm:text-[36px]">
          Don&rsquo;t take &ldquo;it never guesses&rdquo; on faith. Try it.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-[var(--muted)]">
          This is the real thing, not a mockup of it: a sourced question library, not a chat that composes an
          answer. Ask something real, or pick one below.
        </p>
      </div>

      <div className="relative mx-auto mt-12 max-w-2xl">
        {/* A soft glow behind the card, not a new color: --brand-ink-soft
            already exists in the token set for exactly this kind of
            highlight and nothing on the site was using it yet. Purely
            atmospheric, so it's aria-hidden and stays inert either side
            of the light/dark boundary since the token itself flips. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[calc(var(--radius-xl)+24px)] bg-[var(--brand-ink-soft)] blur-2xl"
        />

        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[shadow:var(--shadow-soft)] sm:p-7">
          <div className="mb-5 flex items-center justify-end">
            <Link
              href="/help-with/about-ask-dp"
              className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)] hover:text-[var(--text)]"
            >
              Learn more about this
            </Link>
          </div>

          <AskDP />
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/help-with"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline"
        >
          Browse the full library
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
