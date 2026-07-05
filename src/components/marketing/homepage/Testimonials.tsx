"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { CalendarCheck, Check, Clock, Flame, Lightning, Star, TrendingUp, User } from "@/components/ui/Icon";

const BoltIcon = ({ size = 16 }: { size?: number }) => (
  <Lightning size={size} color="#4f46e5" filled />
);

const StarIcon = () => (
  <Star size={12} color="#fbbf24" filled />
);

const featured = {
  name: "Sarah K.",
  role: "Finished Month 1 · 28-day streak",
  avatarBg: "#ede9fe",
  tag: "Monthly Budget Reset · Planner",
  tagBg: "#eef2ff",
  tagColor: "#4338ca",
  tagIcon: <CalendarCheck size={9} color="#4f46e5" />,
  text: "I've tried every budgeting app out there. Draftpace is the first one that actually made me look forward to checking my numbers. Finished my first full month — something I've never done before.",
  avatarIcon: <User size={20} color="#7c3aed" />,
};

const testimonials = [
  {
    name: "Ali M.",
    role: "Day 14 · still going",
    initials: "AM",
    avatarBg: "#fff7ed",
    avatarColor: "#c2410c",
    tag: "Habit Builder · 14-day streak",
    tagBg: "#fff7ed",
    tagColor: "#b45309",
    tagIcon: <Flame size={9} color="#f97316" filled />,
    text: "The streak system is no joke. I missed one day in week two and genuinely felt bad about it — in a good way. That's how you know it's working.",
  },
  {
    name: "Emma R.",
    role: "60% to goal · Month 3",
    initials: "ER",
    avatarBg: "#f0fdfa",
    avatarColor: "#0f766e",
    tag: "Savings Goal · $3,000 hit",
    tagBg: "#f0fdfa",
    tagColor: "#0f766e",
    tagIcon: <TrendingUp size={9} color="#0d9488" />,
    text: "Set a $5,000 goal in January. Hit $3,000 by March. Having the progress bar in front of me every day made it real instead of just a number I told myself.",
  },
  {
    name: "James T.",
    role: "Freelancer · Week 6",
    initials: "JT",
    avatarBg: "#eef2ff",
    avatarColor: "#4338ca",
    tag: "Focus Planner · Freelancer",
    tagBg: "#eef2ff",
    tagColor: "#4338ca",
    tagIcon: <CalendarCheck size={9} color="#4f46e5" />,
    text: "Draftpace replaced my chaotic sticky-note system completely. My output is up, my stress is down. It pays for itself.",
  },
  {
    name: "Priya S.",
    role: "Morning Routine · Day 21",
    initials: "PS",
    avatarBg: "#fff1f2",
    avatarColor: "#9f1239",
    tag: "Morning Routine · 21 days",
    tagBg: "#fff1f2",
    tagColor: "#9f1239",
    tagIcon: <Clock size={9} color="#e11d48" />,
    text: "I'm not a morning person. Was not a morning person. Three weeks in and I've got a routine that actually sticks. The planner made it feel like a game, not a chore.",
  },
];

const feedEvents = [
  { initials: "AM", bg: "#fff7ed", color: "#c2410c", pre: "Ali M. hit", bold: "day 14", post: "on Habit Builder",       badgeText: "Streak",    badgeBg: "#fff7ed", badgeColor: "#b45309", time: "2m ago" },
  { initials: "SK", bg: "#ede9fe", color: "#7c3aed", pre: "Sarah K.",   bold: "completed", post: "Monthly Budget Reset", badgeText: "Done",      badgeBg: "#f0fdf4", badgeColor: "#166534", time: "5m ago" },
  { initials: "ER", bg: "#f0fdfa", color: "#0f766e", pre: "Emma R. hit",bold: "$3,000",   post: "on Savings Goal",       badgeText: "Milestone", badgeBg: "#f0fdfa", badgeColor: "#0f766e", time: "8m ago" },
  { initials: "JT", bg: "#eef2ff", color: "#4338ca", pre: "James T.",   bold: "resumed",  post: "Annual Life Audit",     badgeText: "Back",      badgeBg: "#eef2ff", badgeColor: "#4338ca", time: "11m ago" },
  { initials: "PS", bg: "#fff1f2", color: "#9f1239", pre: "Priya S. hit",bold: "day 21",  post: "on Morning Routine",    badgeText: "Streak",    badgeBg: "#fff7ed", badgeColor: "#b45309", time: "14m ago" },
  { initials: "DW", bg: "#fefce8", color: "#854d0e", pre: "Daniel W.",  bold: "finished", post: "Atomic Habits eBook",   badgeText: "Done",      badgeBg: "#f0fdf4", badgeColor: "#166534", time: "17m ago" },
  { initials: "MN", bg: "#f5f3ff", color: "#5b21b6", pre: "Maya N.",    bold: "started",  post: "Deep Work Protocol",    badgeText: "New",       badgeBg: "#f5f3ff", badgeColor: "#5b21b6", time: "19m ago" },
  { initials: "RL", bg: "#ecfdf5", color: "#065f46", pre: "Ryan L. hit",bold: "86%",      post: "on Q4 Focus Planner",   badgeText: "Progress",  badgeBg: "#ecfdf5", badgeColor: "#065f46", time: "22m ago" },
];

function ActivityFeed() {
  const tickerRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    const totalWidth = ticker.scrollWidth / 2;
    let lastTime = 0;

    const step = (time: number) => {
      if (!lastTime) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;
      if (!isPaused.current) {
        posRef.current += (delta / 1000) * 60;
        if (posRef.current >= totalWidth) posRef.current -= totalWidth;
        ticker.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const doubled = [...feedEvents, ...feedEvents];

  return (
    <div
      className="bg-white border border-gray-100 rounded-3xl p-5 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] font-bold text-green-700">Live activity</span>
        </div>
        <span className="text-[11px] text-gray-400 font-medium">
          2,400+ people finishing things right now
        </span>
      </div>

      {/* Ticker */}
      <div
        className="overflow-hidden relative"
        onMouseEnter={() => { isPaused.current = true; }}
        onMouseLeave={() => { isPaused.current = false; }}
        style={{
          maskImage: "linear-gradient(to right, transparent, black 60px, black calc(100% - 60px), transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 60px, black calc(100% - 60px), transparent)",
        }}
      >
        <div
          ref={tickerRef}
          className="flex gap-2 will-change-transform"
          style={{ width: "max-content" }}
        >
          {doubled.map((e, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 flex-shrink-0"
              style={{ background: "#fafaf9", border: "1px solid #f0f0ee" }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black flex-shrink-0"
                style={{ background: e.bg, color: e.color }}
              >
                {e.initials}
              </div>
              <span className="text-[11px] text-gray-600 font-medium whitespace-nowrap">
                {e.pre}{" "}
                <strong className="text-gray-900 font-black">{e.bold}</strong>
                {" "}{e.post}
              </span>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-md flex-shrink-0"
                style={{ background: e.badgeBg, color: e.badgeColor }}
              >
                {e.badgeText}
              </span>
              <span className="text-[10px] text-gray-300 flex-shrink-0">{e.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="bg-[#fafaf9] px-6 py-28 border-b border-gray-100">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="mb-5 inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full">
            <BoltIcon size={13} />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
              Real results
            </span>
          </div>
          <h2 className="text-[44px] font-black tracking-[-0.04em] text-gray-950 leading-[1.05] mb-4">
            People are actually
            <span className="block text-indigo-600">staying consistent.</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-lg mx-auto leading-relaxed">
            Not reviews we wrote ourselves. Things real users said after finishing their first planner.
          </p>
        </motion.div>

        {/* Featured quote */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          className="relative bg-white border border-gray-100 rounded-3xl p-8 mb-4 overflow-hidden"
        >
          <span
            className="absolute top-4 right-6 text-[100px] leading-none font-black text-indigo-50 select-none pointer-events-none"
            style={{ fontFamily: "Georgia, serif" }}
          >
            "
          </span>

          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold mb-4"
            style={{ background: featured.tagBg, color: featured.tagColor }}
          >
            {featured.tagIcon}
            {featured.tag}
          </div>

          <div className="flex gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
          </div>

          <p className="text-[18px] font-medium text-gray-800 leading-relaxed mb-6 relative z-10 max-w-3xl">
            "{featured.text}"
          </p>

          <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: featured.avatarBg }}
            >
              {featured.avatarIcon}
            </div>
            <div>
              <p className="text-sm font-black tracking-[-0.02em] text-gray-900">{featured.name}</p>
              <p className="text-xs text-gray-400">{featured.role}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
              <Check size={9} color="#059669" />
              Completed
            </div>
          </div>
        </motion.div>

        {/* 2×2 grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-100 rounded-3xl p-6"
            >
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold mb-3"
                style={{ background: t.tagBg, color: t.tagColor }}
              >
                {t.tagIcon}
                {t.tag}
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
              </div>

              <p className="text-[13px] text-gray-600 leading-relaxed mb-5">
                "{t.text}"
              </p>

              <div className="flex items-center gap-2.5 pt-4 border-t border-gray-100">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                  style={{ background: t.avatarBg, color: t.avatarColor }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-[12px] font-black tracking-[-0.02em] text-gray-900">{t.name}</p>
                  <p className="text-[10px] text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <ActivityFeed />
        </motion.div>

      </div>
    </section>
  );
}
