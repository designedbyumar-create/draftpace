"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — flip when real data is ready. One flag per data source.
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  STATS_READY:    false, // true → fetch streak/stats from Supabase
  PLANNERS_READY: false, // true → fetch active planner for Today's Focus
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// UPCOMING PLANNERS — shown as teasers until PLANNERS_READY = true
// Update names/descriptions when real planners are uploaded
// ─────────────────────────────────────────────────────────────────────────────
const UPCOMING = [
  {
    id: "1",
    title: "Monthly Budget Reset",
    type: "Planner",
    description: "Track every dollar. Reset every month. Take back control of your finances.",
    duration: "30 days",
    barColor: "#4f46e5",
    typeColor: "#4338ca", typeBg: "#eef2ff", typeBorder: "#c7d2fe",
    iconPath: "M3 3h18v18H3z M9 9h6M9 12h6M9 15h4",
    accentFrom: "#e0e7ff", accentTo: "#c7d2fe",
  },
  {
    id: "2",
    title: "30-Day Habit Builder",
    type: "Checklist",
    description: "Build any habit in 30 days with daily check-ins and streak tracking.",
    duration: "30 days",
    barColor: "#7c3aed",
    typeColor: "#6d28d9", typeBg: "#fdf4ff", typeBorder: "#ddd6fe",
    iconPath: "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
    accentFrom: "#ede9fe", accentTo: "#ddd6fe",
  },
  {
    id: "3",
    title: "Savings Goal — $5,000",
    type: "Guide",
    description: "Weekly contributions. Visual progress. Hit any savings target on schedule.",
    duration: "12 weeks",
    barColor: "#0d9488",
    typeColor: "#0f766e", typeBg: "#f0fdfa", typeBorder: "#99f6e4",
    iconPath: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    accentFrom: "#ccfbf1", accentTo: "#99f6e4",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface ActivePlanner {
  id: string; title: string; type: string;
  typeColor: string; typeBg: string; typeBorder: string;
  progress: number; barColor: string;
  meta: string; context: string; contextHighlight: string;
  ctaLabel: string;
  microStats: { val: string; label: string }[];
}

interface Stats {
  streak: number; personalBest: number;
  active: number; completed: number; thisWeek: number;
}

interface PausedNudge {
  id: string; title: string; progress: number; daysAgo: number;
  barColor: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 16, color = "currentColor" }: {
  path: string; size?: number; color?: string;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path}/>
  </svg>
);

const ICONS = {
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  drafts:    "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  explore:   "M11 11m-8 0a8 8 0 1016 0 8 8 0 00-16 0 M21 21l-4.35-4.35",
  settings:  "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  home:      "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  logout:    "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  close:     "M18 6L6 18M6 6l12 12",
  arrow:     "M5 12h14M12 5l7 7-7 7",
  check:     "M20 6L9 17l-5-5",
  clock:     "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  bolt:      "M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z",
  pause:     "M10 4H6v16h4V4zM18 4h-4v16h4V4z",
  flame:     "M12 22c-4 0-7-3.5-7-7 0-3.5 2.5-5.5 3.5-8 .5 1.5 1.5 3 1.5 5 1-1.5 1-3.5 0-5 2 1.5 4 4.5 4 8 0 3.5-3 7-7 7z",
};

const NAV_ITEMS = [
  { label:"Dashboard", path:ICONS.dashboard, href:"/dashboard"          },
  { label:"Drafts",    path:ICONS.drafts,    href:"/dashboard/drafts"   },
  { label:"Explore",   path:ICONS.explore,   href:"/dashboard/explore"  },
  { label:"Settings",  path:ICONS.settings,  href:"/dashboard/settings" },
];

const BOTTOM_NAV = [
  { label:"Home",     path:ICONS.home,     href:"/dashboard"          },
  { label:"Drafts",   path:ICONS.drafts,   href:"/dashboard/drafts"   },
  { label:"Explore",  path:ICONS.explore,  href:"/dashboard/explore"  },
  { label:"Settings", path:ICONS.settings, href:"/dashboard/settings" },
];

const QUOTES = [
  { text:"Small progress every day leads to big results.", attr:"Daily motivation" },
  { text:"The secret of getting ahead is getting started.", attr:"Mark Twain" },
  { text:"Consistency is the bridge between goals and accomplishment.", attr:"Daily motivation" },
  { text:"Every action you take is a vote for who you want to become.", attr:"James Clear" },
  { text:"Done is better than perfect. Start now, refine later.", attr:"Daily motivation" },
  { text:"You don't have to be great to start. But you have to start.", attr:"Zig Ziglar" },
  { text:"What you do today is what matters most.", attr:"Daily motivation" },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return "Still up?";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
};

const getDayContext = () => {
  const day = new Date().getDay();
  const map: Record<number, string> = {
    0: "Sunday — even 10 minutes counts.",
    1: "Monday. Best day to reset and push hard.",
    2: "Tuesday. Build on yesterday's momentum.",
    3: "Midweek. Don't coast — this is when habits slip.",
    4: "Thursday. Almost there. Finish strong.",
    5: "Friday. End the week clean.",
    6: "Saturday. Weekend mode. Still show up.",
  };
  return map[day];
};

const getStreakMessage = (streak: number, personalBest: number) => {
  if (streak === 0) return "Start today. Day 1 is the hardest one.";
  if (streak === 1) return "Day 1 done. Come back tomorrow.";
  if (streak < 7)  return `${7 - streak} more days to hit a full week.`;
  if (streak < 14) return "One week in. This is where habits actually form.";
  if (streak < personalBest) return `${personalBest - streak} days to beat your personal best.`;
  if (streak >= personalBest) return "Personal best. You're in the top 5% of finishers.";
  return "Keep going. Consistency beats intensity every time.";
};

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`}/>;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUOTE CARD (sidebar)
// ─────────────────────────────────────────────────────────────────────────────
function QuoteCard() {
  const quote = QUOTES[new Date().getDay() % QUOTES.length];
  return (
    <div className="mx-2 mb-2 rounded-2xl overflow-hidden relative" style={{ height:"96px" }}>
      <svg width="100%" height="96" viewBox="0 0 200 96"
        preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
        <defs>
          <linearGradient id="qbg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e1b4b"/><stop offset="100%" stopColor="#4c1d95"/>
          </linearGradient>
        </defs>
        <rect width="200" height="96" fill="url(#qbg)"/>
        <circle cx="160" cy="20" r="10" fill="#fbbf24" opacity=".7"/>
        <circle cx="164" cy="16" r="8" fill="#1e1b4b"/>
        <path d="M0 96L25 52l20 13 20-28 25 22 25-34 25 27 20-20L200 48V96Z" fill="#2e1065" opacity=".9"/>
        <path d="M0 96L30 62l25 13 25-26 25 18 25-28 25 20L200 48V96Z" fill="#4c1d95" opacity=".8"/>
        <line x1="90" y1="62" x2="90" y2="52" stroke="white" strokeWidth="1" opacity=".7"/>
        <path d="M90 52 L97 56 L90 60Z" fill="#f97316" opacity=".9"/>
      </svg>
      <div className="absolute inset-0" style={{ background:"linear-gradient(135deg,rgba(79,46,229,0.5),rgba(124,58,237,0.4))" }}/>
      <div className="absolute inset-0 flex flex-col justify-end p-3">
        <p className="text-[11px] font-medium leading-[1.4] mb-0.5"
          style={{ color:"rgba(255,255,255,0.9)" }}>
          {quote.text} ✨
        </p>
        <p className="text-[9px]" style={{ color:"rgba(255,255,255,0.4)" }}>{quote.attr}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ name, email, onSignOut, mobile, onClose }: {
  name: string; email: string; onSignOut: () => void;
  mobile?: boolean; onClose?: () => void;
}) {
  const pathname = usePathname();
  const initials = name.slice(0,2).toUpperCase();

  return (
    <aside className={`flex flex-col bg-white border-r border-gray-100 ${mobile ? "w-full h-full" : "w-[220px] shrink-0"}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-[13px] border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image src="/logo/dp-mono.svg" alt="Draftpace" width={32} height={32} className="shrink-0"/>
          <div>
            <span className="text-[14px] font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors block leading-none">
              Draftpace
            </span>
            <span className="text-[9px] text-gray-400 leading-none">Momentum OS</span>
          </div>
        </Link>
        {mobile && onClose && (
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Icon path={ICONS.close} size={15}/>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2 py-3 border-b border-gray-100">
        {NAV_ITEMS.map(({ label, path, href }) => {
          const isActive = pathname === href;
          return (
            <Link key={label} href={href} onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all
                ${isActive ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium"}`}>
              <Icon path={path} size={15} color={isActive ? "#4f46e5" : "currentColor"}/>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Active / upcoming planners */}
      <div className="px-2 py-3 flex-1 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-2">
          {CONFIG.PLANNERS_READY ? "Active now" : "Coming soon"}
        </p>
        {UPCOMING.map((item) => (
          <div key={item.id}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-400 cursor-default">
            <div className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: CONFIG.PLANNERS_READY ? item.barColor : "#d1d5db" }}/>
            <span className="truncate flex-1">{item.title}</span>
            {CONFIG.PLANNERS_READY
              ? <span className="text-[10px] font-semibold shrink-0" style={{ color:item.barColor }}>—%</span>
              : <Icon path={ICONS.clock} size={11} color="#d1d5db"/>
            }
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-2 pt-2 border-t border-gray-100">
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all mb-1">
          <Icon path={ICONS.home} size={14}/> Back to site
        </Link>
        <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-indigo-700">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-gray-900 truncate">{name}</p>
            <p className="text-[10px] text-gray-400 truncate">{email}</p>
          </div>
          <button onClick={onSignOut}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-all shrink-0">
            <Icon path={ICONS.logout} size={13}/>
          </button>
        </div>
        <QuoteCard/>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP HEADER (desktop only)
// ─────────────────────────────────────────────────────────────────────────────
function TopHeader({ streak }: { streak?: number }) {
  const dateStr = new Date().toLocaleDateString("en-US",{
    weekday:"long", month:"long", day:"numeric",
  });
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto flex items-center justify-between h-[54px]">
        <div className="flex items-center gap-1.5 text-[12px]">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 font-medium transition-colors">
            Home
          </Link>
          <Icon path="M9 6l6 6-6 6" size={12} color="#d1d5db"/>
          <span className="text-gray-900 font-semibold">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-gray-400 hidden sm:block">{dateStr}</span>
          <div className="h-4 w-px bg-gray-200 hidden sm:block"/>
          {CONFIG.STATS_READY && streak != null ? (
            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#f97316"/>
              </svg>
              <span className="text-[11px] font-semibold text-orange-700">{streak}-day streak</span>
            </div>
          ) : (
            <Skeleton className="w-24 h-6 rounded-full"/>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOTTOM NAV (mobile only)
// ─────────────────────────────────────────────────────────────────────────────
function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100"
      style={{ paddingBottom:"env(safe-area-inset-bottom)" }}>
      <div className="flex items-center h-16 max-w-md mx-auto px-2">
        {BOTTOM_NAV.map(({ label, path, href }) => {
          const isActive = pathname === href;
          return (
            <Link key={label} href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 h-full relative">
              <Icon path={path} size={22} color={isActive ? "#4f46e5" : "#9ca3af"}/>
              <span className="text-[10px] font-medium"
                style={{ color: isActive ? "#4f46e5" : "#9ca3af" }}>
                {label}
              </span>
              {isActive && (
                <motion.div layoutId="bnav-dot"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-600"/>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAK HERO — the #1 retention driver, deserves prominence
// ─────────────────────────────────────────────────────────────────────────────
function StreakHero({ stats }: { stats: Stats }) {
  const dots = [1,1,1,1,1,0.4,0]; // last 7 days — replace with real data
  const isPersonalBest = stats.streak >= stats.personalBest;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 lg:p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-black leading-none tracking-tight"
              style={{ fontSize:"clamp(44px,8vw,60px)", color:"#ea580c" }}>
              {stats.streak}
            </span>
            <span className="text-[18px] font-semibold text-gray-400">day streak</span>
            {isPersonalBest && (
              <span className="text-[11px] font-bold bg-orange-50 border border-orange-200 text-orange-700 px-2 py-0.5 rounded-full">
                Personal best 🏆
              </span>
            )}
          </div>
          <p className="text-[13px] text-gray-400 max-w-xs">
            {getStreakMessage(stats.streak, stats.personalBest)}
          </p>
        </div>
        {/* 7-day bar chart */}
        <div className="flex items-end gap-1.5 shrink-0">
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-3 rounded-sm transition-all"
                style={{
                  height: `${dots[i] === 1 ? 32 : dots[i] === 0.4 ? 20 : 10}px`,
                  background: dots[i] === 1 ? "#f97316" : dots[i] === 0.4 ? "#fed7aa" : "#f3f4f6",
                }}/>
              <span className="text-[8px] text-gray-300 font-medium">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonStreakHero() {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 lg:p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-3 mb-3">
            <Skeleton className="w-20 h-14 rounded-2xl"/>
            <Skeleton className="w-24 h-5"/>
          </div>
          <Skeleton className="w-56 h-3"/>
        </div>
        <div className="flex items-end gap-1.5 shrink-0">
          {[32,20,28,32,24,12,10].map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="w-3 rounded-sm" style={{ height:`${h}px` }}/>
              <Skeleton className="w-2 h-2 rounded"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TODAY'S FOCUS — live version (one planner, chosen automatically)
// ─────────────────────────────────────────────────────────────────────────────
function TodaysFocusCard({ planner }: { planner: ActivePlanner }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
      <div className="h-1 w-full" style={{ background: planner.barColor }}/>
      <div className="p-5 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
              style={{ background:planner.typeBg, color:planner.typeColor, borderColor:planner.typeBorder }}>
              {planner.type}
            </span>
          </div>
          <span className="text-[11px] text-gray-400">{planner.meta}</span>
        </div>

        <h2 className="text-[20px] lg:text-[22px] font-bold text-gray-950 mb-2 leading-tight tracking-tight">
          {planner.title}
        </h2>
        <p className="text-[13px] text-gray-400 italic mb-5 leading-relaxed">
          {planner.context.split(planner.contextHighlight).map((part, i, arr) =>
            i < arr.length - 1 ? (
              <span key={i}>{part}
                <strong className="not-italic font-semibold text-gray-700">
                  {planner.contextHighlight}
                </strong>
              </span>
            ) : part
          )}
        </p>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[12px] text-gray-400">{planner.meta}</span>
            <span className="text-[28px] font-black leading-none tracking-tight"
              style={{ color: planner.barColor }}>
              {planner.progress}%
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: planner.barColor }}
              initial={{ width: 0 }} animate={{ width:`${planner.progress}%` }}
              transition={{ duration: 1, ease:"easeOut" }}/>
          </div>
        </div>

        {/* Micro stats */}
        <div className="flex gap-6 py-4 border-t border-b border-gray-100 mb-4">
          {planner.microStats.map(s => (
            <div key={s.label}>
              <p className="text-[15px] font-bold text-gray-900 leading-none mb-0.5">{s.val}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        <Link href={`/dashboard/planner/${planner.id}`}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: planner.barColor }}>
          {planner.ctaLabel}
          <Icon path={ICONS.arrow} size={13} color="white"/>
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TODAY'S FOCUS — coming soon teaser version
// Shows real planner names in a premium way, not a broken skeleton
// ─────────────────────────────────────────────────────────────────────────────
function TodaysFocusTeaser() {
  const [featured] = UPCOMING;
  const rest = UPCOMING.slice(1);

  return (
    <div className="space-y-3">
      {/* Featured planner — big hero treatment */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden relative">
        <div className="h-1 w-full opacity-30" style={{ background: featured.barColor }}/>

        {/* Decorative background */}
        <div className="absolute right-0 top-0 w-48 h-36 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 200 150" fill="none" className="absolute inset-0 opacity-[0.07]">
            <circle cx="160" cy="30" r="40" fill={featured.barColor}/>
            <path d="M0 150 L60 80 L100 110 L140 50 L180 80 L200 60 L200 150Z"
              fill={featured.barColor} opacity=".6"/>
            <path d="M0 150 L80 90 L120 120 L160 70 L200 90 L200 150Z"
              fill={featured.barColor} opacity=".5"/>
          </svg>
        </div>

        <div className="relative p-5 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
              style={{ background:featured.typeBg, color:featured.typeColor, borderColor:featured.typeBorder }}>
              {featured.type}
            </span>
            <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Icon path={ICONS.clock} size={9} color="#9ca3af"/> Launching soon
            </span>
          </div>

          <h2 className="text-[20px] lg:text-[22px] font-bold text-gray-950 mb-2 leading-tight tracking-tight">
            {featured.title}
          </h2>
          <p className="text-[13px] text-gray-400 mb-5 leading-relaxed">{featured.description}</p>

          {/* Skeleton progress */}
          <div className="mb-5 opacity-35">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-[12px] text-gray-300">{featured.duration}</span>
              <span className="text-[28px] font-black leading-none text-gray-200">—%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full"/>
          </div>

          {/* Skeleton micro stats */}
          <div className="flex gap-6 py-4 border-t border-b border-gray-100 mb-4 opacity-35">
            {[1,2,3].map(n => (
              <div key={n}>
                <Skeleton className="w-10 h-4 mb-1"/>
                <Skeleton className="w-14 h-2.5"/>
              </div>
            ))}
          </div>

          <button disabled
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-bold text-gray-400 bg-gray-100 cursor-not-allowed">
            <Icon path={ICONS.clock} size={13} color="#9ca3af"/>
            Coming soon
          </button>
        </div>
      </div>

      {/* Remaining planners — compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rest.map((item) => (
          <div key={item.id}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="h-[3px] opacity-30" style={{ background: item.barColor }}/>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{ background:item.typeBg, color:item.typeColor, borderColor:item.typeBorder }}>
                  {item.type}
                </span>
                <Icon path={ICONS.clock} size={11} color="#d1d5db"/>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">{item.description}</p>
              <div className="h-1.5 bg-gray-100 rounded-full opacity-50"/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUICK STATS ROW (shown when STATS_READY)
// ─────────────────────────────────────────────────────────────────────────────
function QuickStatsRow({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { val: stats.active.toString(),    label:"Active",     color:"#4f46e5", bg:"#eef2ff", border:"#c7d2fe" },
        { val: stats.completed.toString(), label:"Shipped",    color:"#059669", bg:"#ecfdf5", border:"#bbf7d0" },
        { val: `${stats.thisWeek} days`,   label:"This week",  color:"#7c3aed", bg:"#fdf4ff", border:"#ddd6fe" },
      ].map(s => (
        <div key={s.label}
          className="rounded-2xl px-4 py-3 border text-center"
          style={{ background:s.bg, borderColor:s.border }}>
          <p className="text-[20px] font-black leading-none mb-0.5 tracking-tight"
            style={{ color:s.color }}>
            {s.val}
          </p>
          <p className="text-[10px] font-medium" style={{ color:s.color, opacity:0.7 }}>
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function SkeletonQuickStats() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1,2,3].map(n => (
        <div key={n} className="bg-white border border-gray-100 rounded-2xl px-4 py-3">
          <Skeleton className="w-10 h-6 mb-1.5 mx-auto"/>
          <Skeleton className="w-14 h-2.5 mx-auto"/>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAUSED NUDGE (shown only when data ready + paused planners exist)
// ─────────────────────────────────────────────────────────────────────────────
function PausedNudge({ planner }: { planner: PausedNudge }) {
  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
        <Icon path={ICONS.pause} size={16} color="#f59e0b"/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 truncate">{planner.title}</p>
        <p className="text-[11px] text-gray-400">
          Paused {planner.daysAgo} days ago · {planner.progress}% done — pick up where you left off
        </p>
        <div className="h-1.5 bg-amber-100 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full"
            style={{ width:`${planner.progress}%` }}/>
        </div>
      </div>
      <Link href={`/dashboard/planner/${planner.id}`}
        className="shrink-0 px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors">
        Resume
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("there");
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── When CONFIG flags = true, uncomment and wire these ──
  // const [stats, setStats] = useState<Stats | null>(null);
  // const [todaysFocus, setTodaysFocus] = useState<ActivePlanner | null>(null);
  // const [pausedNudge, setPausedNudge] = useState<PausedNudge | null>(null);
  //
  // useEffect(() => {
  //   if (!CONFIG.STATS_READY) return;
  //   // fetch from Supabase: user_streaks, user_planners
  // }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      setUserName(
        session.user.user_metadata?.display_name ||
        session.user.email?.split("@")[0] || "there"
      );
      setUserEmail(session.user.email || "");
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const firstName = userName.split(" ")[0];

  // Mock data — remove these when real data is wired
  const mockStats: Stats = { streak:12, personalBest:21, active:3, completed:7, thisWeek:5 };
  const mockFocus: ActivePlanner = {
    id:"1", title:"Monthly Budget Reset",
    type:"Planner", typeColor:"#4338ca", typeBg:"#eef2ff", typeBorder:"#c7d2fe",
    progress:68, barColor:"#4f46e5",
    meta:"Day 14 of 30",
    context:"You're past the halfway mark — most people quit by day 10. The next 16 days are where it becomes real.",
    contextHighlight:"past the halfway mark",
    ctaLabel:"Pick up where you left off",
    microStats:[
      { val:"$1,720", label:"saved so far" },
      { val:"3 goals", label:"on track"    },
      { val:"$280",   label:"to target"    },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Image src="/logo/dp-mono.svg" alt="Draftpace" width={36} height={36}/>
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fafaf9] overflow-hidden">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full">
        <Sidebar name={userName} email={userEmail} onSignOut={handleSignOut}/>
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 lg:hidden"
            style={{ background:"rgba(0,0,0,0.35)" }}
            onClick={() => setSidebarOpen(false)}>
            <motion.div initial={{ x:-260 }} animate={{ x:0 }} exit={{ x:-260 }}
              transition={{ type:"spring", damping:28, stiffness:220 }}
              className="absolute left-0 top-0 bottom-0 w-64"
              onClick={e => e.stopPropagation()}>
              <Sidebar name={userName} email={userEmail} onSignOut={handleSignOut}
                mobile onClose={() => setSidebarOpen(false)}/>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto">

        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <Image src="/logo/dp-mono.svg" alt="Draftpace" width={30} height={30}/>
            <Link href="/dashboard/settings"
              className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-indigo-700">
                {firstName.slice(0,2).toUpperCase()}
              </span>
            </Link>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block">
          <TopHeader streak={CONFIG.STATS_READY ? mockStats.streak : undefined}/>
        </div>

        {/* Content */}
        <div className="px-4 lg:px-8 py-5 lg:py-7 max-w-3xl mx-auto w-full space-y-4 lg:space-y-5 pb-24 lg:pb-10">

          {/* ── GREETING ── */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.4 }}>
            <p className="text-[12px] text-gray-400 mb-0.5">{getGreeting()}</p>
            <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-950 leading-none tracking-tight mb-1.5">
              {firstName} 👋
            </h1>
            <p className="text-[13px] text-gray-400">{getDayContext()}</p>
          </motion.div>

          {/* ── STREAK HERO ── */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.4, delay:0.05 }}>
            {CONFIG.STATS_READY
              ? <StreakHero stats={mockStats}/> // replace mockStats with real state
              : <SkeletonStreakHero/>
            }
          </motion.div>

          {/* ── TODAY'S FOCUS ── */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.4, delay:0.1 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-gray-900">Today's focus</h2>
              {!CONFIG.PLANNERS_READY && (
                <Link href="/dashboard/explore"
                  className="text-[12px] font-medium text-indigo-600 hover:underline flex items-center gap-1">
                  Browse planners <Icon path={ICONS.arrow} size={11} color="#4f46e5"/>
                </Link>
              )}
            </div>

            {CONFIG.PLANNERS_READY
              ? <TodaysFocusCard planner={mockFocus}/> // replace mockFocus with real state
              : <TodaysFocusTeaser/>
            }
          </motion.div>

          {/* ── QUICK STATS ── */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.4, delay:0.15 }}>
            {CONFIG.STATS_READY
              ? <QuickStatsRow stats={mockStats}/>
              : <SkeletonQuickStats/>
            }
          </motion.div>

          {/* ── PAUSED NUDGE — only shown when live + paused planners exist ── */}
          {CONFIG.PLANNERS_READY && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.3, delay:0.2 }}>
              {/* Replace with real paused planner check */}
              {/* {pausedNudge && <PausedNudge planner={pausedNudge}/>} */}
            </motion.div>
          )}

          {/* ── UPGRADE BANNER ── */}
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.4, delay:0.2 }}>
            <div className="relative rounded-2xl overflow-hidden px-5 lg:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              style={{ background:"linear-gradient(135deg,#e0e7ff,#ede9fe,#fce7f3)", border:"1px solid rgba(99,102,241,0.15)" }}>
              <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{ backgroundImage:"radial-gradient(circle,#4f46e5 1px,transparent 1px)", backgroundSize:"20px 20px" }}/>
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">
                  Unlock everything
                </p>
                <p className="text-[15px] lg:text-[17px] font-bold text-gray-950 tracking-tight leading-tight mb-0.5">
                  200+ planners waiting.{" "}
                  <span className="text-indigo-600">$7/mo unlocks all.</span>
                </p>
                <p className="text-[12px] text-gray-500">Cancel anytime. No tricks.</p>
              </div>
              <Link href="/pricing"
                className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all shrink-0 w-full sm:w-auto justify-center">
                See plans
                <Icon path={ICONS.arrow} size={12} color="white"/>
              </Link>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav/>
      </div>

    </div>
  );
}
