"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check, Lightning } from "@/components/ui/Icon";
import { MarketingButton } from "@/components/marketing/ui";

// ── Icons ─────────────────────────────────────────────────────────────────────

const BoltIcon = ({ size = 14 }: { size?: number }) => (
  <Lightning size={size} color="#3730A3" filled />
);

const CheckIcon = ({ size = 11, color = "#6b7280" }: { size?: number; color?: string }) => (
  <Check size={size} color={color} />
);

const ArrowRightIcon = ({ size = 15 }: { size?: number }) => (
  <ArrowRight size={size} />
);

// ── Data ──────────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Free",
    price: "$0",
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
      "3 starter planners included",
      "Streak & progress tracking",
      "Mobile-friendly dashboard",
    ],
  },
  {
    name: "À La Carte",
    price: "$7–$15",
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
      "Every planner fully interactive",
      "All future updates included",
    ],
  },
  {
    name: "Membership",
    price: "$7",
    period: "/ month",
    desc: "Everything unlocked. Cancel anytime.",
    cta: "Unlock everything",
    href: "/signup?plan=membership",
    popular: true,
    accent: "#3730A3",
    accentBg: "#eef2ff",
    accentBorder: "#c7d2fe",
    checkColor: "#3730A3",
    checkBg: "#e0e7ff",
    features: [
      "All 200+ planners, instantly",
      "Early access to new drops",
      "Advanced analytics + streak shield",
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function PricingPreview() {
  return (
    <section className="px-6 py-28 border-b border-gray-100" style={{ background: "#fafaf9" }}>
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6">
            <BoltIcon size={13} />
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
              Simple pricing
            </span>
          </div>
          <h2
            className="text-[42px] font-black leading-[1.05] text-gray-950 mb-5"
            style={{ letterSpacing: "-0.04em" }}
          >
            Start free.
            <span className="text-indigo-600"> Upgrade when ready.</span>
          </h2>
          <p className="text-[17px] text-gray-400 max-w-md mx-auto leading-relaxed">
            No dark patterns. Buy one planner or unlock everything — your call, your pace.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4 items-stretch mb-10">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative flex flex-col rounded-3xl p-7 border"
              style={{
                background: plan.popular ? plan.accentBg : "#ffffff",
                borderColor: plan.popular ? plan.accentBorder : "#e5e7eb",
              }}
            >
              {/* Popular pill */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[var(--marketing-primary)] text-white text-[11px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                    Most popular
                  </span>
                </div>
              )}

              {/* Plan name */}
              <p
                className="text-[10px] font-black uppercase tracking-widest mb-4"
                style={{ color: plan.accent }}
              >
                {plan.name}
              </p>

              {/* Price */}
              <div className="flex items-end gap-1.5 mb-1">
                <span
                  className="text-[40px] font-black leading-none"
                  style={{ letterSpacing: "-0.04em", color: "#0f0f0f" }}
                >
                  {plan.price}
                </span>
                <span className="text-sm text-gray-400 mb-1">{plan.period}</span>
              </div>

              <p className="text-[13px] text-gray-400 mb-6">{plan.desc}</p>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-gray-600">
                    <div
                      className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 p-1"
                      style={{ background: plan.checkBg }}
                    >
                      <CheckIcon size={10} color={plan.checkColor} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <MarketingButton
                href={plan.href}
                fullWidth
                variant={plan.popular ? "primary" : "secondary"}
                iconRight={<ArrowRightIcon size={13} />}
              >
                {plan.cta}
              </MarketingButton>
            </motion.div>
          ))}
        </div>

        {/* Nudge line */}
        <p className="text-center text-[13px] text-gray-400">
          Bought 3+ planners?{" "}
          <Link href="/pricing" className="text-indigo-600 font-semibold hover:underline">
            Membership pays for itself →
          </Link>
        </p>

        {/* Trust strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-[12px] text-gray-400">
          {["No credit card for free tier", "Cancel membership anytime", "Secure checkout via Stripe"].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckIcon size={11} color="#10b981" />
              {t}
            </div>
          ))}
        </div>

        {/* See full pricing CTA */}
        <div className="text-center mt-10">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-400 hover:text-gray-700 transition-colors"
          >
            See full pricing & FAQ
            <ArrowRightIcon size={12} />
          </Link>
        </div>

      </div>
    </section>
  );
}
