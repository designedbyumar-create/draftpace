"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// ── Animation helper ──────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

// ── Shared grid bg ────────────────────────────────────────────────────────────
const GridBg = () => (
  <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
    backgroundImage: `linear-gradient(#e8e8e6 1px,transparent 1px),linear-gradient(90deg,#e8e8e6 1px,transparent 1px)`,
    backgroundSize: "44px 44px",
  }}/>
);

// ─────────────────────────────────────────────────────────────────────────────
// MOCKUP 1 — Progress planner card
// ─────────────────────────────────────────────────────────────────────────────
function ProgressMockup() {
  return (
    <div className="relative">
      {/* Floating badge — top left */}
      <motion.div {...fadeIn(0.4)}
        className="absolute -left-4 -top-4 z-10 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
        <span className="text-[12px] font-semibold text-gray-700">Live progress</span>
      </motion.div>

      {/* Main card */}
      <motion.div {...fadeUp(0.1)}
        className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="h-[3px] bg-indigo-500"/>
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">Planner</span>
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Opened today
            </span>
          </div>
          <h3 className="text-[18px] font-semibold text-gray-950 mb-3">Monthly Budget Reset</h3>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-orange-50 border border-orange-200 text-orange-600 mb-3">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#f97316"/></svg>
            14-day streak — your best run yet
          </div>
          <p className="text-[13px] text-gray-500 italic leading-relaxed mb-4">
            You're <strong className="not-italic font-semibold text-gray-800">past the halfway mark</strong> — most people quit by day 10. Don't stop now.
          </p>
          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-[12px] text-gray-400">Day 14 of 30</span>
              <span className="text-[22px] font-bold text-indigo-600">68%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-indigo-500"
                initial={{ width: 0 }} whileInView={{ width: "68%" }}
                viewport={{ once: true }} transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}/>
            </div>
          </div>
          <div className="flex gap-6 pt-4 border-t border-gray-100 mb-4">
            {[["$1,720","saved"],["3 goals","on track"],["$280","to target"]].map(([v,l]) => (
              <div key={l}>
                <p className="text-[14px] font-semibold text-gray-900 leading-none mb-0.5">{v}</p>
                <p className="text-[10px] text-gray-400">{l}</p>
              </div>
            ))}
          </div>
          <div className="bg-indigo-600 rounded-2xl py-3 text-center text-[13px] font-semibold text-white">
            Pick up where you left off →
          </div>
        </div>
      </motion.div>

      {/* Floating badge — bottom right */}
      <motion.div {...fadeIn(0.6)}
        className="absolute -right-4 -bottom-4 z-10 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-lg">
        <p className="text-[11px] text-gray-400 mb-1">7 completed</p>
        <div className="flex gap-1">
          {[1,1,1,1,1,1,1].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-sm bg-emerald-500"/>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCKUP 2 — Streak system
// ─────────────────────────────────────────────────────────────────────────────
function StreakMockup() {
  return (
    <div className="relative">
      {/* Main streak card */}
      <motion.div {...fadeUp(0.1)}
        className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="white"/>
            </svg>
          </div>
          <div>
            <p className="text-[28px] font-black text-gray-950 leading-none">14</p>
            <p className="text-[12px] font-semibold text-indigo-500">day streak</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[12px] text-gray-400">Best</p>
            <p className="text-[18px] font-bold text-gray-950">21 days</p>
          </div>
        </div>

        {/* Last 14 days grid */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Last 14 days</p>
        <div className="grid grid-cols-7 gap-1.5 mb-5">
          {[1,1,1,1,1,1,1,1,1,1,1,1,1,0].map((done, i) => (
            <div key={i} className={`h-8 rounded-lg flex items-center justify-center ${done ? "bg-indigo-600" : "bg-gray-100"}`}>
              {done ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"/>
              )}
            </div>
          ))}
        </div>

        {/* Motivational line */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
          <p className="text-[13px] font-semibold text-orange-800 mb-0.5">Don't break it today.</p>
          <p className="text-[12px] text-orange-600">7 more days to beat your personal best.</p>
        </div>

        {/* Mini habits */}
        <div className="space-y-2.5">
          {[
            { name:"Morning pages", days:[1,1,1,1,1,0,0], color:"#4f46e5" },
            { name:"No-spend day",  days:[1,0,1,1,0,0,0], color:"#0d9488" },
            { name:"Read 20 mins",  days:[1,1,1,1,1,0,0], color:"#7c3aed" },
          ].map(habit => (
            <div key={habit.name} className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-gray-600 w-24 shrink-0">{habit.name}</span>
              <div className="flex gap-1.5">
                {habit.days.map((d, i) => (
                  <div key={i} className="w-4 h-4 rounded-md" style={{ background: d ? habit.color : "#f3f4f6" }}/>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Milestone pill */}
      <motion.div {...fadeIn(0.5)}
        className="absolute -top-4 -right-4 z-10 bg-orange-500 rounded-2xl px-4 py-2.5 shadow-lg">
        <p className="text-[11px] font-bold text-white">🔥 New record incoming</p>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCKUP 3 — Purchases / integration
// ─────────────────────────────────────────────────────────────────────────────
function IntegrationMockup() {
  const items = [
    { title:"Monthly Budget Reset", source:"Gumroad", sourceBg:"#fff0f7", sourceColor:"#be185d", amount:"$12", status:"Active", statusBg:"#eef2ff", statusColor:"#4338ca", progress:68, barColor:"#4f46e5" },
    { title:"30-Day Habit Builder",  source:"Etsy",    sourceBg:"#fff7ed", sourceColor:"#c2410c", amount:"$8",  status:"Active", statusBg:"#eef2ff", statusColor:"#4338ca", progress:53, barColor:"#7c3aed" },
    { title:"Savings Goal Tracker",  source:"Gumroad", sourceBg:"#fff0f7", sourceColor:"#be185d", amount:"$9",  status:"Done",   statusBg:"#ecfdf5", statusColor:"#065f46", progress:100, barColor:"#059669" },
    { title:"Side Hustle Starter",   source:"Gumroad", sourceBg:"#fff0f7", sourceColor:"#be185d", amount:"$12", status:"Active", statusBg:"#eef2ff", statusColor:"#4338ca", progress:34, barColor:"#f59e0b" },
  ];

  return (
    <div className="relative">
      {/* Auto-sync badge */}
      <motion.div {...fadeIn(0.4)}
        className="absolute -top-4 -left-4 z-10 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"/>
        <span className="text-[12px] font-semibold text-gray-700">Auto-synced</span>
      </motion.div>

      <motion.div {...fadeUp(0.1)}
        className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h3 className="text-[16px] font-semibold text-gray-950 mb-1">Your purchases</h3>
          <p className="text-[12px] text-gray-400">4 items imported from Gumroad & Etsy</p>
        </div>

        {/* Connected sources */}
        <div className="px-6 py-3 flex items-center gap-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#ff90e8"/><text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#000">G</text></svg>
            Gumroad
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#f56400"/><text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">E</text></svg>
            Etsy
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
        </div>

        {/* Items */}
        <div className="divide-y divide-gray-50">
          {items.map((item, i) => (
            <motion.div key={item.title} {...fadeIn(i * 0.08 + 0.2)}
              className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
                      style={{ background:item.sourceBg, color:item.sourceColor, borderColor:item.sourceBg }}>
                      {item.source}
                    </span>
                    <span className="text-[10px] text-gray-400">{item.amount}</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0"
                  style={{ background:item.statusBg, color:item.statusColor, borderColor:item.statusBg }}>
                  {item.status}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background:item.barColor }}
                  initial={{ width:0 }} whileInView={{ width:`${item.progress}%` }}
                  viewport={{ once:true }} transition={{ duration:0.8, delay:i*0.1+0.3, ease:"easeOut" }}/>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BEFORE / AFTER SECTION
// ─────────────────────────────────────────────────────────────────────────────
function BeforeAfter() {
  const before = [
    "PDF sitting in Downloads, never opened again",
    "No idea what page you left off on",
    "Forgot you even bought it after a week",
    "5 planners purchased, 0 actually used",
    "No way to measure if you're improving",
    "New planner every month, same result",
  ];
  const after = [
    "Interactive dashboard, always within reach",
    "Picks up exactly where you stopped",
    "Daily streak reminds you before you forget",
    "3 active, 7 completed — real progress",
    "Heatmap of every day you showed up",
    "Same planners, completely different results",
  ];

  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-indigo-500"/>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">The transformation</span>
          </div>
          <h2 className="text-[36px] lg:text-[48px] font-black text-gray-950 tracking-[-0.03em] leading-none mb-4">
            Same planner.<br/>
            <span className="text-indigo-600">Completely different outcome.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Before */}
          <motion.div {...fadeUp(0.1)}
            className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"/>
                <div className="w-3 h-3 rounded-full bg-yellow-400"/>
                <div className="w-3 h-3 rounded-full bg-gray-300"/>
              </div>
              <span className="text-[12px] font-medium text-gray-400">Without Draftpace</span>
            </div>
            <div className="p-6 space-y-3">
              {before.map((item, i) => (
                <motion.div key={i} {...fadeIn(i * 0.06 + 0.2)}
                  className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </div>
                  <p className="text-[13px] text-gray-500 leading-snug">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* After */}
          <motion.div {...fadeUp(0.2)}
            className="bg-white border border-indigo-200 rounded-3xl overflow-hidden shadow-md"
            style={{ boxShadow:"0 0 0 1px rgba(99,102,241,0.1), 0 20px 40px rgba(99,102,241,0.08)" }}>
            <div className="px-6 py-4 border-b border-indigo-100 flex items-center gap-3 bg-indigo-50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-indigo-400"/>
                <div className="w-3 h-3 rounded-full bg-indigo-300"/>
                <div className="w-3 h-3 rounded-full bg-indigo-200"/>
              </div>
              <span className="text-[12px] font-semibold text-indigo-600">With Draftpace</span>
            </div>
            <div className="p-6 space-y-3">
              {after.map((item, i) => (
                <motion.div key={i} {...fadeIn(i * 0.06 + 0.3)}
                  className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <p className="text-[13px] text-gray-800 font-medium leading-snug">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE GRID
// ─────────────────────────────────────────────────────────────────────────────
const GRID_FEATURES = [
  {
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    color: "#4f46e5", bg: "#eef2ff",
    title: "All content types",
    desc: "Planners, checklists, ebooks, guides — every format works the same way.",
  },
  {
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    color: "#059669", bg: "#ecfdf5",
    title: "Secure & private",
    desc: "Your progress data is yours. We don't sell it, share it, or look at it.",
  },
  {
    icon: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
    color: "#f59e0b", bg: "#fff7ed",
    title: "Smart reminders",
    desc: "Notified when you're likely to forget — not every hour like a fitness app.",
  },
  {
    icon: "M22 12h-4l-3 9L9 3l-3 9H2",
    color: "#7c3aed", bg: "#fdf4ff",
    title: "Completion analytics",
    desc: "12-week heatmaps, monthly averages, and patterns you can actually use.",
  },
  {
    icon: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
    color: "#be185d", bg: "#fff0f7",
    title: "Gumroad & Etsy sync",
    desc: "Connect once. Every purchase auto-imports without you lifting a finger.",
  },
  {
    icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
    color: "#0d9488", bg: "#f0fdfa",
    title: "Native mobile feel",
    desc: "Bottom nav, swipeable cards, safe-area support. Feels like an app, not a website.",
  },
];

function FeatureGrid() {
  return (
    <section className="py-24 px-6 lg:px-8 bg-white border-y border-gray-100">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-gray-400"/>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Everything included</span>
          </div>
          <h2 className="text-[32px] lg:text-[40px] font-black text-gray-950 tracking-[-0.03em] leading-tight mb-3">
            No add-ons. No tiers.<br/>Everything works out of the box.
          </h2>
          <p className="text-[16px] text-gray-400 max-w-md mx-auto">
            One membership unlocks every feature for every planner, forever.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GRID_FEATURES.map((f, i) => (
            <motion.div key={f.title} {...fadeUp(i * 0.07)}
              className="bg-[#fafaf9] border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background:f.bg }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.icon}/>
                </svg>
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-[13px] text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function FeaturesPage() {
  return (
    <div className="bg-[#fafaf9] overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative pt-[100px] pb-20 px-6 lg:px-8 border-b border-gray-100">
        <GridBg/>
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div {...fadeUp()}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm mb-7">
            <div className="w-4 h-4 rounded-full bg-indigo-50 flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Features</span>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)}
            className="font-black text-gray-950 tracking-[-0.04em] mb-5"
            style={{ fontSize:"clamp(36px,6vw,64px)", lineHeight:1 }}>
            Everything your planner<br/>
            needs to <span className="text-indigo-600">actually work.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)}
            className="text-[17px] lg:text-[20px] text-gray-400 leading-relaxed max-w-2xl mx-auto mb-8">
            Not a PDF viewer. Not a note-taking app. A system built specifically around the way planners are meant to be used — daily, consistently, with something on the line.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/signup"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-2xl text-[15px] font-bold transition-all active:scale-[0.97]">
              Get started free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/pricing"
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-7 py-3.5 rounded-2xl text-[15px] font-semibold transition-all">
              See pricing
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div {...fadeIn(0.5)}
            className="flex items-center justify-center gap-8 mt-12 flex-wrap">
            {[
              ["2,400+", "planners started this week"],
              ["86%",    "avg completion rate"],
              ["14 days","avg streak length"],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-[24px] font-black text-gray-950 tracking-tight">{val}</p>
                <p className="text-[12px] text-gray-400">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURE 1: Progress ── */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div {...fadeUp()}
              className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full mb-5">
              <div className="w-2 h-2 rounded-full bg-indigo-500"/>
              <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest">Progress</span>
            </motion.div>
            <motion.h2 {...fadeUp(0.1)}
              className="text-[32px] lg:text-[40px] font-black text-gray-950 tracking-[-0.03em] leading-tight mb-5">
              Progress that actually <span className="text-indigo-600">means something.</span>
            </motion.h2>
            <motion.p {...fadeUp(0.2)}
              className="text-[16px] text-gray-400 leading-relaxed mb-6">
              Every planner becomes a live experience. Checkboxes check. Progress bars fill. Day 14 of 30 feels real when you can see it moving — not just a number on a PDF you haven't opened in two weeks.
            </motion.p>
            <motion.div {...fadeUp(0.3)} className="space-y-3">
              {[
                "Animated progress bars that fill as you work",
                "Personalised context — 'most people quit by day 10'",
                "Micro stats specific to each planner type",
                "Smart CTA changes based on where you are",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <p className="text-[13px] text-gray-600">{item}</p>
                </div>
              ))}
            </motion.div>
          </div>
          <ProgressMockup/>
        </div>
      </section>

      {/* ── FEATURE 2: Streaks ── */}
      <section className="py-24 px-6 lg:px-8 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="lg:order-2">
            <motion.div {...fadeUp()}
              className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full mb-5">
              <div className="w-2 h-2 rounded-full bg-orange-500"/>
              <span className="text-[11px] font-semibold text-orange-600 uppercase tracking-widest">Streaks</span>
            </motion.div>
            <motion.h2 {...fadeUp(0.1)}
              className="text-[32px] lg:text-[40px] font-black text-gray-950 tracking-[-0.03em] leading-tight mb-5">
              Streaks that keep <span className="text-orange-500">you honest.</span>
            </motion.h2>
            <motion.p {...fadeUp(0.2)}
              className="text-[16px] text-gray-400 leading-relaxed mb-6">
              Miss a day and you feel it. Hit 14 days and you want 15. The streak system is the reason people come back daily instead of forgetting they own the planner at all.
            </motion.p>
            <motion.div {...fadeUp(0.3)} className="space-y-3">
              {[
                "Daily streak with visual progress grid",
                "Personal best tracking — competes with yourself",
                "Habit tracker across all your active planners",
                "Motivational messages that change with your streak",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <p className="text-[13px] text-gray-600">{item}</p>
                </div>
              ))}
            </motion.div>
          </div>
          <div className="lg:order-1">
            <StreakMockup/>
          </div>
        </div>
      </section>

      {/* ── FEATURE 3: Integration ── */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div {...fadeUp()}
              className="inline-flex items-center gap-2 bg-pink-50 border border-pink-100 px-3 py-1.5 rounded-full mb-5">
              <div className="w-2 h-2 rounded-full bg-pink-500"/>
              <span className="text-[11px] font-semibold text-pink-600 uppercase tracking-widest">Integration</span>
            </motion.div>
            <motion.h2 {...fadeUp(0.1)}
              className="text-[32px] lg:text-[40px] font-black text-gray-950 tracking-[-0.03em] leading-tight mb-5">
              Everything you've bought.<br/><span className="text-pink-500">One place.</span>
            </motion.h2>
            <motion.p {...fadeUp(0.2)}
              className="text-[16px] text-gray-400 leading-relaxed mb-6">
              Connect Gumroad or Etsy once and every planner you've ever purchased appears automatically. No receipt hunting. No manual uploads. It's just there.
            </motion.p>
            <motion.div {...fadeUp(0.3)} className="space-y-3">
              {[
                "Gumroad & Etsy auto-import — connect once",
                "Manual add with order ID or purchase email",
                "Purchase history with price and date",
                "Instantly trackable after import",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <p className="text-[13px] text-gray-600">{item}</p>
                </div>
              ))}
            </motion.div>
          </div>
          <IntegrationMockup/>
        </div>
      </section>

      {/* ── FEATURE GRID ── */}
      <FeatureGrid/>

      {/* ── BEFORE / AFTER ── */}
      <BeforeAfter/>

      {/* ── FINAL CTA ── */}
      <section className="relative py-24 px-6 lg:px-8 border-t border-gray-100 overflow-hidden">
        <GridBg/>
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm mb-7">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#4f46e5"/>
              </svg>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Get started</span>
            </div>
            <h2 className="text-[36px] lg:text-[52px] font-black text-gray-950 tracking-[-0.04em] leading-none mb-5">
              Your first 3 planners<br/>
              are <span className="text-indigo-600">completely free.</span>
            </h2>
            <p className="text-[16px] text-gray-400 mb-8 max-w-lg mx-auto">
              No credit card. No commitment. Pick a planner, start today, and see the difference by day 7.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/signup"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-[15px] font-bold transition-all active:scale-[0.97] shadow-lg shadow-indigo-200">
                Start for free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link href="/pricing"
                className="text-[14px] font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                View pricing →
              </Link>
            </div>
            <p className="text-[12px] text-gray-400 mt-5">
              2,400+ people this week · No credit card · Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
