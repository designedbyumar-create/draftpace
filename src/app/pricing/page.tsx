"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ── Icons ─────────────────────────────────────────────────────────────────────

const BoltIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#4f46e5" stroke="#4338ca" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = ({ size = 11, color = "#6b7280" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

const ArrowRightIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const PlusIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const MinusIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14" />
  </svg>
);

// ── Data ──────────────────────────────────────────────────────────────────────

type BillingCycle = "monthly" | "yearly";

const plans = [
  {
    name: "Free",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    period: "forever",
    desc: "Taste the experience. No card ever.",
    cta: "Start for free",
    href: "/signup",
    popular: false,
    accent: "#6b7280",
    accentBg: "#f9fafb",
    accentBorder: "#e5e7eb",
    checkColor: "#6b7280",
    checkBg: "#f3f4f6",
    features: [
      "3 starter planners (Budget, Savings, Habits)",
      "Streak tracking & progress dashboard",
      "Mobile-friendly PWA",
      "Basic completion stats",
    ],
    notIncluded: [
      "Paid planner library",
      "Advanced analytics",
      "Streak shield",
    ],
  },
  {
    name: "À La Carte",
    monthlyPrice: "$7–$15",
    yearlyPrice: "$7–$15",
    period: "per planner",
    desc: "Buy what you need. Own it forever.",
    cta: "Browse planners",
    href: "/library",
    popular: false,
    accent: "#0d9488",
    accentBg: "#f0fdfa",
    accentBorder: "#99f6e4",
    checkColor: "#0d9488",
    checkBg: "#ccfbf1",
    features: [
      "One-time payment, lifetime access",
      "Every planner fully interactive & tracked",
      "All future updates included",
      "Stacks — buy more, own more",
      "No subscription ever required",
    ],
    notIncluded: [
      "Advanced analytics",
      "Streak shield",
      "Early access to new planners",
    ],
  },
  {
    name: "Membership",
    monthlyPrice: "$7",
    yearlyPrice: "$4.08",
    period: "/ month",
    yearlyTotal: "billed $49/yr — save 42%",
    desc: "Everything unlocked. Cancel anytime.",
    cta: "Unlock everything",
    href: "/signup?plan=membership",
    popular: true,
    accent: "#4f46e5",
    accentBg: "#eef2ff",
    accentBorder: "#c7d2fe",
    checkColor: "#4f46e5",
    checkBg: "#e0e7ff",
    features: [
      "All 200+ planners, instantly unlocked",
      "Every new planner on launch day",
      "Advanced analytics & insights",
      "Streak shield — never lose your streak",
      "Priority support",
      "Cancel anytime, keep completed work",
    ],
    notIncluded: [],
  },
];

const faqs = [
  {
    q: "What's the difference between À La Carte and Membership?",
    a: "À La Carte is a one-time purchase — you buy a specific planner and own it permanently. Membership is a subscription that unlocks everything at once. If you're likely to use 3 or more planners, membership works out cheaper.",
  },
  {
    q: "Do I lose access if I cancel my membership?",
    a: "You lose access to the full library, but any planners you purchased individually before or during your membership stay yours permanently. Your progress and data are always yours.",
  },
  {
    q: "Can I use Draftpace on my phone?",
    a: "Yes — Draftpace is a progressive web app (PWA). You can add it to your home screen on iOS or Android and it works offline for planners you've already opened.",
  },
  {
    q: "I bought a planner on Gumroad or Etsy — how do I access it here?",
    a: "After purchasing on Gumroad or Etsy, you'll receive an email with a redemption link that adds the planner to your Draftpace library. Takes about 30 seconds.",
  },
  {
    q: "Are there refunds?",
    a: "For individual planners — yes, within 7 days if you haven't used more than 10% of the planner. For memberships — yes, within 14 days of your first payment, no questions asked.",
  },
  {
    q: "What counts as a 'planner' — are eBooks and checklists included?",
    a: "Yes. The library includes planners, eBooks, checklists, and guides. All content types are included in the membership. Individual purchases apply per item regardless of type.",
  },
  {
    q: "Will my data be here in a year?",
    a: "Your data is stored securely and tied to your account, not your subscription status. Even free users keep their data indefinitely.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen" style={{ background: "#fafaf9" }}>

      {/* ── Hero ── */}
      <section className="px-6 pt-28 pb-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-7">
            <BoltIcon size={13} />
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
              Pricing
            </span>
          </div>

          <h1
            className="text-[52px] font-black leading-[1.02] text-gray-950 mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            Start free.
            <br />
            <span className="text-indigo-600">Own what you use.</span>
          </h1>

          <p className="text-[18px] text-gray-400 max-w-lg mx-auto leading-relaxed mb-10">
            No dark patterns. No forced upgrades. Use Draftpace free forever, buy planners one at a time, or unlock everything for less than a coffee a week.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-white border border-gray-200 rounded-2xl p-1 gap-1">
            {(["monthly", "yearly"] as BillingCycle[]).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBilling(cycle)}
                className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${
                  billing === cycle
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {cycle === "monthly" ? "Monthly" : "Yearly"}
                {cycle === "yearly" && (
                  <span className={`ml-2 text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    billing === "yearly" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    SAVE 42%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {plans.map((plan, i) => {
              const displayPrice = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
              const showYearlySub = billing === "yearly" && plan.yearlyTotal;

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="relative flex flex-col rounded-3xl p-8 border"
                  style={{
                    background: plan.popular ? plan.accentBg : "#ffffff",
                    borderColor: plan.popular ? plan.accentBorder : "#e5e7eb",
                  }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-indigo-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                        Most popular
                      </span>
                    </div>
                  )}

                  <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: plan.accent }}>
                    {plan.name}
                  </p>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={displayPrice}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-end gap-1.5 mb-0.5">
                        <span
                          className="text-[42px] font-black leading-none"
                          style={{ letterSpacing: "-0.04em", color: "#0f0f0f" }}
                        >
                          {displayPrice}
                        </span>
                        <span className="text-sm text-gray-400 mb-1">{plan.period}</span>
                      </div>
                      {showYearlySub && (
                        <p className="text-[11px] text-emerald-600 font-semibold mb-1">{plan.yearlyTotal}</p>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <p className="text-[13px] text-gray-400 mb-7 mt-1">{plan.desc}</p>

                  {/* Included features */}
                  <ul className="space-y-2.5 mb-4 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px] text-gray-700">
                        <div
                          className="rounded-full flex items-center justify-center shrink-0 mt-0.5 p-1"
                          style={{ background: plan.checkBg, minWidth: 18, minHeight: 18 }}
                        >
                          <CheckIcon size={10} color={plan.checkColor} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Not included */}
                  {plan.notIncluded.length > 0 && (
                    <ul className="space-y-2 mb-7">
                      {plan.notIncluded.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-[12px] text-gray-400 line-through">
                          <div className="rounded-full flex items-center justify-center shrink-0 mt-0.5 p-1" style={{ minWidth: 18, minHeight: 18, background: "#f3f4f6" }}>
                            <CheckIcon size={10} color="#d1d5db" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  {plan.notIncluded.length === 0 && <div className="mb-7" />}

                  <Link
                    href={plan.href}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-bold transition-all"
                    style={
                      plan.popular
                        ? { background: plan.accent, color: "#fff" }
                        : { background: "#f3f4f6", color: "#374151" }
                    }
                  >
                    {plan.cta}
                    <ArrowRightIcon size={13} />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Nudge */}
          <p className="text-center text-[13px] text-gray-400 mt-7">
            Bought 3+ planners individually?{" "}
            <span className="text-indigo-600 font-semibold">Membership already pays for itself.</span>
          </p>

          {/* Trust strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-[12px] text-gray-400">
            {["No credit card for free tier", "Cancel membership anytime", "Secure checkout via Stripe", "7-day planner refund policy"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckIcon size={11} color="#10b981" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 pb-28 border-t border-gray-100 pt-20">
        <div className="mx-auto max-w-2xl">

          <div className="text-center mb-12">
            <h2
              className="text-[34px] font-black text-gray-950 mb-3"
              style={{ letterSpacing: "-0.03em" }}
            >
              Questions answered.
            </h2>
            <p className="text-[15px] text-gray-400">
              Still unsure? Email us at{" "}
              <a href="mailto:hello@draftpace.com" className="text-indigo-600 font-semibold hover:underline">
                hello@draftpace.com
              </a>
            </p>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="text-[14px] font-bold text-gray-900 pr-4">{faq.q}</span>
                    <div
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      style={{ background: isOpen ? "#eef2ff" : "#f3f4f6" }}
                    >
                      {isOpen
                        ? <MinusIcon size={14} />
                        : <PlusIcon size={14} />
                      }
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <p className="px-6 pb-5 text-[14px] text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </main>
  );
}
