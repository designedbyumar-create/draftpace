import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/design-system/Button";
import Container from "@/design-system/Container";
import { ArrowRight } from "@/design-system/Icon";
import LivingProductHero from "@/components/public/home/LivingProductHero";
import TheGraveyard from "@/components/public/home/TheGraveyard";
import LivingAnatomy from "@/components/public/home/LivingAnatomy";
import LivingSpectrum from "@/components/public/home/LivingSpectrum";
import ShopPreview from "@/components/public/home/ShopPreview";
import TrustSection from "@/components/public/home/TrustSection";

export const metadata: Metadata = {
  title: "A studio for living products",
  description:
    "Draftpace is a studio making living products: installable apps that remember you, guide your next move, and stay yours to keep, instead of dying on download like a file.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:py-28">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Products that keep up with you</p>
            <h1 className="mt-4 font-serif text-[38px] font-semibold leading-[1.08] tracking-tight sm:text-[48px] lg:text-[56px]">
              A studio for living products.
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-[var(--muted)]">
              Most things you buy online die on download: a PDF, a template, a file you open once and forget. We make
              the opposite. Every Draftpace product is a living app that remembers you, guides your next move, and is
              yours to keep.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/shop" size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
                See what we&rsquo;ve made
              </Button>
              <Button href="/app/library" variant="secondary" size="lg">
                Open your library
              </Button>
            </div>
          </div>

          <LivingProductHero />
        </Container>
      </section>

      {/* 2. The graveyard */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <TheGraveyard />
        </Container>
      </section>

      {/* 3. What makes a product alive */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">What alive means</p>
          <h2 className="mt-3 max-w-2xl font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
            A living product does five things a file never will.
          </h2>
          <div className="mt-10">
            <LivingAnatomy />
          </div>
        </Container>
      </section>

      {/* 4. Living is a spectrum */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Not all the same</p>
          <h2 className="mt-3 max-w-2xl font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
            Living does not mean needy.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
            Some products should check in daily. Others should stay silent until you need them. Every Draftpace
            product sits somewhere on this range, and each point on it is still alive.
          </p>
          <div className="mt-10">
            <LivingSpectrum />
          </div>
        </Container>
      </section>

      {/* 5. The shelf */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">The shelf</p>
          <h2 className="mt-3 max-w-2xl font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
            One studio. One curated shelf.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
            We make every product ourselves, so the shelf stays small and every piece on it earns its place.
          </p>
          <div className="mt-10">
            <ShopPreview />
          </div>
        </Container>
      </section>

      {/* 6. Owned, not rented */}
      <section className="border-b border-[var(--border)]">
        <Container width="narrow" className="py-16 text-center sm:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Owned, not rented</p>
          <h2 className="mt-3 font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
            You own it. It does not expire, and it does not watch you.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
            A Draftpace product is yours to keep and open whenever you want. No feed, no ads, nothing sold about you.
            It works on your side, quietly.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {["Yours to keep", "Works offline", "No ads, no data resale"].map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[13px] font-semibold text-[var(--text)] shadow-[var(--shadow-xs)]"
              >
                {chip}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* 7. Trust */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <TrustSection />
        </Container>
      </section>

      {/* 11. Closing */}
      <section>
        <Container width="wide" className="py-16 text-center sm:py-24">
          <h2 className="font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[36px]">
            Everything in the studio is alive, premium, and yours.
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/shop" size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
              See what we&rsquo;ve made
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
