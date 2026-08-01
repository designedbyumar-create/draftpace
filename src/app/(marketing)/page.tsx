import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/design-system/Button";
import Container from "@/design-system/Container";
import { ArrowRight } from "@/design-system/Icon";
import MessyToClearHero from "@/components/public/home/MessyToClearHero";
import RecognitionSection from "@/components/public/home/RecognitionSection";
import ProblemChooser from "@/components/public/home/ProblemChooser";
import ClearNextStepSection from "@/components/public/home/ClearNextStepSection";
import SetupSection from "@/components/public/home/SetupSection";
import ContinuityStory from "@/components/public/home/ContinuityStory";
import AdaptationSection from "@/components/public/home/AdaptationSection";
import RecoverySection from "@/components/public/home/RecoverySection";
import ShopPreview from "@/components/public/home/ShopPreview";
import TrustSection from "@/components/public/home/TrustSection";

export const metadata: Metadata = {
  title: "Draftpace: Turn messy plans into clear next steps",
  description:
    "Draftpace helps you organize, plan, decide and follow through with guided tools built around your situation. Your work stays saved, so you can pick up where you left off instead of starting over.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:py-28">
          <div>
            <h1 className="font-serif text-[38px] font-semibold leading-[1.08] tracking-tight sm:text-[48px] lg:text-[56px]">
              Turn messy plans into clear next steps.
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-[var(--muted)]">
              Draftpace helps you organize, plan, decide and follow through with guided tools built around your
              situation. Your work stays saved, so you can pick up where you left off instead of starting over.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/help-with" size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
                Find help for what you're trying to do
              </Button>
              <Button href="/app/library" variant="secondary" size="lg">
                Open your library
              </Button>
            </div>
          </div>

          <MessyToClearHero />
        </Container>
      </section>

      {/* 2. Recognition */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <RecognitionSection />
        </Container>
      </section>

      {/* 3. Problem chooser */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Where to start</p>
          <h2 className="mt-3 max-w-xl font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
            What are you trying to make easier?
          </h2>
          <div className="mt-10">
            <ProblemChooser />
          </div>
        </Container>
      </section>

      {/* 4. Clear next step */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <ClearNextStepSection />
        </Container>
      </section>

      {/* 5. Setup */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <SetupSection />
        </Container>
      </section>

      {/* 6. Continuity */}
      <section className="border-b border-[var(--border)]">
        <Container width="narrow" className="py-16 sm:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Cloud state</p>
          <h2 className="mt-3 font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
            Pick up where you left off.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
            Your progress is saved to your account, not just one browser. Open the same work on your phone, your
            laptop, wherever you are next.
          </p>
          <div className="mt-10">
            <ContinuityStory />
          </div>
        </Container>
      </section>

      {/* 7. Adaptation */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <AdaptationSection />
        </Container>
      </section>

      {/* 8. Recovery */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <RecoverySection />
        </Container>
      </section>

      {/* 9. Shop preview */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Shop</p>
          <h2 className="mt-3 max-w-xl font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
            Find help for the thing you're trying to sort out.
          </h2>
          <div className="mt-10">
            <ShopPreview />
          </div>
        </Container>
      </section>

      {/* 10. Trust */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <TrustSection />
        </Container>
      </section>

      {/* 11. Closing */}
      <section>
        <Container width="wide" className="py-16 text-center sm:py-24">
          <h2 className="font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[36px]">
            What would feel easier with a clear next step?
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/help-with" size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
              Find something that helps
            </Button>
            <Link href="/login" className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
              Already using Draftpace? Sign in
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
