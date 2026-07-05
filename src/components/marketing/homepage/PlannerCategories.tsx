"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Barbell, BookOpen, CalendarCheck, Check, Clock, Flower, Heart, Lightning } from "@/components/ui/Icon";

const BoltIcon = ({ size = 16 }: { size?: number }) => (
  <Lightning size={size} color="#4f46e5" filled />
);

const RocketCursor = () => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
    <path
      d="M6 22L10.5 17.5M10.5 17.5C10.5 17.5 11.5 13 14.5 10C18 6.5 23 5 23 5C23 5 21.5 10 18 13.5C15 16.5 10.5 17.5 10.5 17.5Z"
      fill="#4f46e5"
      stroke="#fff"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16.5" cy="11.5" r="1.8" fill="#fff" stroke="#4338ca" strokeWidth="1" />
    <path
      d="M7 17.5C7 17.5 5.5 16 5 14C6.5 14.2 8 15.5 8.5 17L7 17.5Z"
      fill="#a5b4fc"
      stroke="#818cf8"
      strokeWidth="0.8"
    />
    <path
      d="M10.5 21C10.5 21 12 22.5 14 23C13.8 21.5 12.5 20 11 19.5L10.5 21Z"
      fill="#a5b4fc"
      stroke="#818cf8"
      strokeWidth="0.8"
    />
  </svg>
);

const categories = [
  {
    id: "self-growth",
    title: "Self Growth",
    count: 48,
    isHero: true,
    bg: "#eef2ff",
    border: "#e0e7ff",
    accent: "#4f46e5",
    accentLight: "#c7d2fe",
    accentFaint: "#eef2ff",
    iconColor: "#4f46e5",
    countBg: "#fff",
    countBorder: "#c7d2fe",
    countText: "#4338ca",
    subText: "#818cf8",
    streakDots: [true, true, true, true, false, false, false] as boolean[],
    streakCount: 4,
    items: [
      { label: "Habit Systems", checked: true },
      { label: "Mindset Journals", checked: false },
      { label: "Reflection Workflows", checked: false },
    ],
    includes: [] as string[],
    progress: 0,
    icon: <Flower size={20} color="#4f46e5" />,
  },
  {
    id: "productivity",
    title: "Productivity",
    count: 52,
    isHero: false,
    bg: "#fffbeb",
    border: "#fde68a",
    accent: "#d97706",
    accentLight: "#fcd34d",
    accentFaint: "#fef3c7",
    iconColor: "#d97706",
    countBg: "#fef3c7",
    countBorder: "#fcd34d",
    countText: "#b45309",
    subText: "#f59e0b",
    streakDots: [] as boolean[],
    streakCount: 0,
    items: [],
    includes: ["Deep Work Systems", "Weekly Planning", "Focus Sessions"],
    progress: 72,
    icon: <CalendarCheck size={18} color="#d97706" />,
  },
  {
    id: "fitness",
    title: "Fitness & Health",
    count: 36,
    isHero: false,
    bg: "#ecfdf5",
    border: "#a7f3d0",
    accent: "#059669",
    accentLight: "#6ee7b7",
    accentFaint: "#d1fae5",
    iconColor: "#059669",
    countBg: "#d1fae5",
    countBorder: "#6ee7b7",
    countText: "#065f46",
    subText: "#10b981",
    streakDots: [] as boolean[],
    streakCount: 0,
    items: [],
    includes: ["Workout Trackers", "Meal Planning", "Progress Systems"],
    progress: 45,
    icon: <Barbell size={18} color="#059669" />,
  },
  {
    id: "mental-wellness",
    title: "Mental Wellness",
    count: 27,
    isHero: false,
    bg: "#fff1f2",
    border: "#fecdd3",
    accent: "#e11d48",
    accentLight: "#fda4af",
    accentFaint: "#ffe4e6",
    iconColor: "#e11d48",
    countBg: "#ffe4e6",
    countBorder: "#fda4af",
    countText: "#9f1239",
    subText: "#fb7185",
    streakDots: [] as boolean[],
    streakCount: 0,
    items: [],
    includes: ["Mood Tracking", "Stress Journaling", "Self Care"],
    progress: 30,
    icon: <Heart size={18} color="#e11d48" />,
  },
  {
    id: "learning",
    title: "Learning Systems",
    count: 41,
    isHero: false,
    bg: "#f5f3ff",
    border: "#ddd6fe",
    accent: "#7c3aed",
    accentLight: "#c4b5fd",
    accentFaint: "#ede9fe",
    iconColor: "#7c3aed",
    countBg: "#ede9fe",
    countBorder: "#c4b5fd",
    countText: "#5b21b6",
    subText: "#a78bfa",
    streakDots: [] as boolean[],
    streakCount: 0,
    items: [],
    includes: ["Reading Trackers", "Study Flow", "Knowledge Capture"],
    progress: 58,
    icon: <BookOpen size={18} color="#7c3aed" />,
  },
  {
    id: "lifestyle",
    title: "Lifestyle",
    count: 33,
    isHero: false,
    bg: "#ecfdf5",
    border: "#a7f3d0",
    accent: "#059669",
    accentLight: "#6ee7b7",
    accentFaint: "#d1fae5",
    iconColor: "#059669",
    countBg: "#d1fae5",
    countBorder: "#6ee7b7",
    countText: "#065f46",
    subText: "#6ee7b7",
    streakDots: [] as boolean[],
    streakCount: 0,
    items: [],
    includes: ["Morning Routines", "Daily Planning", "Life Organization"],
    progress: 0,
    isWide: true,
    icon: <Clock size={18} color="#059669" />,
  },
];

export default function PlannerCategories() {
  const cardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [itemStates, setItemStates] = useState([true, false, false]);

  useEffect(() => {
    let cancelled = false;
    let loopTimer: ReturnType<typeof setTimeout>;

    const getBoxPos = (idx: number) => {
      const card = cardRef.current;
      if (!card) return { x: 0, y: 0 };
      const boxes = card.querySelectorAll<HTMLElement>("[data-checkbox]");
      const box = boxes[idx];
      if (!box) return { x: 0, y: 0 };
      const cardRect = card.getBoundingClientRect();
      const boxRect = box.getBoundingClientRect();
      return {
        x: boxRect.left - cardRect.left + boxRect.width / 2 - 13,
        y: boxRect.top - cardRect.top + boxRect.height / 2 - 13,
      };
    };

    const moveTo = (x: number, y: number, ms: number) =>
      new Promise<void>((res) => {
        const el = cursorRef.current;
        if (!el) return res();
        el.style.transition = `left ${ms}ms cubic-bezier(.4,0,.2,1), top ${ms}ms cubic-bezier(.4,0,.2,1)`;
        el.style.left = x + "px";
        el.style.top = y + "px";
        setTimeout(res, ms);
      });

    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const clickItem = (idx: number) =>
      new Promise<void>((res) => {
        const el = cursorRef.current;
        if (!el) return res();
        el.style.transform = "scale(0.75)";
        setTimeout(() => {
          if (!cancelled) {
            setItemStates((prev) => {
              const next = [...prev];
              next[idx] = !next[idx];
              return next;
            });
          }
          el.style.transform = "scale(1)";
          setTimeout(res, 280);
        }, 100);
      });

    const run = async () => {
      await wait(700);
      const sequence = [1, 2, 0, 1, 2, 0];
      for (const idx of sequence) {
        if (cancelled) return;
        const pos = getBoxPos(idx);
        await moveTo(pos.x - 40, pos.y - 8, 480);
        await wait(120);
        await moveTo(pos.x, pos.y, 300);
        await wait(360);
        await clickItem(idx);
        await wait(850);
      }
      if (!cancelled) loopTimer = setTimeout(run, 300);
    };

    loopTimer = setTimeout(run, 500);
    return () => {
      cancelled = true;
      clearTimeout(loopTimer);
    };
  }, []);

  const hero = categories[0];
  const smalls = categories.slice(1, 5);
  const wide = categories[5];

  return (
    <section className="bg-[#fafaf9] px-6 py-28 border-b border-gray-100">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <div className="mb-5 inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full">
            <BoltIcon size={13} />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
              Planner library
            </span>
          </div>
          <h2 className="text-[44px] font-black tracking-[-0.04em] text-gray-950 leading-[1.05] mb-4">
            Everything you need,
            <span className="block text-indigo-600">finally organized.</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            237 interactive systems across 6 life categories.
            Pick one, track it live, and actually finish it.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {/* ── HERO CARD ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            viewport={{ once: true }}
            className="relative flex flex-col justify-between rounded-3xl p-6 cursor-pointer overflow-hidden select-none md:row-span-2"
            style={{ background: hero.bg, border: `1px solid ${hero.border}` }}
          >
            <div ref={cardRef}>
              {/* Top row */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white">
                  {hero.icon}
                </div>
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{
                    background: hero.countBg,
                    color: hero.countText,
                    border: `1px solid ${hero.countBorder}`,
                  }}
                >
                  {hero.count} planners
                </span>
              </div>

              {/* Title */}
              <h3 className="text-[22px] font-black tracking-[-0.04em] leading-[1.05] mb-1 text-gray-950">
                {hero.title}
              </h3>
              <p className="text-xs font-semibold mb-4" style={{ color: hero.subText }}>
                Habits, mindset &amp; reflection systems
              </p>

              {/* Streak dots */}
              <div className="flex gap-1 mb-1">
                {hero.streakDots.map((active, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{
                      background: active
                        ? hero.accent
                        : i < 6
                        ? hero.accentLight
                        : "#e8e8e8",
                    }}
                  />
                ))}
              </div>
              <p className="text-[10px] font-bold mb-5" style={{ color: hero.accent }}>
                {hero.streakCount}-day streak
              </p>

              {/* Checklist items */}
              <div className="flex flex-col gap-2">
                {hero.items.map((item, idx) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 bg-white"
                    style={{ border: `1px solid ${hero.accentFaint}` }}
                  >
                    <div
                      className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{
                        background:
                          idx === 0
                            ? hero.accent
                            : idx === 1
                            ? hero.accentLight
                            : "#e0e7ff",
                      }}
                    />
                    <span
                      className="text-xs font-medium flex-1 transition-all duration-200"
                      style={{
                        color: itemStates[idx] ? hero.accentLight : "#374151",
                        textDecoration: itemStates[idx] ? "line-through" : "none",
                      }}
                    >
                      {item.label}
                    </span>
                    {/* Checkbox */}
                    <div
                      data-checkbox
                      className="w-[18px] h-[18px] rounded-[6px] flex items-center justify-center flex-shrink-0 transition-all duration-200"
                      style={{
                        background: itemStates[idx] ? hero.accent : "transparent",
                        border: `1.5px solid ${itemStates[idx] ? hero.accent : hero.accentLight}`,
                      }}
                    >
                      {itemStates[idx] && (
                        <Check size={10} color="white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              className="mt-5 self-start flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: hero.accent }}
            >
              Explore category
              <ArrowRight size={12} />
            </button>

            {/* Rocket cursor */}
            <div
              ref={cursorRef}
              className="absolute pointer-events-none z-50"
              style={{
                left: 20,
                top: 40,
                transition: "transform 0.15s ease",
                willChange: "left, top",
              }}
            >
              <RocketCursor />
            </div>
          </motion.div>

          {/* ── SMALL CARDS ── */}
          {smalls.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, delay: index * 0.07 }}
              viewport={{ once: true }}
              className="group rounded-3xl p-5 cursor-pointer"
              style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: cat.accentFaint }}
                >
                  {cat.icon}
                </div>
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: cat.countBg, color: cat.countText }}
                >
                  {cat.count}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-[15px] font-black tracking-[-0.03em] text-gray-900 mb-3">
                {cat.title}
              </h3>

              {/* Includes */}
              <div className="flex flex-col gap-1.5 mb-4">
                {cat.includes.map((item, i) => (
                  <div key={item} className="flex items-center gap-2 text-[11px] text-gray-500">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background:
                          i === 0
                            ? cat.accent
                            : i === 1
                            ? cat.accentLight
                            : cat.accentFaint,
                      }}
                    />
                    {item}
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: cat.accentFaint }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: cat.accent }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${cat.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.07, ease: "easeOut" }}
                  viewport={{ once: true }}
                />
              </div>
              <p className="text-[10px] font-semibold mt-1.5" style={{ color: cat.subText }}>
                {cat.progress}% of members active
              </p>
            </motion.div>
          ))}

          {/* ── WIDE LIFESTYLE CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -1, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, delay: 0.35 }}
            viewport={{ once: true }}
            className="col-span-full rounded-3xl px-6 py-5 cursor-pointer flex items-center justify-between gap-4"
            style={{ background: wide.bg, border: `1px solid ${wide.border}` }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: wide.accentFaint }}
              >
                {wide.icon}
              </div>
              <div>
                <h3 className="text-[15px] font-black tracking-[-0.03em] text-gray-900">
                  {wide.title}
                </h3>
                <p className="text-[11px]" style={{ color: wide.subText }}>
                  Morning routines, daily planning, life organization
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {wide.includes.map((tag) => (
                <span
                  key={tag}
                  className="hidden sm:block text-[11px] font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: wide.accentFaint, color: wide.countText }}
                >
                  {tag}
                </span>
              ))}
              <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                <ArrowRight size={13} color="#6b7280" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
