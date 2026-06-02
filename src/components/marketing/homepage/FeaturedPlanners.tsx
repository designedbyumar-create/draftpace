"use client";

import { BookOpen, Target, Flame, ArrowRight, Lock, Check } from "lucide-react";
import { motion } from "framer-motion";

const freePlanners = [
  {
    icon: BookOpen,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    tag: "FREE",
    tagStyle: "bg-emerald-50 text-emerald-700",
    name: "Monthly Budget Reset",
    desc: "Track income, expenses, and what's left. Reset every month with a clean slate.",
    progress: 68,
    progressColor: "#4f46e5",
    meta: "6 sections · 12 inputs · Auto-totals",
    cta: "Use now →",
    ctaStyle: "bg-indigo-600 text-white hover:bg-indigo-700",
  },
  {
    icon: Target,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    tag: "FREE",
    tagStyle: "bg-emerald-50 text-emerald-700",
    name: "Savings Goal Tracker",
    desc: "Set a savings target, log contributions, and watch your progress bar grow.",
    progress: 41,
    progressColor: "#0d9488",
    meta: "4 sections · Auto-calculates · Visual goal bar",
    cta: "Use now →",
    ctaStyle: "bg-teal-600 text-white hover:bg-teal-700",
  },
  {
    icon: Flame,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    tag: "FREE",
    tagStyle: "bg-emerald-50 text-emerald-700",
    name: "Habit Builder",
    desc: "Pick up to 5 habits. Check them off daily. Build a streak you don't want to break.",
    progress: 100,
    progressColor: "#059669",
    meta: "7-day grid · Streak counter · 5 habits",
    cta: "Use now →",
    ctaStyle: "bg-orange-500 text-white hover:bg-orange-600",
  },
];

const lockedPlanners = [
  "Debt Payoff Tracker",
  "Weekly Focus Planner",
  "Morning Routine Builder",
  "Reading Progress Tracker",
  "Net Worth Calculator",
  "Mindset Journal",
];

export default function FeaturedPlanners() {
  return (
    <section className="bg-slate-50 px-8 py-28 border-b border-gray-100">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-6 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full">
            <Check size={13} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">
              Free to start
            </span>
          </div>
          <h2 className="text-[44px] font-black tracking-[-0.03em] text-gray-950 leading-[1.05] mb-5">
            Three free planners.
            <span className="block text-indigo-600">Ready the moment you sign up.</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            No credit card. No trial. Just pick one and start — these three are yours forever.
          </p>
        </div>

        {/* Free planner cards */}
        <div className="grid gap-5 md:grid-cols-3 mb-8">
          {freePlanners.map((p, index) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-100 rounded-3xl p-7 flex flex-col hover:shadow-sm transition-all"
              >

                {/* Top row */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-11 h-11 rounded-2xl ${p.iconBg} flex items-center justify-center`}>
                    <Icon size={20} className={p.iconColor} />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${p.tagStyle}`}>
                    {p.tag}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-[18px] font-bold text-gray-900 mb-2">{p.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">{p.desc}</p>

                {/* Meta */}
                <p className="text-[11px] text-gray-400 font-medium mb-4">{p.meta}</p>

                {/* Progress */}
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-gray-400">Sample progress</span>
                  <span className="font-semibold" style={{ color: p.progressColor }}>
                    {p.progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full mb-6">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: p.progressColor }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${p.progress}%` }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                  />
                </div>

                {/* CTA */}
                <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold transition-all ${p.ctaStyle}`}>
                  {p.cta}
                </button>

              </motion.div>
            );
          })}
        </div>

        {/* Locked planners teaser */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-white border border-gray-100 rounded-3xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Member planners
              </p>
              <p className="text-lg font-bold text-gray-900">
                200+ more planners waiting for you
              </p>
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shrink-0">
              Unlock everything <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {lockedPlanners.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3"
              >
                <Lock size={13} className="text-gray-300 shrink-0" />
                <span className="text-sm text-gray-400 font-medium">{name}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-5">
            Unlock all for <strong className="text-gray-600">$7/month</strong> — cancel anytime
          </p>
        </motion.div>

      </div>
    </section>
  );
}