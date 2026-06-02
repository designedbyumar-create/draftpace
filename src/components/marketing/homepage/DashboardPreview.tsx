"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Custom Icons ──────────────────────────────────────────────────────────────

const BoltIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"
      fill="#4f46e5"
      stroke="#4338ca"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const DashboardIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const LibraryIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13" />
    <path d="M4 19h16" />
    <path d="M9 10h6M9 14h4" />
  </svg>
);

const ProgressIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const PlannerIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const ChecklistIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const EbookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const GuideIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

const ArrowRightIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const TrendUpIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const FlameIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.14-.77-2.06-1.8-2.4C10.54 11.74 10 10.93 10 10c0 0 1.5 1 2 3.5C13.5 11 14 8 12 5.5c0 0 0 3-2 4.5-1 .75-1.5 1.5-1.5 2.5z" />
    <path d="M12 22c-3.31 0-6-2.69-6-6 0-3.5 2.5-5.5 3.5-8 .5 1.5 1.5 3 1.5 5 1-1.5 1-3.5 0-5 2 1.5 4 4.5 4 8 0 3.31-2.69 6-6 6z" />
  </svg>
);

const CheckCircleIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12l3 3 5-5" />
  </svg>
);

const PauseIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

// ── Types & Data ──────────────────────────────────────────────────────────────

type Tab = "Active" | "Completed" | "Paused";

interface ContentItem {
  title: string;
  type: string;
  typeColor: string;
  progress: number;
  progressColor: string;
  progressBg: string;
  meta: string;
  lastOpened: string;
  cardBg: string;
  cardBorder: string;
  action: string;
}

const tabCounts: Record<Tab, number> = { Active: 3, Completed: 7, Paused: 2 };

const tabConfig: Record<Tab, { color: string; badgeBg: string; badgeText: string }> = {
  Active: { color: "#4f46e5", badgeBg: "#eef2ff", badgeText: "#4338ca" },
  Completed: { color: "#059669", badgeBg: "#d1fae5", badgeText: "#065f46" },
  Paused: { color: "#f59e0b", badgeBg: "#fef3c7", badgeText: "#92400e" },
};

const contentByTab: Record<Tab, ContentItem[]> = {
  Active: [
    {
      title: "Monthly Budget Reset",
      type: "Planner",
      typeColor: "#4f46e5",
      progress: 68,
      progressColor: "#4f46e5",
      progressBg: "#eef2ff",
      meta: "Day 14 of 30",
      lastOpened: "Last opened today",
      cardBg: "#f8f8ff",
      cardBorder: "#c7d2fe",
      action: "Continue →",
    },
    {
      title: "30-Day Habit Builder",
      type: "Checklist",
      typeColor: "#7c3aed",
      progress: 53,
      progressColor: "#7c3aed",
      progressBg: "#ede9fe",
      meta: "Day 16 of 30",
      lastOpened: "Last opened yesterday",
      cardBg: "#faf5ff",
      cardBorder: "#ddd6fe",
      action: "Continue →",
    },
    {
      title: "Savings Goal — $5,000",
      type: "Guide",
      typeColor: "#0d9488",
      progress: 41,
      progressColor: "#0d9488",
      progressBg: "#ccfbf1",
      meta: "Week 6 of 12",
      lastOpened: "Last opened 2 days ago",
      cardBg: "#f0fdfa",
      cardBorder: "#99f6e4",
      action: "Continue →",
    },
  ],
  Completed: [
    {
      title: "Q3 Life Audit",
      type: "Guide",
      typeColor: "#059669",
      progress: 100,
      progressColor: "#059669",
      progressBg: "#d1fae5",
      meta: "Finished Sep 30",
      lastOpened: "Completed in 18 days",
      cardBg: "#f0fdf4",
      cardBorder: "#bbf7d0",
      action: "Review →",
    },
    {
      title: "Morning Routine Checklist",
      type: "Checklist",
      typeColor: "#059669",
      progress: 100,
      progressColor: "#059669",
      progressBg: "#d1fae5",
      meta: "Finished Oct 14",
      lastOpened: "Completed in 7 days",
      cardBg: "#f0fdf4",
      cardBorder: "#bbf7d0",
      action: "Review →",
    },
    {
      title: "Side Hustle Starter",
      type: "eBook",
      typeColor: "#059669",
      progress: 100,
      progressColor: "#059669",
      progressBg: "#d1fae5",
      meta: "Finished Nov 1",
      lastOpened: "Completed in 5 days",
      cardBg: "#f0fdf4",
      cardBorder: "#bbf7d0",
      action: "Review →",
    },
  ],
  Paused: [
    {
      title: "Annual Life Audit",
      type: "Guide",
      typeColor: "#f59e0b",
      progress: 34,
      progressColor: "#f59e0b",
      progressBg: "#fef3c7",
      meta: "Paused 3 weeks ago",
      lastOpened: "Last opened Oct 9",
      cardBg: "#fffdf0",
      cardBorder: "#fde68a",
      action: "Resume →",
    },
    {
      title: "Fitness Tracker — Nov",
      type: "Planner",
      typeColor: "#f59e0b",
      progress: 18,
      progressColor: "#f59e0b",
      progressBg: "#fef3c7",
      meta: "Paused 1 week ago",
      lastOpened: "Last opened Nov 4",
      cardBg: "#fffdf0",
      cardBorder: "#fde68a",
      action: "Resume →",
    },
  ],
};

// Stat cards — each with a distinct pastel palette
const statCards = [
  {
    label: "STREAK",
    value: "12",
    sub: "days in a row",
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    dot: "🔥",
  },
  {
    label: "AVG PROGRESS",
    value: "26%",
    sub: "when paused",
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "#ddd6fe",
    dot: "📈",
  },
  {
    label: "DAYS IDLE",
    value: "14",
    sub: "avg days paused",
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    dot: "⏸",
  },
];

const navItems = [
  { label: "Dashboard", icon: DashboardIcon, active: true },
  { label: "My Library", icon: LibraryIcon, active: false },
  { label: "Progress", icon: ProgressIcon, active: false },
];

const contentNavItems = [
  { label: "Planners", icon: PlannerIcon },
  { label: "Checklists", icon: ChecklistIcon },
  { label: "eBooks", icon: EbookIcon },
  { label: "Guides", icon: GuideIcon },
];

const tabIcons: Record<Tab, React.FC<{ size?: number }>> = {
  Active: ArrowRightIcon,
  Completed: CheckCircleIcon,
  Paused: PauseIcon,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<Tab>("Active");
  const items = contentByTab[activeTab];
  const cfg = tabConfig[activeTab];

  return (
    <section
      className="px-6 py-28 border-b border-gray-100"
      style={{ background: "#fafaf9" }}
    >
      <div className="mx-auto max-w-5xl">

        {/* ── Section Header ── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6">
            <BoltIcon size={13} />
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
              Your Dashboard
            </span>
          </div>

          <h2
            className="text-[42px] font-black leading-[1.05] text-gray-950 mb-5"
            style={{ letterSpacing: "-0.04em" }}
          >
            Your growth, tracked.
            <span className="block text-indigo-600">All in one place.</span>
          </h2>

          <p className="text-[17px] text-gray-400 max-w-md mx-auto leading-relaxed">
            Active planners, finished wins, and everything you paused — always
            one click away.
          </p>
        </div>

        {/* ── Browser Chrome ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="rounded-3xl overflow-hidden shadow-xl border border-gray-200 bg-white"
        >
          {/* Browser bar */}
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-1.5 text-xs text-gray-400 font-medium max-w-xs mx-auto text-center">
              app.draftpace.com/dashboard
            </div>
          </div>

          {/* Dashboard layout */}
          <div className="flex min-h-[600px]">

            {/* ── Sidebar ── */}
            <aside className="w-[220px] border-r border-gray-100 flex flex-col py-6 px-4 shrink-0">
              <div className="flex items-center gap-2.5 mb-8 px-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <BoltIcon size={15} />
                </div>
                <span className="text-[15px] font-bold text-gray-900">Draftpace</span>
              </div>

              <nav className="space-y-0.5 mb-6">
                {navItems.map(({ label, icon: Icon, active }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-colors ${
                      active ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </div>
                ))}
              </nav>

              <div className="mt-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-2">
                  Content
                </p>
                <nav className="space-y-0.5">
                  {contentNavItems.map(({ label, icon: Icon }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 cursor-pointer transition-colors"
                    >
                      <Icon size={16} />
                      {label}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-2.5 px-2 pt-4 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-indigo-700">JD</span>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-900">Jamie D.</p>
                  <p className="text-[11px] text-gray-400">Pro member</p>
                </div>
              </div>
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 p-7 overflow-auto">

              {/* Top bar */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-400">Good morning</p>
                  <p className="text-[20px] font-black text-gray-950" style={{ letterSpacing: "-0.02em" }}>
                    Jamie 👋
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5">
                    <FlameIcon size={13} />
                    <span className="text-[12px] font-bold text-orange-700">12-day streak</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                    <span className="text-emerald-600"><TrendUpIcon size={13} /></span>
                    <span className="text-[12px] font-bold text-emerald-700">86% this month</span>
                  </div>
                </div>
              </div>

              {/* ── Stat cards — distinct backgrounds ── */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {statCards.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 + 0.15, duration: 0.45 }}
                    viewport={{ once: true }}
                    className="border rounded-2xl p-4"
                    style={{ background: s.bg, borderColor: s.border }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {s.label}
                      </p>
                      <span className="text-base leading-none">{s.dot}</span>
                    </div>
                    <p
                      className="text-[28px] font-black leading-none mb-0.5"
                      style={{ color: s.color, letterSpacing: "-0.03em" }}
                    >
                      {s.value}
                    </p>
                    <p className="text-[11px] font-semibold" style={{ color: s.color, opacity: 0.75 }}>
                      {s.sub}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* ── Tabs — interactive ── */}
              <div className="flex gap-2 mb-5">
                {(["Active", "Completed", "Paused"] as Tab[]).map((tab) => {
                  const isActive = activeTab === tab;
                  const tc = tabConfig[tab];
                  const TabIcon = tabIcons[tab];
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold border transition-all ${
                        isActive
                          ? "bg-white border-gray-300 text-gray-900 shadow-sm"
                          : "bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600"
                      }`}
                    >
                      {isActive && (
                        <span style={{ color: tc.color }}>
                          <TabIcon size={12} />
                        </span>
                      )}
                      {tab}
                      <span
                        className="text-[11px] font-bold px-1.5 py-0.5 rounded-md transition-colors"
                        style={
                          isActive
                            ? { background: tc.badgeBg, color: tc.badgeText }
                            : { background: "#f3f4f6", color: "#9ca3af" }
                        }
                      >
                        {tabCounts[tab]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── Tab content — animated ── */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-3"
                >
                  {items.map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.35 }}
                      className="rounded-2xl border p-5"
                      style={{ background: item.cardBg, borderColor: item.cardBorder }}
                    >
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="text-[15px] font-bold text-gray-900">{item.title}</p>
                          <p className="text-[12px] text-gray-400 mt-0.5">{item.meta}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-gray-400">{item.type}</span>
                          <span
                            className="text-[14px] font-black"
                            style={{ color: item.typeColor }}
                          >
                            {item.progress}%
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div
                        className="h-2 w-full rounded-full mb-4 mt-3"
                        style={{ background: item.progressBg }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.progressColor }}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ delay: i * 0.07 + 0.15, duration: 0.8, ease: "easeOut" }}
                        />
                      </div>

                      {/* Footer row */}
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] text-gray-400">{item.lastOpened}</p>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-2 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl transition-colors"
                          style={{ background: cfg.color }}
                        >
                          {item.action}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

            </main>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
