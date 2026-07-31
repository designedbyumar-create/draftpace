import type { Metadata } from "next";
import Button from "@/design-system/Button";
import Container from "@/design-system/Container";
import {
  ArrowRight,
  Bell,
  Check,
  Clock,
  Compass,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Target,
  User,
} from "@/design-system/Icon";
import { familyRegistry } from "@/product-framework/families";

export const metadata: Metadata = {
  title: "Draftpace — Digital products that remember you",
  description:
    "Draftpace is a platform for building and delivering personalized digital products — Companions, learning products, automation tools, guided programs, and trackers — that adapt, guide the next action, and pick up right where you left off.",
};

const CAPABILITIES = [
  {
    icon: Compass,
    title: "Tailored setup",
    body: "Every product starts from your real situation, not a generic template — with defaults you can edit and customize progressively.",
  },
  {
    icon: RotateCcw,
    title: "Memory",
    body: "Your progress lives in the cloud, not just one browser tab — leave on your phone, pick up on your laptop, exactly where you stopped.",
  },
  {
    icon: Target,
    title: "Direction",
    body: "Instead of a blank screen, you see one clear next action tied to where you actually are.",
  },
  {
    icon: Sparkles,
    title: "Momentum",
    body: "Progress is visible and specific to what the product is for — not a generic, meaningless streak counter.",
  },
  {
    icon: Shield,
    title: "Recovery",
    body: "Falling behind doesn't break anything. Coming back is a normal, designed part of the experience — not a failure screen.",
  },
  {
    icon: Star,
    title: "Identity",
    body: "Each product looks and speaks like what it's for. The platform is shared underneath; the experience on top is not generic.",
  },
];

const PRINCIPLES = [
  {
    title: "You own the relationship",
    body: "Your account is the lasting thing — not any single purchase channel. Access follows you.",
  },
  {
    title: "No punishment loops",
    body: "Missed days and stale plans become a recovery step, not a guilt trip or a broken streak.",
  },
  {
    title: "Clear about what's saved where",
    body: "We tell you plainly when something is saved on your device versus synced to your account.",
  },
  {
    title: "Sensitive by default",
    body: "Private details stay out of notifications, exports, and anything shareable unless you explicitly allow it.",
  },
];

export default function HomePage() {
  const families = familyRegistry.list();

  return (
    <>
      {/* Hero */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
              An extensible product platform
            </p>
            <h1 className="mt-5 font-serif text-[42px] font-semibold leading-[1.05] tracking-tight sm:text-[56px] lg:text-[64px]">
              Digital products that remember you.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[var(--muted)]">
              Draftpace is a platform for personalized, adaptive digital products — Companions, learning products,
              automation tools, guided programs, and trackers. Each one is purpose-built, but all of them share one
              account, one library, and one place that remembers where you left off.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/signup" size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
                Create an account
              </Button>
              <Button href="#platform" variant="secondary" size="lg">
                See how it works
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">What a product remembers</p>
            <ul className="mt-5 flex flex-col gap-4">
              {["Where you left off", "What you've already told it", "What to do next, specifically"].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
                    <Check size={12} aria-hidden />
                  </span>
                  <span className="text-[14px] leading-6 text-[var(--text)]">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-[var(--border)] pt-5 text-[12px] leading-5 text-[var(--faint)]">
              The platform is live. Individual products are in active development — your account and library are
              ready the moment they ship.
            </p>
          </div>
        </Container>
      </section>

      {/* Platform explanation */}
      <section id="platform" className="scroll-mt-16 border-b border-[var(--border)]">
        <Container width="wide" className="py-20 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
              What makes it a Draftpace product
            </p>
            <h2 className="mt-3 font-serif text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
              Not a static download. A product that adapts.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
              A PDF or a template can't remember you, adjust to what changed, or tell you what to do next. A
              Draftpace product can — and it looks and feels like its purpose, not like a recolored form.
            </p>
          </div>

          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                  <Icon size={17} aria-hidden />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-[var(--text)]">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-6 text-[var(--muted)]">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Product families */}
      <section id="families" className="scroll-mt-16 border-b border-[var(--border)]">
        <Container width="wide" className="py-20 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Product families</p>
            <h2 className="mt-3 font-serif text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
              One platform, several kinds of products.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
              Companions are one family — not the whole platform. The same shared foundation supports products that
              teach, automate, track, and help you decide.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {families.map((family) => (
              <div key={family.id} className="rounded-xl border border-[var(--border)] p-5">
                <p className="text-[14px] font-semibold text-[var(--text)]">{family.label}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">{family.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Shared platform capabilities */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                Shared platform, distinct products
              </p>
              <h2 className="mt-3 font-serif text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
                One account. One library. Every product.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
                Identity, ownership, cloud state, notifications, and the responsive app shell are built once and
                shared. Each product's workflow, terminology, and visual identity are not — that stays specific to
                what the product does.
              </p>
              <div className="mt-6">
                <Button href="/signup" iconRight={<ArrowRight size={15} aria-hidden />}>
                  Create your account
                </Button>
              </div>
            </div>

            <ul className="flex flex-col divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
              {[
                { icon: User, label: "One identity", body: "Sign in once — email or Google — for every product you own." },
                { icon: Sparkles, label: "One library", body: "Owned and free products live in a single place, not scattered across accounts." },
                { icon: Bell, label: "One notification system", body: "Reminders you control, per product, with quiet hours and channel preferences." },
                { icon: Clock, label: "Installed and responsive", body: "A real PWA shell designed for phone, tablet, and desktop — not a shrunk desktop site." },
              ].map(({ icon: Icon, label, body }) => (
                <li key={label} className="flex items-start gap-3 p-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--muted)]">
                    <Icon size={15} aria-hidden />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--text)]">{label}</p>
                    <p className="mt-0.5 text-[13px] leading-5 text-[var(--muted)]">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Trust and privacy */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-20 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Trust and privacy</p>
            <h2 className="mt-3 font-serif text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
              Principles we design against.
            </h2>
          </div>
          <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title}>
                <h3 className="text-[15px] font-semibold text-[var(--text)]">{principle.title}</h3>
                <p className="mt-1.5 text-[13px] leading-6 text-[var(--muted)]">{principle.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Account access CTA */}
      <section>
        <Container width="wide" className="py-20 text-center sm:py-24">
          <h2 className="font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
            Your account is ready before the first product ships.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
            Create an account now and it'll hold your preferences, your library, and every product you own or start —
            from day one.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/signup" size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
              Create an account
            </Button>
            <Button href="/login" variant="ghost" size="lg">
              Already have one? Log in
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
