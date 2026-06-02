"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

const Icon = ({ path, size = 16, color = "currentColor" }: { path: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path}/>
  </svg>
);

const ICONS = {
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  library:   "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  progress:  "M22 12h-4l-3 9L9 3l-3 9H2",
  explore:   "M11 11m-8 0a8 8 0 1016 0 8 8 0 00-16 0 M21 21l-4.35-4.35",
  settings:  "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  home:      "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  logout:    "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  menu:      "M3 6h18M3 12h18M3 18h18",
  close:     "M18 6L6 18M6 6l12 12",
  arrow:     "M5 12h14M12 5l7 7-7 7",
  check:     "M20 6L9 17l-5-5",
  trend:     "M22 12h-4l-3 9L9 3l-3 9H2",
  trophy:    "M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0012 0V2z",
  pause:     "M10 4H6v16h4V4zM18 4h-4v16h4V4z",
  bolt:      "M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z",
};

type Tab = "Active" | "Completed" | "Paused";
interface MicroStat { val: string; label: string }
interface Item {
  id: string; title: string; type: string;
  typeColor: string; typeBg: string; typeBorder: string;
  progress: number; barColor: string; meta: string; lastOpened: string; iconPath: string;
  streakBadge?: string; streakBg?: string; streakColor?: string; streakBorder?: string;
  context?: string; contextHighlight?: string; microStats?: MicroStat[];
  ctaLabel: string; ctaSecLabel?: string;
  completedDate?: string; daysToFinish?: number;
  pausedAgo?: string; pausedLastOpened?: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", path: ICONS.dashboard, href: "/dashboard"          },
  { label: "My Library", path: ICONS.library,  href: "/dashboard/library"  },
  { label: "Progress",   path: ICONS.progress, href: "/dashboard/progress" },
  { label: "Explore",    path: ICONS.explore,  href: "/dashboard/explore"  },
  { label: "Settings",   path: ICONS.settings, href: "/dashboard/settings" },
];

const ACTIVE: Item[] = [
  {
    id: "1", title: "Monthly Budget Reset",
    type: "Planner", typeColor: "#4338ca", typeBg: "#eef2ff", typeBorder: "#c7d2fe",
    progress: 68, barColor: "#4f46e5", meta: "Day 14 of 30", lastOpened: "today",
    iconPath: "M3 3h18v18H3z M9 9h6M9 12h6M9 15h4",
    streakBadge: "14-day streak — your best run yet",
    streakBg: "#fff7ed", streakColor: "#ea580c", streakBorder: "#fed7aa",
    context: "You're past the halfway mark — most people quit by day 10. The next 16 days are where real habits form. Don't stop now.",
    contextHighlight: "past the halfway mark",
    microStats: [{ val: "$1,720", label: "saved so far" }, { val: "3 goals", label: "on track" }, { val: "$280", label: "until target" }],
    ctaLabel: "Pick up where you left off", ctaSecLabel: "Skip today",
  },
  {
    id: "2", title: "30-Day Habit Builder",
    type: "Checklist", typeColor: "#6d28d9", typeBg: "#fdf4ff", typeBorder: "#ddd6fe",
    progress: 53, barColor: "#7c3aed", meta: "Day 16 of 30", lastOpened: "yesterday",
    iconPath: "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
    streakBadge: "16 habits checked off",
    streakBg: "#fdf4ff", streakColor: "#6d28d9", streakBorder: "#ddd6fe",
    context: "Today's focus: Review last week's patterns. You've been consistent on mornings — but evenings are slipping. 5 minutes is all it takes.",
    contextHighlight: "Review last week's patterns",
    microStats: [{ val: "16 of 30", label: "days done" }, { val: "3 habits", label: "tracked" }, { val: "14 left", label: "to finish" }],
    ctaLabel: "Check in for today", ctaSecLabel: "Remind me later",
  },
  {
    id: "3", title: "Savings Goal — $5,000",
    type: "Guide", typeColor: "#0f766e", typeBg: "#f0fdfa", typeBorder: "#99f6e4",
    progress: 41, barColor: "#0d9488", meta: "$2,050 of $5,000", lastOpened: "2 days ago",
    iconPath: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    streakBadge: "On pace — $416/week average",
    streakBg: "#f0fdfa", streakColor: "#0f766e", streakBorder: "#99f6e4",
    context: "Week 6 of 12. You're 41% there — $2,050 saved. At this rate you'll hit $5,000 by Jan 15th. One more contribution this week keeps you on track.",
    contextHighlight: "Jan 15th",
    microStats: [{ val: "$2,050", label: "saved" }, { val: "$2,950", label: "remaining" }, { val: "Jan 15", label: "projected date" }],
    ctaLabel: "Log this week's contribution", ctaSecLabel: "View breakdown",
  },
];

const COMPLETED: Item[] = [
  { id: "4", title: "Q3 Life Audit", type: "Guide", typeColor: "#065f46", typeBg: "#ecfdf5", typeBorder: "#bbf7d0", progress: 100, barColor: "#059669", meta: "Finished Sep 30", lastOpened: "Sep 30", iconPath: "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3", completedDate: "September 30", daysToFinish: 18, ctaLabel: "Review" },
  { id: "5", title: "Morning Routine Checklist", type: "Checklist", typeColor: "#065f46", typeBg: "#ecfdf5", typeBorder: "#bbf7d0", progress: 100, barColor: "#059669", meta: "Finished Oct 14", lastOpened: "Oct 14", iconPath: "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11", completedDate: "October 14", daysToFinish: 7, ctaLabel: "Review" },
  { id: "6", title: "Side Hustle Starter", type: "eBook", typeColor: "#065f46", typeBg: "#ecfdf5", typeBorder: "#bbf7d0", progress: 100, barColor: "#059669", meta: "Finished Nov 1", lastOpened: "Nov 1", iconPath: "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z", completedDate: "November 1", daysToFinish: 5, ctaLabel: "Review" },
];

const PAUSED: Item[] = [
  { id: "7", title: "Annual Life Audit", type: "Guide", typeColor: "#92400e", typeBg: "#fff7ed", typeBorder: "#fde68a", progress: 34, barColor: "#f59e0b", meta: "34% complete", lastOpened: "Oct 9", iconPath: "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3", pausedAgo: "3 weeks ago", pausedLastOpened: "October 9", ctaLabel: "Resume" },
  { id: "8", title: "Fitness Tracker — Nov", type: "Planner", typeColor: "#92400e", typeBg: "#fff7ed", typeBorder: "#fde68a", progress: 18, barColor: "#f59e0b", meta: "18% complete", lastOpened: "Nov 4", iconPath: "M3 3h18v18H3z M9 9h6M9 12h6M9 15h4", pausedAgo: "1 week ago", pausedLastOpened: "November 4", ctaLabel: "Resume" },
];

const TAB_DATA: Record<Tab, Item[]> = { Active: ACTIVE, Completed: COMPLETED, Paused: PAUSED };
const TAB_CFG: Record<Tab, { color: string; bg: string; border: string; text: string }> = {
  Active:    { color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca" },
  Completed: { color: "#059669", bg: "#ecfdf5", border: "#bbf7d0", text: "#065f46" },
  Paused:    { color: "#f59e0b", bg: "#fef3c7", border: "#fde68a", text: "#92400e" },
};

const HABITS = [
  { name: "Morning pages", days: [1,1,1,1,1,0,0], color: "#4f46e5" },
  { name: "No-spend day",  days: [1,0,1,1,0,0,0], color: "#0d9488" },
  { name: "Read 20 mins",  days: [1,1,1,1,1,0,0], color: "#7c3aed" },
];

const RECENT = [
  { name: "Q3 Life Audit",       date: "Sep 30" },
  { name: "Morning Routine",     date: "Oct 14" },
  { name: "Side Hustle Starter", date: "Nov 1"  },
  { name: "Budget Reset — Oct",  date: "Oct 31" },
];

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const QUOTES = [
  { text: "Small progress every day leads to big results.", attr: "Daily motivation" },
  { text: "The secret of getting ahead is getting started.", attr: "Mark Twain" },
  { text: "Consistency is the bridge between goals and accomplishment.", attr: "Daily motivation" },
  { text: "Every action you take is a vote for the person you want to become.", attr: "James Clear" },
  { text: "You don't have to be great to start, but you have to start to be great.", attr: "Zig Ziglar" },
  { text: "Done is better than perfect. Start now, refine later.", attr: "Daily motivation" },
  { text: "You are one decision away from a completely different life.", attr: "Daily motivation" },
];

const getMotivation = (streak: number) => {
  if (streak >= 21) return `${streak} days straight. You're unstoppable.`;
  if (streak >= 14) return `${streak} days straight. You're in the top 5% of finishers.`;
  if (streak >= 7)  return "Week 2. This is where most people fall off. Not you.";
  if (streak === 0) return "Fresh start. Pick one thing and do it today.";
  const day = new Date().getDay();
  if (day === 1) return "Monday. Best day to reset and push hard.";
  if (day === 5) return "Friday. Finish strong — don't coast into the weekend.";
  if (day === 0 || day === 6) return "Weekend mode. Even 10 minutes counts.";
  return "Keep going. Consistency beats intensity every time.";
};

const QuoteCard = () => {
  const quote = QUOTES[new Date().getDay() % QUOTES.length];
  return (
    <div className="mx-2 mb-2 rounded-2xl overflow-hidden relative" style={{ height: "100px" }}>
      <svg width="100%" height="100" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
        <defs>
          <linearGradient id="qcard-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e1b4b"/>
            <stop offset="100%" stopColor="#4c1d95"/>
          </linearGradient>
        </defs>
        <rect width="200" height="100" fill="url(#qcard-bg)"/>
        <circle cx="15" cy="12" r="0.8" fill="white" opacity=".5"/>
        <circle cx="170" cy="9" r="0.8" fill="white" opacity=".5"/>
        <circle cx="185" cy="18" r="0.6" fill="white" opacity=".3"/>
        <circle cx="160" cy="22" r="10" fill="#fbbf24" opacity=".7"/>
        <circle cx="165" cy="18" r="8" fill="#1e1b4b"/>
        <path d="M0 100 L25 55 L45 68 L65 40 L90 62 L115 28 L140 55 L165 35 L200 50 L200 100Z" fill="#2e1065" opacity=".9"/>
        <path d="M0 100 L30 65 L55 78 L80 52 L105 70 L130 42 L155 62 L185 48 L200 58 L200 100Z" fill="#4c1d95" opacity=".8"/>
        <path d="M0 100 L40 75 L65 86 L90 65 L120 80 L150 68 L180 76 L200 70 L200 100Z" fill="#5b21b6" opacity=".85"/>
        <line x1="90" y1="65" x2="90" y2="54" stroke="white" strokeWidth="1" opacity=".7"/>
        <path d="M90 54 L97 58 L90 62Z" fill="#f97316" opacity=".9"/>
      </svg>
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(79,46,229,0.55),rgba(124,58,237,0.45))" }}/>
      <div className="absolute inset-0 flex flex-col justify-end p-3">
        <p className="text-[11px] font-medium leading-[1.4] mb-1" style={{ color: "rgba(255,255,255,0.92)" }}>
          {quote.text} ✨
        </p>
        <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.45)" }}>{quote.attr}</p>
      </div>
    </div>
  );
};

function Sidebar({ name, email, onSignOut, mobile, onClose }: {
  name: string; email: string; onSignOut: () => void; mobile?: boolean; onClose?: () => void;
}) {
  const pathname = usePathname();
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <aside className={`flex flex-col bg-white border-r border-gray-100 ${mobile ? "w-full h-full" : "w-[220px] shrink-0"}`}>
      <div className="flex items-center justify-between px-4 py-[13px] border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image src="/logo/dp-mono.svg" alt="Draftpace" width={32} height={32} className="shrink-0"/>
          <div>
            <span className="text-[14px] font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors block leading-none">Draftpace</span>
            <span className="text-[9px] text-gray-400 leading-none">Momentum OS</span>
          </div>
        </Link>
        {mobile && onClose && (
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all">
            <Icon path={ICONS.close} size={15} />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-0.5 px-2 py-3 border-b border-gray-100">
        {NAV_ITEMS.map(({ label, path, href }) => {
          const isActive = pathname === href;
          return (
            <Link key={label} href={href} onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
                isActive ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium"
              }`}>
              <Icon path={path} size={15} color={isActive ? "#4f46e5" : "currentColor"} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 flex-1 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-2">Active now</p>
        {ACTIVE.map((item) => (
          <Link key={item.id} href={`/dashboard/planner/${item.id}`} onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.barColor }} />
            <span className="truncate flex-1">{item.title}</span>
            <span className="text-[10px] font-semibold shrink-0" style={{ color: item.barColor }}>{item.progress}%</span>
          </Link>
        ))}
      </div>

      <div className="px-2 pt-2 border-t border-gray-100">
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all mb-1">
          <Icon path={ICONS.home} size={14} />Back to site
        </Link>
        <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-indigo-700">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-gray-900 truncate">{name}</p>
            <p className="text-[10px] text-gray-400 truncate">{email}</p>
          </div>
          <button onClick={onSignOut} title="Sign out"
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-all shrink-0">
            <Icon path={ICONS.logout} size={13} />
          </button>
        </div>
        <QuoteCard />
      </div>
    </aside>
  );
}

function TopHeader({ activeTab }: { activeTab: Tab }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex items-center justify-between h-[54px]">
        <div className="flex items-center gap-1.5 text-[12px]">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 transition-colors font-medium">Home</Link>
          <Icon path="M9 6l6 6-6 6" size={12} color="#d1d5db" />
          <span className="text-gray-900 font-semibold">Dashboard</span>
          {activeTab !== "Active" && (
            <>
              <Icon path="M9 6l6 6-6 6" size={12} color="#d1d5db" />
              <span className="font-semibold" style={{ color: activeTab === "Completed" ? "#059669" : "#f59e0b" }}>
                {activeTab}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-gray-400 hidden sm:block">{dateStr}</span>
          <div className="h-4 w-px bg-gray-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#f97316"/>
            </svg>
            <span className="text-[11px] font-semibold text-orange-700">12-day streak</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
            <Icon path={ICONS.trend} size={10} color="#059669" />
            <span className="text-[11px] font-semibold text-emerald-700">86% this month</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveCard({ item, i }: { item: Item; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06, duration: 0.25 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all"
    >
      <div className="h-[3px] w-full" style={{ background: item.barColor }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: item.typeBg }}>
              <Icon path={item.iconPath} size={14} color={item.typeColor} />
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
              style={{ background: item.typeBg, color: item.typeColor, borderColor: item.typeBorder }}>
              {item.type}
            </span>
          </div>
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {item.lastOpened}
          </span>
        </div>

        <h3 className="text-[17px] font-semibold text-gray-950 mb-3 leading-snug">{item.title}</h3>

        {item.streakBadge && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border mb-3"
            style={{ background: item.streakBg, color: item.streakColor, borderColor: item.streakBorder }}>
            <Icon path={ICONS.bolt} size={10} color={item.streakColor} />
            {item.streakBadge}
          </div>
        )}

        {item.context && item.contextHighlight && (
          <p className="text-[12px] text-gray-500 leading-relaxed mb-4 italic">
            {item.context.split(item.contextHighlight).map((part, idx, arr) =>
              idx < arr.length - 1 ? (
                <span key={idx}>{part}<strong className="not-italic font-semibold text-gray-800">{item.contextHighlight}</strong></span>
              ) : part
            )}
          </p>
        )}

        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-[11px] text-gray-400">{item.meta}</span>
            <span className="text-[20px] font-bold leading-none" style={{ color: item.barColor }}>{item.progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: item.barColor }}
              initial={{ width: 0 }} animate={{ width: `${item.progress}%` }}
              transition={{ delay: i * 0.06 + 0.15, duration: 0.8, ease: "easeOut" }} />
          </div>
        </div>

        {item.microStats && item.microStats.length > 0 && (
          <div className="flex gap-5 mb-4 pb-4 border-b border-gray-100">
            {item.microStats.map((s) => (
              <div key={s.label}>
                <p className="text-[14px] font-semibold text-gray-900 leading-none mb-0.5">{s.val}</p>
                <p className="text-[10px] text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Link href={`/dashboard/planner/${item.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: item.barColor }}>
            {item.ctaLabel} <Icon path={ICONS.arrow} size={12} color="white" />
          </Link>
          {item.ctaSecLabel && (
            <button className="px-4 py-2.5 rounded-xl text-[12px] font-medium text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all">
              {item.ctaSecLabel}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CompletedCard({ item, i }: { item: Item; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06, duration: 0.25 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all"
    >
      <div className="h-[3px] w-full bg-emerald-500" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 border border-emerald-100">
              <Icon path={ICONS.trophy} size={16} color="#059669" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-gray-900 leading-snug">{item.title}</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block"
                style={{ background: item.typeBg, color: item.typeColor, borderColor: item.typeBorder }}>
                {item.type}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
            <Icon path={ICONS.check} size={10} color="#059669" /> Completed
          </div>
        </div>

        <div className="flex gap-5 p-4 bg-emerald-50 rounded-xl mb-4">
          <div>
            <p className="text-[13px] font-semibold text-gray-900 leading-none mb-0.5">{item.completedDate}</p>
            <p className="text-[10px] text-gray-400">finished on</p>
          </div>
          <div className="w-px bg-emerald-200" />
          <div>
            <p className="text-[13px] font-semibold text-gray-900 leading-none mb-0.5">{item.daysToFinish} days</p>
            <p className="text-[10px] text-gray-400">to complete</p>
          </div>
          <div className="w-px bg-emerald-200" />
          <div>
            <p className="text-[13px] font-semibold text-gray-900 leading-none mb-0.5">100%</p>
            <p className="text-[10px] text-gray-400">finished</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-[11px] text-gray-400">{item.meta}</span>
            <span className="text-[13px] font-bold text-emerald-600">Done ✓</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-emerald-500"
              initial={{ width: 0 }} animate={{ width: "100%" }}
              transition={{ delay: i * 0.06 + 0.15, duration: 0.8, ease: "easeOut" }} />
          </div>
        </div>

        <Link href={`/dashboard/planner/${item.id}`}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-90 bg-emerald-50 border border-emerald-200 text-emerald-700">
          Review planner <Icon path={ICONS.arrow} size={12} color="#059669" />
        </Link>
      </div>
    </motion.div>
  );
}

function PausedCard({ item, i }: { item: Item; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06, duration: 0.25 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all"
    >
      <div className="h-[3px] w-full bg-amber-400" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 border border-amber-100">
              <Icon path={ICONS.pause} size={15} color="#f59e0b" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-gray-900 leading-snug">{item.title}</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block"
                style={{ background: item.typeBg, color: item.typeColor, borderColor: item.typeBorder }}>
                {item.type}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-700 shrink-0">
            Paused {item.pausedAgo}
          </div>
        </div>

        <div className="flex gap-5 p-4 bg-amber-50 rounded-xl mb-4">
          <div>
            <p className="text-[13px] font-semibold text-gray-900 leading-none mb-0.5">{item.pausedLastOpened}</p>
            <p className="text-[10px] text-gray-400">last opened</p>
          </div>
          <div className="w-px bg-amber-200" />
          <div>
            <p className="text-[13px] font-semibold text-gray-900 leading-none mb-0.5">{item.progress}%</p>
            <p className="text-[10px] text-gray-400">completed</p>
          </div>
          <div className="w-px bg-amber-200" />
          <div>
            <p className="text-[13px] font-semibold text-gray-900 leading-none mb-0.5">{100 - item.progress}%</p>
            <p className="text-[10px] text-gray-400">remaining</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-[11px] text-gray-400">{item.meta}</span>
            <span className="text-[20px] font-bold leading-none text-amber-500">{item.progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-amber-400"
              initial={{ width: 0 }} animate={{ width: `${item.progress}%` }}
              transition={{ delay: i * 0.06 + 0.15, duration: 0.8, ease: "easeOut" }} />
          </div>
        </div>

        <Link href={`/dashboard/planner/${item.id}`}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 bg-amber-500">
          Resume where you left off <Icon path={ICONS.arrow} size={12} color="white" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("there");
  const [userEmail, setUserEmail] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("Active");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); }
      else {
        setUserName(session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "there");
        setUserEmail(session.user.email || "");
        setLoading(false);
      }
    });
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.replace("/"); };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = userName.split(" ")[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Image src="/logo/dp-mono.svg" alt="Draftpace" width={36} height={36} />
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const tabItems = TAB_DATA[activeTab];
  const tabCfg = TAB_CFG[activeTab];

  return (
    <div className="flex h-screen bg-[#fafaf9] overflow-hidden">

      <div className="hidden lg:flex h-full">
        <Sidebar name={userName} email={userEmail} onSignOut={handleSignOut} />
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden" style={{ background: "rgba(0,0,0,0.35)" }}
            onClick={() => setSidebarOpen(false)}>
            <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="absolute left-0 top-0 bottom-0 w-64" onClick={(e) => e.stopPropagation()}>
              <Sidebar name={userName} email={userEmail} onSignOut={handleSignOut} mobile onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto flex flex-col">

        <div className="lg:hidden flex items-center justify-between px-4 py-3.5 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="w-8 h-8 flex items-center justify-center text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <Icon path={ICONS.menu} size={18} />
          </button>
          <Image src="/logo/dp-mono.svg" alt="Draftpace" width={28} height={28} />
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-[10px] font-bold text-indigo-700">{firstName.slice(0,2).toUpperCase()}</span>
          </div>
        </div>

        <div className="hidden lg:block">
          <TopHeader activeTab={activeTab} />
        </div>

        <div className="px-6 lg:px-8 py-7 max-w-4xl mx-auto w-full space-y-6">

          {/* Greeting */}
          <div className="relative overflow-hidden">
            <svg className="absolute right-0 top-0 pointer-events-none select-none" style={{ opacity: 0.15 }}
              width="260" height="110" viewBox="0 0 260 120" fill="none" aria-hidden="true">
              <circle cx="218" cy="38" r="22" fill="#fde68a"/>
              <circle cx="218" cy="38" r="14" fill="#fbbf24"/>
              <ellipse cx="155" cy="28" rx="28" ry="9" fill="white"/>
              <path d="M0 120 L40 55 L70 78 L100 35 L130 65 L160 25 L190 58 L220 30 L260 52 L260 120Z" fill="#c7d2fe" opacity=".5"/>
              <path d="M0 120 L50 70 L80 88 L115 48 L148 75 L180 42 L210 65 L260 50 L260 120Z" fill="#a5b4fc" opacity=".55"/>
              <path d="M0 120 L60 80 L95 98 L130 60 L165 85 L200 68 L240 82 L260 72 L260 120Z" fill="#818cf8" opacity=".5"/>
              <line x1="130" y1="60" x2="130" y2="44" stroke="#6366f1" strokeWidth="1.5"/>
              <path d="M130 44 L140 49 L130 54Z" fill="#f97316" opacity=".9"/>
            </svg>
            <div>
              <p className="text-[12px] text-gray-400 mb-0.5">{getGreeting()}</p>
              <h1 className="text-[26px] font-bold text-gray-950 leading-none tracking-tight">{firstName} 👋</h1>
              <p className="text-[13px] text-gray-400 mt-1.5 max-w-xs">{getMotivation(12)}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Streak",    value: "12",  sub: "days in a row", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", icon: "🔥",
                extra: <div className="flex gap-1 mt-3">{[1,1,1,1,1,0.4,0].map((o,i) => <div key={i} className="flex-1 h-1 rounded-full" style={{ background: o===1?"#f97316":o===0.4?"#fed7aa":"#f3f4f6" }}/>)}</div> },
              { label: "Active",    value: "3",   sub: "in progress",   color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe", icon: "📈", extra: null },
              { label: "Completed", value: "7",   sub: "all time",      color: "#059669", bg: "#ecfdf5", border: "#bbf7d0", icon: "✅", extra: null },
              { label: "Avg done",  value: "86%", sub: "this month",    color: "#7c3aed", bg: "#fdf4ff", border: "#ddd6fe", icon: "💜", extra: null },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="rounded-2xl p-4 border" style={{ background: s.bg, borderColor: s.border }}>
                <div className="flex items-start justify-between mb-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
                  <span className="text-base leading-none">{s.icon}</span>
                </div>
                <p className="font-bold leading-none mb-0.5" style={{ fontSize: "26px", color: s.color, letterSpacing: "-0.03em" }}>{s.value}</p>
                <p className="text-[10px] font-medium" style={{ color: s.color, opacity: 0.65 }}>{s.sub}</p>
                {s.extra}
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                {(["Active","Completed","Paused"] as Tab[]).map((tab) => {
                  const isActive = activeTab === tab;
                  const tc = TAB_CFG[tab];
                  return (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                      style={isActive
                        ? { background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }
                        : { color: "#9ca3af", border: "1px solid transparent" }}>
                      {tab}
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                        style={isActive ? { background: "rgba(0,0,0,0.06)", color: tc.text } : { background: "#f3f4f6", color: "#9ca3af" }}>
                        {TAB_DATA[tab].length}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Link href="/dashboard/library" className="text-[12px] font-medium text-indigo-600 hover:underline flex items-center gap-1">
                Browse library <Icon path={ICONS.arrow} size={11} color="#4f46e5" />
              </Link>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
                className="flex flex-col gap-3">
                {tabItems.map((item, i) => {
                  if (activeTab === "Active")    return <ActiveCard    key={item.id} item={item} i={i} />;
                  if (activeTab === "Completed") return <CompletedCard key={item.id} item={item} i={i} />;
                  if (activeTab === "Paused")    return <PausedCard    key={item.id} item={item} i={i} />;
                  return null;
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
                  <Icon path={ICONS.bolt} size={13} color="#4f46e5" />
                  This week's habits
                </p>
                <div className="flex gap-2">
                  {DAY_LABELS.map((d) => (
                    <span key={d} className="text-[9px] font-bold text-gray-400 w-4 text-center">{d}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {HABITS.map((habit) => (
                  <div key={habit.name} className="flex items-center gap-3">
                    <span className="text-[12px] font-medium text-gray-600 w-28 shrink-0 truncate">{habit.name}</span>
                    <div className="flex gap-2 ml-auto">
                      {habit.days.map((done, i) => (
                        <div key={`${habit.name}-${i}`} className="w-4 h-4 rounded-md transition-all"
                          style={{ background: done ? habit.color : "#f3f4f6" }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-[13px] font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <Icon path="M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3" size={13} color="#059669" />
                Recently completed
              </p>
              <div className="flex flex-col gap-2.5">
                {RECENT.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Icon path={ICONS.check} size={9} color="#059669" />
                    </div>
                    <span className="text-[13px] font-medium text-gray-700 flex-1 truncate">{item.name}</span>
                    <span className="text-[11px] text-gray-400 shrink-0">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upgrade banner */}
          <div className="relative rounded-2xl overflow-hidden px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: "linear-gradient(135deg,#e0e7ff,#ede9fe,#fce7f3)", border: "1px solid rgba(99,102,241,0.15)" }}>
            <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
              style={{ backgroundImage: "radial-gradient(circle,#4f46e5 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Unlock more</p>
              <p className="text-[17px] font-bold text-gray-950 tracking-tight leading-tight mb-0.5">
                200+ planners waiting. <span className="text-indigo-600">$7/mo unlocks all.</span>
              </p>
              <p className="text-[12px] text-gray-500">Cancel anytime. No tricks.</p>
            </div>
            <Link href="/pricing"
              className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all shrink-0">
              See plans <Icon path={ICONS.arrow} size={12} color="white" />
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}