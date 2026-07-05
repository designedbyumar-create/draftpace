"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Flame, HandWaving, Heart, TrendingUp } from "@/components/ui/Icon";

// ── Icons ─────────────────────────────────────────────────────────────────────

const Icon = ({ path, size = 16, color = "currentColor", fill = "none" }: {
  path: string; size?: number; color?: string; fill?: string;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path}/>
  </svg>
);

const ICONS = {
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  library:   "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  progress:  "M22 12h-4l-3 9L9 3l-3 9H2",
  purchases: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0",
  settings:  "M12 15a3 3 0 100-6 3 3 0 000 6z M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2M19 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
  bolt:      "M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z",
  home:      "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  arrow:     "M5 12h14M12 5l7 7-7 7",
  check:     "M20 6L9 17l-5-5",
  trend:     "M23 6L13.5 15.5 8.5 10.5 1 18 M17 6h6v6",
  user:      "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  trophy:    "M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0012 0V2z",
  pause:     "M10 4H6v16h4V4zM18 4h-4v16h4V4z",
};

const BoltFilled = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="white"/>
  </svg>
);

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "Active" | "Completed" | "Paused";

// ── Data ──────────────────────────────────────────────────────────────────────

const ACTIVE_ITEMS = [
  {
    id: "1", title: "Monthly Budget Reset", type: "Planner",
    typeColor: "#4338ca", typeBg: "#eef2ff", typeBorder: "#c7d2fe",
    progress: 68, barColor: "#4f46e5",
    meta: "Day 14 of 30", lastOpened: "today",
    streakBadge: "14-day streak — your best run yet",
    streakBg: "#fff7ed", streakColor: "#ea580c", streakBorder: "#fed7aa",
    context: "You're past the halfway mark — most people quit by day 10.",
    ctaLabel: "Pick up where you left off",
  },
  {
    id: "2", title: "30-Day Habit Builder", type: "Checklist",
    typeColor: "#6d28d9", typeBg: "#fdf4ff", typeBorder: "#ddd6fe",
    progress: 53, barColor: "#7c3aed",
    meta: "Day 16 of 30", lastOpened: "yesterday",
    streakBadge: "16 habits checked off",
    streakBg: "#fdf4ff", streakColor: "#6d28d9", streakBorder: "#ddd6fe",
    context: "Today's focus: Review last week's patterns.",
    ctaLabel: "Check in for today",
  },
  {
    id: "3", title: "Savings Goal — $5,000", type: "Guide",
    typeColor: "#0f766e", typeBg: "#f0fdfa", typeBorder: "#99f6e4",
    progress: 41, barColor: "#0d9488",
    meta: "$2,050 of $5,000", lastOpened: "2 days ago",
    streakBadge: "On pace — $416/week",
    streakBg: "#f0fdfa", streakColor: "#0f766e", streakBorder: "#99f6e4",
    context: "Week 6 of 12. At this rate you'll hit $5,000 by Jan 15th.",
    ctaLabel: "Log this week's contribution",
  },
];

const COMPLETED_ITEMS = [
  { title: "Q3 Life Audit",             date: "Sep 30", days: 18 },
  { title: "Morning Routine Checklist", date: "Oct 14", days: 7  },
  { title: "Side Hustle Starter",       date: "Nov 1",  days: 5  },
];

const PAUSED_ITEMS = [
  { title: "Annual Life Audit",     progress: 34, ago: "3 weeks ago" },
  { title: "Fitness Tracker — Nov", progress: 18, ago: "1 week ago"  },
];

const TAB_CFG: Record<Tab, { color: string; bg: string; border: string; text: string }> = {
  Active:    { color:"#4f46e5", bg:"#eef2ff", border:"#c7d2fe", text:"#4338ca" },
  Completed: { color:"#059669", bg:"#ecfdf5", border:"#bbf7d0", text:"#065f46" },
  Paused:    { color:"#f59e0b", bg:"#fef3c7", border:"#fde68a", text:"#92400e" },
};

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP PREVIEW
// ─────────────────────────────────────────────────────────────────────────────
function DesktopPreview() {
  const [activeTab, setActiveTab] = useState<Tab>("Active");

  return (
    <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white"
      style={{ boxShadow:"0 40px 80px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.03)" }}>

      {/* Browser chrome */}
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"/>
          <div className="w-3 h-3 rounded-full bg-amber-400"/>
          <div className="w-3 h-3 rounded-full bg-emerald-400"/>
        </div>
        <div className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-1.5 text-[11px] text-gray-400 font-medium max-w-xs mx-auto text-center">
          app.draftpace.com/dashboard
        </div>
      </div>

      <div className="flex" style={{ minHeight:"580px" }}>

        {/* Sidebar */}
        <aside className="w-[200px] border-r border-gray-100 flex flex-col py-5 px-3 shrink-0 bg-white">
          <div className="flex items-center gap-2 px-2 mb-6">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <BoltFilled size={12}/>
            </div>
            <div>
              <span className="text-[13px] font-bold text-gray-900 block leading-none">Draftpace</span>
              <span className="text-[9px] text-gray-400">Momentum OS</span>
            </div>
          </div>

          <nav className="flex flex-col gap-0.5 mb-4">
            {[
              { label:"Dashboard",  path:ICONS.dashboard, active:true  },
              { label:"My Library", path:ICONS.library,   active:false },
              { label:"Purchases",  path:ICONS.purchases, active:false },
              { label:"Progress",   path:ICONS.progress,  active:false },
              { label:"Settings",   path:ICONS.settings,  active:false },
            ].map(({ label, path, active }) => (
              <div key={label}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors ${active ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-500"}`}>
                <Icon path={path} size={14} color={active ? "#4f46e5" : "currentColor"}/>
                {label}
              </div>
            ))}
          </nav>

          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-1.5">Active now</p>
          {ACTIVE_ITEMS.map(item => (
            <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-gray-500">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:item.barColor }}/>
              <span className="truncate flex-1">{item.title}</span>
              <span className="text-[10px] font-semibold shrink-0" style={{ color:item.barColor }}>{item.progress}%</span>
            </div>
          ))}

          <div className="flex-1"/>

          <div className="flex items-center gap-2 px-2 pt-3 border-t border-gray-100 mt-3">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-indigo-700">JD</span>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-gray-900 truncate">Jamie D.</p>
              <p className="text-[10px] text-gray-400">Pro member</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 overflow-hidden bg-[#fafaf9]">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] mb-5">
            <span className="text-gray-400">Home</span>
            <span className="text-gray-300">›</span>
            <span className="text-gray-900 font-semibold">Dashboard</span>
          </div>

          {/* Greeting */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[11px] text-gray-400">Good morning</p>
              <h2 className="flex items-center gap-1.5 text-[22px] font-bold text-gray-950 leading-none tracking-tight">
                Jamie <HandWaving size={20} className="text-amber-500" />
              </h2>
              <p className="text-[12px] text-gray-400 mt-1">14 days straight. You're in the top 5% of finishers.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1">
                <Icon path={ICONS.bolt} size={9} color="#f97316" fill="#f97316"/>
                <span className="text-[10px] font-semibold text-orange-700">12-day streak</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                <Icon path={ICONS.trend} size={9} color="#059669"/>
                <span className="text-[10px] font-semibold text-emerald-700">86% this month</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2.5 mb-5">
            {[
              { label:"Streak",    value:"12",  sub:"days in a row", color:"#ea580c", bg:"#fff7ed", border:"#fed7aa", Icon: Flame },
              { label:"Active",    value:"3",   sub:"in progress",   color:"#4f46e5", bg:"#eef2ff", border:"#c7d2fe", Icon: TrendingUp },
              { label:"Completed", value:"7",   sub:"all time",      color:"#059669", bg:"#ecfdf5", border:"#bbf7d0", Icon: CheckCircle2 },
              { label:"Avg done",  value:"86%", sub:"this month",    color:"#7c3aed", bg:"#fdf4ff", border:"#ddd6fe", Icon: Heart },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.06, duration:0.35 }}
                className="rounded-2xl p-3 border" style={{ background:s.bg, borderColor:s.border }}>
                <div className="flex items-start justify-between mb-1">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
                  <s.Icon size={13} style={{ color: s.color }} />
                </div>
                <p className="text-[22px] font-black leading-none mb-0.5" style={{ color:s.color, letterSpacing:"-0.03em" }}>{s.value}</p>
                <p className="text-[9px] font-medium" style={{ color:s.color, opacity:0.65 }}>{s.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1 w-fit mb-4">
            {(["Active","Completed","Paused"] as Tab[]).map(tab => {
              const isActive = activeTab === tab;
              const t = TAB_CFG[tab];
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                  style={isActive
                    ? { background:t.bg, color:t.text, border:`1px solid ${t.border}` }
                    : { color:"#9ca3af", border:"1px solid transparent" }}>
                  {tab}
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                    style={isActive
                      ? { background:"rgba(0,0,0,0.06)", color:t.text }
                      : { background:"#f3f4f6", color:"#9ca3af" }}>
                    {tab==="Active"?3:tab==="Completed"?7:2}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Cards */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-4 }} transition={{ duration:0.18 }}
              className="flex flex-col gap-2.5">

              {activeTab === "Active" && ACTIVE_ITEMS.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.06 }}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="h-[2.5px]" style={{ background:item.barColor }}/>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border"
                          style={{ background:item.typeBg, color:item.typeColor, borderColor:item.typeBorder }}>
                          {item.type}
                        </span>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-medium"
                          style={{ background:item.streakBg, color:item.streakColor, borderColor:item.streakBorder }}>
                          <Icon path={ICONS.bolt} size={8} color={item.streakColor} fill={item.streakColor}/>
                          {item.streakBadge}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">{item.lastOpened}</span>
                    </div>
                    <p className="text-[14px] font-semibold text-gray-950 mb-1">{item.title}</p>
                    <p className="text-[11px] text-gray-400 italic mb-2.5">{item.context}</p>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-[10px] text-gray-400">{item.meta}</span>
                      <span className="text-[15px] font-bold" style={{ color:item.barColor }}>{item.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <motion.div className="h-full rounded-full" style={{ background:item.barColor }}
                        initial={{ width:0 }} whileInView={{ width:`${item.progress}%` }}
                        viewport={{ once:true }} transition={{ delay:i*0.06+0.2, duration:0.8, ease:"easeOut" }}/>
                    </div>
                    <div className="flex justify-end">
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-semibold text-white"
                        style={{ background:item.barColor }}>
                        {item.ctaLabel} <Icon path={ICONS.arrow} size={10} color="white"/>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {activeTab === "Completed" && COMPLETED_ITEMS.map((item, i) => (
                <motion.div key={item.title}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.06 }}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="h-[2.5px] bg-emerald-500"/>
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Icon path={ICONS.trophy} size={15} color="#059669"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900 truncate">{item.title}</p>
                      <p className="text-[10px] text-gray-400">Finished {item.date} · {item.days} days</p>
                    </div>
                    <div className="h-1.5 bg-emerald-100 rounded-full w-20 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-full"/>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 shrink-0">100%</span>
                  </div>
                </motion.div>
              ))}

              {activeTab === "Paused" && PAUSED_ITEMS.map((item, i) => (
                <motion.div key={item.title}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.06 }}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="h-[2.5px] bg-amber-400"/>
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                      <Icon path={ICONS.pause} size={13} color="#f59e0b"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900 truncate">{item.title}</p>
                      <p className="text-[10px] text-gray-400">Paused {item.ago}</p>
                    </div>
                    <div className="h-1.5 bg-amber-100 rounded-full w-20 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width:`${item.progress}%` }}/>
                    </div>
                    <span className="text-[11px] font-bold text-amber-500 shrink-0">{item.progress}%</span>
                    <button className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-700 shrink-0">
                      Resume
                    </button>
                  </div>
                </motion.div>
              ))}

            </motion.div>
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE PHONE MOCKUP — clean light frame
// ─────────────────────────────────────────────────────────────────────────────
function MobilePreview() {
  return (
    <div className="flex justify-center">
      <div className="relative" style={{ width:"300px" }}>

        {/* Clean light phone frame */}
        <div className="relative bg-white rounded-[44px] p-[10px] border border-gray-200"
          style={{ boxShadow:"0 32px 64px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)" }}>

          {/* Screen */}
          <div className="bg-[#fafaf9] rounded-[36px] overflow-hidden" style={{ height:"620px", position:"relative" }}>

            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-3 pb-1 bg-[#fafaf9]">
              <span className="text-[11px] font-semibold text-gray-900">9:41</span>
              <div className="absolute left-1/2 -translate-x-1/2 top-[13px] w-[90px] h-[18px] bg-gray-900 rounded-full"/>
              <div className="flex items-center gap-1">
                <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
                  <rect x="0" y="5" width="3" height="6" rx="0.5" fill="#111"/>
                  <rect x="4" y="3" width="3" height="8" rx="0.5" fill="#111"/>
                  <rect x="8" y="1" width="3" height="10" rx="0.5" fill="#111"/>
                  <rect x="12" y="0" width="3" height="11" rx="0.5" fill="#111" opacity=".25"/>
                </svg>
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <rect x="0" y="0" width="14" height="12" rx="2" stroke="#111" strokeWidth="1.2"/>
                  <rect x="1.5" y="1.5" width="10" height="9" rx="1" fill="#111"/>
                  <path d="M15 4v4a2 2 0 000-4z" fill="#111"/>
                </svg>
              </div>
            </div>

            {/* App top bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <BoltFilled size={12}/>
                </div>
                <span className="text-[14px] font-bold text-gray-900">Draftpace</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-2 py-1">
                  <Icon path={ICONS.bolt} size={8} color="#f97316" fill="#f97316"/>
                  <span className="text-[10px] font-semibold text-orange-700">12</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-indigo-700">JD</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 py-4" style={{ height:"calc(620px - 130px)", overflowY:"hidden" }}>

              {/* Greeting */}
              <div className="mb-4">
                <p className="text-[11px] text-gray-400">Good morning</p>
                <h2 className="flex items-center gap-1.5 text-[20px] font-bold text-gray-950 leading-none tracking-tight">
                  Jamie <HandWaving size={18} className="text-amber-500" />
                </h2>
                <p className="text-[11px] text-gray-400 mt-1">14 days straight. Top 5% of finishers.</p>
              </div>

              {/* Stats 2x2 */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label:"Streak",    value:"12",  color:"#ea580c", bg:"#fff7ed", border:"#fed7aa", Icon: Flame },
                  { label:"Active",    value:"3",   color:"#4f46e5", bg:"#eef2ff", border:"#c7d2fe", Icon: TrendingUp },
                  { label:"Completed", value:"7",   color:"#059669", bg:"#ecfdf5", border:"#bbf7d0", Icon: CheckCircle2 },
                  { label:"Avg done",  value:"86%", color:"#7c3aed", bg:"#fdf4ff", border:"#ddd6fe", Icon: Heart },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-3 border" style={{ background:s.bg, borderColor:s.border }}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">{s.label}</span>
                      <s.Icon size={12} style={{ color: s.color }} />
                    </div>
                    <p className="text-[20px] font-black leading-none" style={{ color:s.color, letterSpacing:"-0.03em" }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Continue label */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[13px] font-semibold text-gray-900">Continue</span>
                <span className="text-[11px] text-indigo-600">See all →</span>
              </div>

              {/* Swipeable planner cards */}
              <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth:"none" }}>
                {ACTIVE_ITEMS.map((item, i) => (
                  <div key={item.id}
                    className="shrink-0 bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    style={{ width:"150px" }}>
                    <div className="h-[2.5px]" style={{ background:item.barColor }}/>
                    <div className="p-3">
                      <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full border"
                        style={{ background:item.typeBg, color:item.typeColor, borderColor:item.typeBorder }}>
                        {item.type}
                      </span>
                      <p className="text-[11px] font-semibold text-gray-900 mt-1.5 mb-1 leading-snug"
                        style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                        {item.title}
                      </p>
                      <p className="text-[9px] text-gray-400 mb-2">{item.meta}</p>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                        <motion.div className="h-full rounded-full" style={{ background:item.barColor }}
                          initial={{ width:0 }} whileInView={{ width:`${item.progress}%` }}
                          viewport={{ once:true }}
                          transition={{ delay:i*0.1+0.3, duration:0.8, ease:"easeOut" }}/>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold" style={{ color:item.barColor }}>{item.progress}%</span>
                        <span className="text-[9px] font-semibold text-white px-2 py-1 rounded-lg"
                          style={{ background:item.barColor }}>
                          Go →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom nav */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 rounded-b-[36px]"
              style={{ paddingBottom:"10px" }}>
              <div className="flex items-center h-14 px-2">
                {[
                  { label:"Home",     path:ICONS.home,      active:true  },
                  { label:"Library",  path:ICONS.library,   active:false },
                  { label:"Shop",     path:ICONS.purchases, active:false },
                  { label:"Progress", path:ICONS.progress,  active:false },
                  { label:"You",      path:ICONS.user,      active:false },
                ].map(({ label, path, active }) => (
                  <div key={label} className="flex-1 flex flex-col items-center justify-center gap-0.5">
                    <Icon path={path} size={20} color={active ? "#4f46e5" : "#9ca3af"}/>
                    <span className="text-[9px] font-medium" style={{ color:active ? "#4f46e5" : "#9ca3af" }}>
                      {label}
                    </span>
                    {active && <div className="w-1 h-1 rounded-full bg-indigo-600"/>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPreview() {
  return (
    <section className="px-6 py-24 lg:py-28 border-b border-gray-100 bg-[#fafaf9]">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:0.4 }}
            className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#4f46e5"/>
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
              Your Dashboard
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:0.5, delay:0.1 }}
            className="font-black text-gray-950 tracking-[-0.04em] leading-none mb-5"
            style={{ fontSize:"clamp(32px,5vw,48px)" }}>
            Your growth, tracked.
            <span className="block text-indigo-600">All in one place.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity:0 }} whileInView={{ opacity:1 }}
            viewport={{ once:true }} transition={{ duration:0.4, delay:0.2 }}
            className="text-[16px] text-gray-400 max-w-md mx-auto leading-relaxed">
            Active planners, finished wins, everything you paused — always one tap away. On any device.
          </motion.p>
        </div>

        {/* Desktop: browser chrome */}
        <motion.div className="hidden lg:block"
          initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}>
          <DesktopPreview/>
        </motion.div>

        {/* Mobile: phone mockup */}
        <motion.div className="lg:hidden"
          initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}>
          <MobilePreview/>
        </motion.div>

        {/* Platform badges */}
        <motion.div
          initial={{ opacity:0 }} whileInView={{ opacity:1 }}
          viewport={{ once:true }} transition={{ delay:0.5 }}
          className="flex items-center justify-center gap-6 mt-10 flex-wrap">
          {[
            { label:"Web app",      icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { label:"Mobile app",   icon:"M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
            { label:"Gumroad sync", icon:"M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" },
            { label:"Works offline",icon:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
          ].map(({ label, icon }) => (
            <div key={label} className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                <Icon path={icon} size={13} color="#6b7280"/>
              </div>
              {label}
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
