"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Flame, Lightning } from "@/components/ui/Icon";
import { marketingButtonClassName } from "@/components/marketing/ui";

const BoltIcon = ({ size = 16 }: { size?: number }) => (
  <Lightning size={size} color="#3730A3" filled />
);

const habits = [
  { label: "Morning pages — 5 min" },
  { label: "No-phone first 30 min" },
  { label: "10-min walk outside" },
];

function MiniPlanner() {
  const [checked, setChecked] = useState([true, false, false]);

  const toggle = (idx: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const done = checked.filter(Boolean).length;
  const pct = Math.round((done / habits.length) * 100);
  const streak = 3 + done;
  const streakDots = Array.from({ length: 7 }, (_, i) => i < streak);

  return (
    <div className="flex flex-col gap-3">

      {/* Planner card */}
      <div
        className="bg-white rounded-2xl p-5"
        style={{ border: "1px solid #e0e7ff" }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-black tracking-[-0.02em] text-gray-900">
            Habit Builder — Week 1
          </p>
          <p className="text-[13px] font-black" style={{ color: "#3730A3" }}>
            {pct}%
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "#eef2ff" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "#3730A3" }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Habit items */}
        <div className="flex flex-col gap-2">
          {habits.map((habit, idx) => (
            <button
              key={habit.label}
              onClick={() => toggle(idx)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all w-full"
              style={{
                background: "#fafaf9",
                border: `1px solid ${checked[idx] ? "#c7d2fe" : "#f0f0ee"}`,
              }}
            >
              {/* Checkbox */}
              <div
                className="w-4 h-4 rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all duration-150"
                style={{
                  background: checked[idx] ? "#3730A3" : "transparent",
                  border: `1.5px solid ${checked[idx] ? "#3730A3" : "#c7d2fe"}`,
                }}
              >
                {checked[idx] && (
                  <Check size={8} color="white" />
                )}
              </div>

              {/* Label */}
              <span
                className="text-[11px] font-medium flex-1 transition-all duration-200"
                style={{
                  color: checked[idx] ? "#c7d2fe" : "#374151",
                  textDecoration: checked[idx] ? "line-through" : "none",
                }}
              >
                {habit.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Streak row */}
      <div
        className="flex items-center justify-between rounded-2xl px-4 py-3"
        style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
      >
        <div className="flex items-center gap-2.5">
          <Flame size={16} color="#f97316" filled />
          <div>
            <motion.p
              key={streak}
              initial={{ scale: 1.2, color: "#c2410c" }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-black leading-none tracking-[-0.04em]"
              style={{ color: "#c2410c" }}
            >
              {streak}
            </motion.p>
            <p className="text-[10px] font-semibold" style={{ color: "#f97316" }}>
              day streak
            </p>
          </div>
        </div>

        {/* Streak dots */}
        <div className="flex gap-1">
          {streakDots.map((active, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-sm transition-all duration-300"
              style={{
                background: active ? "#f97316" : i < 5 ? "#fed7aa" : "#f0f0ee",
              }}
            />
          ))}
        </div>
      </div>

      {/* Nudge */}
      <p className="text-center text-[10px] text-gray-400 font-medium">
        Try it — check off a habit above ↑
      </p>
    </div>
  );
}

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="bg-[#fafaf9] px-6 py-28 border-b border-gray-100">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white border border-gray-100 rounded-3xl overflow-hidden grid lg:grid-cols-2"
        >

          {/* Left — copy + CTAs */}
          <div
            className="flex flex-col justify-center px-10 py-14 border-b lg:border-b-0 lg:border-r border-gray-100"
          >
            {/* Pill */}
            <div className="mb-5 inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full w-fit">
              <BoltIcon size={13} />
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
                Free to start
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-[40px] font-black tracking-[-0.04em] text-gray-950 leading-[1.05] mb-4">
              Your planner deserves
              better than a{" "}
              <span className="text-indigo-600">downloads folder.</span>
            </h2>

            {/* Sub */}
            <p className="text-[15px] text-gray-400 leading-relaxed mb-8 max-w-sm">
              Pick a planner, check things off, build a streak. The interactive
              version is free — no credit card, no friction.
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/signup")}
                className={marketingButtonClassName({
                  size: "lg",
                  fullWidth: true,
                  className: "font-bold",
                })}
              >
                Claim free access
                <ArrowRight size={14} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/pricing")}
                className={marketingButtonClassName({
                  variant: "secondary",
                  size: "lg",
                  fullWidth: true,
                  className: "font-semibold",
                })}
              >
                See pricing →
              </motion.button>
            </div>

            {/* Trust line */}
            <div className="flex items-center gap-2 mt-5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[11px] text-gray-400">
                No credit card for free planners · cancel membership anytime
              </span>
            </div>
          </div>

          {/* Right — live mini planner */}
          <div className="bg-[#fafaf9] px-8 py-10 flex items-center">
            <div className="w-full">
              <MiniPlanner />
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
