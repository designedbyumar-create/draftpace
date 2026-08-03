import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/design-system/Container";
import Button from "@/design-system/Button";
import { ArrowRight } from "@/design-system/Icon";
import HowItWorksFlow from "@/components/public/how/HowItWorksFlow";

export const metadata: Metadata = {
  title: "How it works",
  description: "What it is like to own a living product, from the moment you buy it to the times you come back months later.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <Container width="wide" className="pb-24 pt-16 sm:pt-20">
      <div className="max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">How it works</p>
        <h1 className="mt-3 font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
          What it is like to own a living product.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Not a features list. This is the story of one product over time, from the moment you buy it to the times
          you come back months later. It plays on its own, or tap any step.
        </p>
      </div>

      <div className="mt-14">
        <HowItWorksFlow />
      </div>

      <div className="mt-16 border-t border-[var(--border)] pt-10">
        <h2 className="text-[16px] font-semibold text-[var(--text)]">A note on what is true today</h2>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[var(--muted)]">
          The example above uses Monthly Money Reset, the first product on the shelf. Every product behaves like
          this in its own way. When a new one is ready, it shows up in the{" "}
          <Link href="/shop" className="font-semibold text-[var(--primary)] hover:underline">
            store
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
