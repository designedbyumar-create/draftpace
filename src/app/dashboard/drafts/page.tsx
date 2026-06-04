"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  PLANNERS_READY:  false, // true → show real active/paused/completed/locked
  PURCHASES_READY: false, // true → show real purchase history from Supabase
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// UPCOMING (same as dashboard — update when planners are uploaded)
// ─────────────────────────────────────────────────────────────────────────────
const UPCOMING = [
  { id:"1", title:"Monthly Budget Reset",  type:"Planner",   barColor:"#4f46e5", typeColor:"#4338ca", typeBg:"#eef2ff", typeBorder:"#c7d2fe", description:"Track every dollar, reset every month.", duration:"30 days",  iconPath:"M3 3h18v18H3z M9 9h6M9 12h6M9 15h4" },
  { id:"2", title:"30-Day Habit Builder",  type:"Checklist", barColor:"#7c3aed", typeColor:"#6d28d9", typeBg:"#fdf4ff", typeBorder:"#ddd6fe", description:"Build any habit with daily check-ins.", duration:"30 days",  iconPath:"M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" },
  { id:"3", title:"Savings Goal — $5,000", type:"Guide",     barColor:"#0d9488", typeColor:"#0f766e", typeBg:"#f0fdfa", typeBorder:"#99f6e4", description:"Hit any savings target with weekly tracking.", duration:"12 weeks", iconPath:"M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
];

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface ActivePlanner {
  id:string; title:string; type:string;
  typeColor:string; typeBg:string; typeBorder:string;
  progress:number; barColor:string; meta:string; lastOpened:string;
  streakBadge:string; streakBg:string; streakColor:string; streakBorder:string;
  context:string; contextHighlight:string;
  microStats:{ val:string; label:string }[];
  ctaLabel:string; ctaSecLabel?:string;
  iconPath:string;
}

interface CompletedPlanner {
  id:string; title:string; type:string;
  typeColor:string; typeBg:string; typeBorder:string;
  completedDate:string; daysToFinish:number; barColor:string;
}

interface PausedPlanner {
  id:string; title:string; type:string;
  typeColor:string; typeBg:string; typeBorder:string;
  progress:number; barColor:string;
  pausedAgo:string; pausedDate:string; nudgeCopy:string;
}

interface LockedPlanner {
  id:string; title:string; type:string;
  typeColor:string; typeBg:string; typeBorder:string;
  rating:number; price:number;
}

interface Purchase {
  id:string; planner_id:string; title:string; type:string;
  source:"gumroad"|"etsy"|"manual"; amount:number; purchased_at:string;
  status:"active"|"completed"|"not_started";
  typeColor:string; typeBg:string; typeBorder:string;
  barColor:string; progress:number;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — replace with Supabase queries when CONFIG flags = true
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_ACTIVE: ActivePlanner[] = [
  { id:"1", title:"Monthly Budget Reset", type:"Planner", typeColor:"#4338ca", typeBg:"#eef2ff", typeBorder:"#c7d2fe", barColor:"#4f46e5", progress:68, meta:"Day 14 of 30", lastOpened:"today", streakBadge:"14-day streak — your best run yet", streakBg:"#fff7ed", streakColor:"#ea580c", streakBorder:"#fed7aa", context:"You're past the halfway mark — most people quit by day 10. The next 16 days are where it becomes real.", contextHighlight:"past the halfway mark", microStats:[{val:"$1,720",label:"saved so far"},{val:"3 goals",label:"on track"},{val:"$280",label:"to target"}], ctaLabel:"Pick up where you left off", ctaSecLabel:"Skip today", iconPath:"M3 3h18v18H3z M9 9h6M9 12h6M9 15h4" },
  { id:"2", title:"30-Day Habit Builder",  type:"Checklist", typeColor:"#6d28d9", typeBg:"#fdf4ff", typeBorder:"#ddd6fe", barColor:"#7c3aed", progress:53, meta:"Day 16 of 30", lastOpened:"yesterday", streakBadge:"16 habits checked off", streakBg:"#fdf4ff", streakColor:"#6d28d9", streakBorder:"#ddd6fe", context:"Today's focus: Review last week's patterns. Evenings are slipping — 5 minutes is all it takes.", contextHighlight:"Review last week's patterns", microStats:[{val:"16 of 30",label:"days done"},{val:"3 habits",label:"tracked"},{val:"14 left",label:"to finish"}], ctaLabel:"Check in for today", ctaSecLabel:"Remind me later", iconPath:"M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" },
  { id:"3", title:"Savings Goal — $5,000", type:"Guide",     typeColor:"#0f766e", typeBg:"#f0fdfa", typeBorder:"#99f6e4", barColor:"#0d9488", progress:41, meta:"$2,050 of $5,000", lastOpened:"2 days ago", streakBadge:"On pace — $416/week", streakBg:"#f0fdfa", streakColor:"#0f766e", streakBorder:"#99f6e4", context:"Week 6 of 12. At this rate you'll hit $5,000 by Jan 15th. One contribution this week keeps you on track.", contextHighlight:"Jan 15th", microStats:[{val:"$2,050",label:"saved"},{val:"$2,950",label:"remaining"},{val:"Jan 15",label:"projected"}], ctaLabel:"Log this week's contribution", ctaSecLabel:"View breakdown", iconPath:"M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
];

const MOCK_COMPLETED: CompletedPlanner[] = [
  { id:"4", title:"Q3 Life Audit",            type:"Guide",     typeColor:"#065f46", typeBg:"#ecfdf5", typeBorder:"#bbf7d0", barColor:"#059669", completedDate:"September 30", daysToFinish:18 },
  { id:"5", title:"Morning Routine Checklist",type:"Checklist", typeColor:"#065f46", typeBg:"#ecfdf5", typeBorder:"#bbf7d0", barColor:"#059669", completedDate:"October 14",   daysToFinish:7  },
  { id:"6", title:"Side Hustle Starter",      type:"eBook",     typeColor:"#065f46", typeBg:"#ecfdf5", typeBorder:"#bbf7d0", barColor:"#059669", completedDate:"November 1",   daysToFinish:5  },
  { id:"c4",title:"Budget Reset — Oct",       type:"Planner",   typeColor:"#065f46", typeBg:"#ecfdf5", typeBorder:"#bbf7d0", barColor:"#059669", completedDate:"October 31",   daysToFinish:30 },
];

const MOCK_PAUSED: PausedPlanner[] = [
  { id:"7", title:"Annual Life Audit",    type:"Guide",   typeColor:"#92400e", typeBg:"#fff7ed", typeBorder:"#fde68a", barColor:"#f59e0b", progress:34, pausedAgo:"3 weeks ago", pausedDate:"October 9",  nudgeCopy:"You're 34% through. The good news — you've done the hard part. 66% left." },
  { id:"8", title:"Fitness Tracker — Nov",type:"Planner", typeColor:"#92400e", typeBg:"#fff7ed", typeBorder:"#fde68a", barColor:"#f59e0b", progress:18, pausedAgo:"1 week ago",  pausedDate:"November 4", nudgeCopy:"You were building momentum before you stopped. 7 days is still recoverable." },
];

const MOCK_LOCKED: LockedPlanner[] = [
  { id:"9",  title:"Deep Work Weekly Planner", type:"Planner", typeColor:"#6b7280", typeBg:"#f9fafb", typeBorder:"#e5e7eb", rating:4.9, price:12 },
  { id:"10", title:"Anxiety Reset Journal",    type:"eBook",   typeColor:"#6b7280", typeBg:"#f9fafb", typeBorder:"#e5e7eb", rating:4.9, price:12 },
  { id:"11", title:"Financial Independence",   type:"Planner", typeColor:"#6b7280", typeBg:"#f9fafb", typeBorder:"#e5e7eb", rating:4.8, price:15 },
];

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const Icon = ({ path, size=16, color="currentColor" }: { path:string; size?:number; color?:string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
  trophy:    "M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0012 0V2z",
  pause:     "M10 4H6v16h4V4zM18 4h-4v16h4V4z",
  lock:      "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  bookmark:  "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z",
  link:      "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  plus:      "M12 5v14M5 12h14",
  refresh:   "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  mail:      "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
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

type DraftsTab = "In Progress" | "Wins" | "Saved" | "Purchases";

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────
function Skeleton({ className="" }: { className?:string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`}/>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ name, email, onSignOut, mobile, onClose }: {
  name:string; email:string; onSignOut:()=>void; mobile?:boolean; onClose?:()=>void;
}) {
  const pathname = usePathname();
  const initials = name.slice(0,2).toUpperCase();
  return (
    <aside className={`flex flex-col bg-white border-r border-gray-100 ${mobile?"w-full h-full":"w-[220px] shrink-0"}`}>
      <div className="flex items-center justify-between px-4 py-[13px] border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image src="/logo/dp-mono.svg" alt="Draftpace" width={32} height={32} className="shrink-0"/>
          <div>
            <span className="text-[14px] font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors block leading-none">Draftpace</span>
            <span className="text-[9px] text-gray-400 leading-none">Momentum OS</span>
          </div>
        </Link>
        {mobile && onClose && (
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Icon path={ICONS.close} size={15}/>
          </button>
        )}
      </div>
      <nav className="flex flex-col gap-0.5 px-2 py-3 border-b border-gray-100">
        {NAV_ITEMS.map(({ label, path, href }) => {
          const isActive = pathname === href;
          return (
            <Link key={label} href={href} onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${isActive?"bg-indigo-50 text-indigo-600 font-semibold":"text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium"}`}>
              <Icon path={path} size={15} color={isActive?"#4f46e5":"currentColor"}/>
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 py-3 flex-1 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-2">
          {CONFIG.PLANNERS_READY ? "Active now" : "Coming soon"}
        </p>
        {UPCOMING.map(item => (
          <div key={item.id} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-400 cursor-default">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:"#d1d5db" }}/>
            <span className="truncate flex-1">{item.title}</span>
            <Icon path={ICONS.clock} size={11} color="#d1d5db"/>
          </div>
        ))}
      </div>
      <div className="px-2 pt-2 pb-3 border-t border-gray-100">
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all mb-1">
          <Icon path={ICONS.home} size={14}/> Back to site
        </Link>
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-indigo-700">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-gray-900 truncate">{name}</p>
            <p className="text-[10px] text-gray-400 truncate">{email}</p>
          </div>
          <button onClick={onSignOut} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-all shrink-0">
            <Icon path={ICONS.logout} size={13}/>
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOTTOM NAV
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
            <Link key={label} href={href} className="flex-1 flex flex-col items-center justify-center gap-1 h-full relative">
              <Icon path={path} size={22} color={isActive?"#4f46e5":"#9ca3af"}/>
              <span className="text-[10px] font-medium" style={{ color:isActive?"#4f46e5":"#9ca3af" }}>{label}</span>
              {isActive && <motion.div layoutId="bnav-dot" className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-600"/>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE PLANNER CARD (In Progress tab)
// ─────────────────────────────────────────────────────────────────────────────
function ActiveCard({ item, i }: { item:ActivePlanner; i:number }) {
  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:i*0.06, duration:0.25 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="h-[3px] w-full" style={{ background:item.barColor }}/>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background:item.typeBg }}>
              <Icon path={item.iconPath} size={14} color={item.typeColor}/>
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
              style={{ background:item.typeBg, color:item.typeColor, borderColor:item.typeBorder }}>
              {item.type}
            </span>
          </div>
          <span className="text-[11px] text-gray-400">{item.lastOpened}</span>
        </div>
        <h3 className="text-[17px] font-semibold text-gray-950 mb-3 leading-snug">{item.title}</h3>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border mb-3"
          style={{ background:item.streakBg, color:item.streakColor, borderColor:item.streakBorder }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill={item.streakColor}/></svg>
          {item.streakBadge}
        </div>
        <p className="text-[12px] text-gray-500 italic leading-relaxed mb-4">
          {item.context.split(item.contextHighlight).map((part, idx, arr) =>
            idx < arr.length-1 ? (
              <span key={idx}>{part}<strong className="not-italic font-semibold text-gray-800">{item.contextHighlight}</strong></span>
            ) : part
          )}
        </p>
        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-[11px] text-gray-400">{item.meta}</span>
            <span className="text-[20px] font-bold leading-none" style={{ color:item.barColor }}>{item.progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background:item.barColor }}
              initial={{ width:0 }} animate={{ width:`${item.progress}%` }}
              transition={{ delay:i*0.06+0.15, duration:0.8, ease:"easeOut" }}/>
          </div>
        </div>
        <div className="flex gap-5 pb-4 border-b border-gray-100 mb-4">
          {item.microStats.map(s => (
            <div key={s.label}>
              <p className="text-[14px] font-semibold text-gray-900 leading-none mb-0.5">{s.val}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/planner/${item.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background:item.barColor }}>
            {item.ctaLabel} <Icon path={ICONS.arrow} size={12} color="white"/>
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

// ─────────────────────────────────────────────────────────────────────────────
// PAUSED CARD (In Progress tab)
// ─────────────────────────────────────────────────────────────────────────────
function PausedCard({ item, i }: { item:PausedPlanner; i:number }) {
  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:i*0.05, duration:0.25 }}
      className="bg-white border border-amber-200 rounded-2xl overflow-hidden">
      <div className="h-[3px] bg-amber-400"/>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <Icon path={ICONS.pause} size={14} color="#f59e0b"/>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">{item.title}</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 inline-block"
                style={{ background:item.typeBg, color:item.typeColor, borderColor:item.typeBorder }}>
                {item.type}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
            Paused {item.pausedAgo}
          </span>
        </div>
        <p className="text-[12px] text-gray-500 italic mb-3 leading-relaxed">{item.nudgeCopy}</p>
        <div className="flex gap-5 p-3 bg-amber-50 rounded-xl mb-4">
          <div><p className="text-[13px] font-semibold text-gray-900">{item.pausedDate}</p><p className="text-[10px] text-gray-400">last opened</p></div>
          <div className="w-px bg-amber-200"/>
          <div><p className="text-[13px] font-semibold text-gray-900">{item.progress}%</p><p className="text-[10px] text-gray-400">completed</p></div>
          <div className="w-px bg-amber-200"/>
          <div><p className="text-[13px] font-semibold text-gray-900">{100-item.progress}%</p><p className="text-[10px] text-gray-400">remaining</p></div>
        </div>
        <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden mb-4">
          <motion.div className="h-full bg-amber-400 rounded-full"
            initial={{ width:0 }} animate={{ width:`${item.progress}%` }}
            transition={{ delay:i*0.05+0.2, duration:0.7, ease:"easeOut" }}/>
        </div>
        <Link href={`/dashboard/planner/${item.id}`}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-all">
          Resume where you left off <Icon path={ICONS.arrow} size={12} color="white"/>
        </Link>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCKED ROW (In Progress tab)
// ─────────────────────────────────────────────────────────────────────────────
function LockedRow({ item }: { item:LockedPlanner }) {
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3.5 opacity-60 hover:opacity-80 transition-opacity">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <Icon path={ICONS.lock} size={14} color="#9ca3af"/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-700 truncate">{item.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
            style={{ background:item.typeBg, color:item.typeColor, borderColor:item.typeBorder }}>
            {item.type}
          </span>
          <span className="text-[10px] text-gray-400">★ {item.rating}</span>
        </div>
      </div>
      <Link href="/pricing"
        className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
        ${item.price} · Unlock
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IN PROGRESS TAB
// ─────────────────────────────────────────────────────────────────────────────
function InProgressTab() {
  if (!CONFIG.PLANNERS_READY) {
    return (
      <div className="space-y-4">
        {/* Coming soon callout */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="white"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-indigo-900">Your planners are almost ready</p>
              <p className="text-[12px] text-indigo-600">We're loading your collection. Stay tuned.</p>
            </div>
          </div>
          <Link href="/dashboard/explore"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-indigo-600 hover:underline">
            Browse Explore to find planners <Icon path={ICONS.arrow} size={11} color="#4f46e5"/>
          </Link>
        </div>

        {/* Teaser cards */}
        <div>
          <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Coming soon</p>
          <div className="flex flex-col gap-3">
            {UPCOMING.map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.06 }}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="h-[3px] opacity-30" style={{ background:item.barColor }}/>
                <div className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 opacity-50"
                    style={{ background:item.typeBg }}>
                    <Icon path={item.iconPath} size={15} color={item.typeColor}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-gray-400">{item.duration} · {item.type}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
                    <Icon path={ICONS.clock} size={10} color="#9ca3af"/>
                    <span className="text-[10px] font-medium text-gray-400">Soon</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { val:MOCK_ACTIVE.length,    label:"Active",  color:"#4f46e5", bg:"#eef2ff", border:"#c7d2fe" },
          { val:MOCK_COMPLETED.length, label:"Shipped", color:"#059669", bg:"#ecfdf5", border:"#bbf7d0" },
          { val:MOCK_PAUSED.length,    label:"Paused",  color:"#f59e0b", bg:"#fef3c7", border:"#fde68a" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 border text-center"
            style={{ background:s.bg, borderColor:s.border }}>
            <p className="text-[22px] font-black leading-none mb-0.5 tracking-tight" style={{ color:s.color }}>{s.val}</p>
            <p className="text-[10px] font-medium" style={{ color:s.color, opacity:0.7 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active planners */}
      {MOCK_ACTIVE.length > 0 && (
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-3">Continue</p>
          <div className="flex flex-col gap-3">
            {MOCK_ACTIVE.map((item, i) => <ActiveCard key={item.id} item={item} i={i}/>)}
          </div>
        </div>
      )}

      {/* Paused planners */}
      {MOCK_PAUSED.length > 0 && (
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-3">Pick up again</p>
          <div className="flex flex-col gap-3">
            {MOCK_PAUSED.map((item, i) => <PausedCard key={item.id} item={item} i={i}/>)}
          </div>
        </div>
      )}

      {/* Locked planners */}
      {MOCK_LOCKED.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Unlock to start</p>
            <Link href="/pricing" className="text-[12px] font-medium text-indigo-600">$7/mo unlocks all</Link>
          </div>
          <div className="flex flex-col gap-2">
            {MOCK_LOCKED.map(item => <LockedRow key={item.id} item={item}/>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WINS TAB
// ─────────────────────────────────────────────────────────────────────────────
function WinsTab() {
  if (!CONFIG.PLANNERS_READY || MOCK_COMPLETED.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Icon path={ICONS.trophy} size={28} color="#059669"/>
        </div>
        <h3 className="text-[17px] font-bold text-gray-900 mb-2">Your wins show up here</h3>
        <p className="text-[13px] text-gray-400 max-w-xs mx-auto mb-6 leading-relaxed">
          Every planner you complete gets its own entry here. Finish one and it appears instantly.
        </p>
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all">
          Go to Today's Focus <Icon path={ICONS.arrow} size={12} color="white"/>
        </Link>
      </div>
    );
  }

  const totalDays = MOCK_COMPLETED.reduce((sum, p) => sum + p.daysToFinish, 0);

  return (
    <div className="space-y-4">
      {/* Trophy room hero */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
        className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center">
        <div className="text-[52px] font-black leading-none text-emerald-600 mb-1">{MOCK_COMPLETED.length}</div>
        <div className="text-[16px] font-semibold text-gray-900 mb-1">planners shipped</div>
        <div className="text-[13px] text-emerald-600 mb-4">You're in the top 5% of finishers</div>
        <div className="flex justify-center gap-8 pt-4 border-t border-emerald-200">
          <div>
            <p className="text-[20px] font-black text-gray-900">{totalDays}</p>
            <p className="text-[11px] text-gray-400">total days</p>
          </div>
          <div>
            <p className="text-[20px] font-black text-gray-900">
              {Math.round(totalDays / MOCK_COMPLETED.length)}
            </p>
            <p className="text-[11px] text-gray-400">avg per planner</p>
          </div>
          <div>
            <p className="text-[20px] font-black text-gray-900">100%</p>
            <p className="text-[11px] text-gray-400">completion rate</p>
          </div>
        </div>
      </motion.div>

      {/* Wins list */}
      <div className="flex flex-col gap-3">
        {MOCK_COMPLETED.map((item, i) => (
          <motion.div key={item.id}
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:i*0.05 }}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all">
            <div className="h-[3px] bg-emerald-500"/>
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                {i === 0
                  ? <Icon path={ICONS.trophy} size={17} color="#059669"/>
                  : <Icon path={ICONS.check} size={15} color="#059669"/>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-gray-900 truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
                    style={{ background:item.typeBg, color:item.typeColor, borderColor:item.typeBorder }}>
                    {item.type}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {item.completedDate} · {item.daysToFinish} days
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Shipped ✓
                </span>
                <Link href={`/dashboard/planner/${item.id}`}
                  className="text-[11px] text-gray-400 hover:text-indigo-600 transition-colors">
                  Review →
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVED TAB
// ─────────────────────────────────────────────────────────────────────────────
function SavedTab() {
  // ── TODO: when PLANNERS_READY, show real saved/wishlist planners ──
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto mb-4">
        <Icon path={ICONS.bookmark} size={28} color="#7c3aed"/>
      </div>
      <h3 className="text-[17px] font-bold text-gray-900 mb-2">Your wishlist lives here</h3>
      <p className="text-[13px] text-gray-400 max-w-xs mx-auto mb-6 leading-relaxed">
        Save planners from Explore to come back to later. They'll appear here so you never lose track of what caught your eye.
      </p>
      <Link href="/dashboard/explore"
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all">
        Browse Explore <Icon path={ICONS.arrow} size={12} color="white"/>
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL ADD MODAL (Purchases tab)
// ─────────────────────────────────────────────────────────────────────────────
function ManualAddModal({ onClose }: { onClose:()=>void }) {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email && !orderId) return;
    setSubmitting(true);
    // TODO: await supabase.functions.invoke("verify-purchase", { body:{ email, orderId } })
    setTimeout(() => { setSubmitting(false); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background:"rgba(0,0,0,0.4)" }} onClick={onClose}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        exit={{ opacity:0, y:20 }} transition={{ duration:0.22 }}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:m-4"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[17px] font-bold text-gray-950">Add purchase manually</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Enter your order email or receipt ID</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <Icon path={ICONS.close} size={15}/>
          </button>
        </div>
        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Purchase email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email used on Gumroad or Etsy"
              className="w-full h-11 bg-gray-50 border border-gray-200 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 text-[14px] text-gray-900 placeholder-gray-400 transition-all"/>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-100"/>
            <span className="text-[11px] text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100"/>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Order / Receipt ID</label>
            <input type="text" value={orderId} onChange={e => setOrderId(e.target.value)}
              placeholder="e.g. GR-123456789"
              className="w-full h-11 bg-gray-50 border border-gray-200 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 text-[14px] text-gray-900 placeholder-gray-400 transition-all"/>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={submitting || (!email && !orderId)}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-[14px]">
          {submitting ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Verifying...</>
          ) : (
            <><Icon path={ICONS.check} size={14} color="white"/> Verify purchase</>
          )}
        </button>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PURCHASES TAB
// ─────────────────────────────────────────────────────────────────────────────
function PurchasesTab() {
  const [showManual, setShowManual] = useState(false);

  // ── TODO: replace with real purchases from Supabase ──
  const purchases: Purchase[] = [];

  const handleGumroad = () => {
    // TODO: implement Gumroad OAuth
    alert("Gumroad integration coming soon!");
  };
  const handleEtsy = () => {
    // TODO: implement Etsy OAuth
    alert("Etsy integration coming soon!");
  };

  return (
    <>
      <div className="space-y-4">
        {/* Connect sources */}
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-3">Connect your stores</p>
          <div className="flex flex-col gap-2.5">
            <button onClick={handleGumroad}
              className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition-all text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:"#fff0f7" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#ff90e8"/>
                  <text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="#000">G</text>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-gray-900">Gumroad</p>
                <p className="text-[12px] text-gray-400">Auto-import all your purchases</p>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full shrink-0">Connect</span>
            </button>

            <button onClick={handleEtsy}
              className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition-all text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:"#fff7ed" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#f56400"/>
                  <text x="12" y="16.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">E</text>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-gray-900">Etsy</p>
                <p className="text-[12px] text-gray-400">Sync your digital downloads</p>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full shrink-0">Connect</span>
            </button>

            <button onClick={() => setShowManual(true)}
              className="flex items-center gap-4 p-4 bg-white border border-dashed border-gray-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left">
              <div className="w-10 h-10 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center shrink-0">
                <Icon path={ICONS.plus} size={18} color="#9ca3af"/>
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-gray-700">Add manually</p>
                <p className="text-[12px] text-gray-400">Enter order email or receipt ID</p>
              </div>
              <Icon path={ICONS.arrow} size={14} color="#9ca3af"/>
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="text-[13px] font-semibold text-gray-800 mb-4">How it works</p>
          <div className="flex flex-col gap-4">
            {[
              { icon:ICONS.star,   color:"#4f46e5", bg:"#eef2ff", title:"Buy on Gumroad or Etsy",  desc:"Purchase any planner from our store" },
              { icon:ICONS.link,   color:"#0d9488", bg:"#f0fdfa", title:"Connect your account",     desc:"Link your store in one tap" },
              { icon:ICONS.check,  color:"#059669", bg:"#ecfdf5", title:"Opens in Draftpace",        desc:"Track progress, build streaks" },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:item.bg }}>
                  <Icon path={item.icon} size={15} color={item.color}/>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900 mb-0.5">{item.title}</p>
                  <p className="text-[12px] text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase list — empty state */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-semibold text-gray-800">Your purchases</p>
            {purchases.length > 0 && (
              <button className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
                <Icon path={ICONS.refresh} size={13}/> Sync
              </button>
            )}
          </div>

          {purchases.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Icon path="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0" size={22} color="#9ca3af"/>
              </div>
              <p className="text-[14px] font-semibold text-gray-900 mb-1">No purchases yet</p>
              <p className="text-[12px] text-gray-400">Connect Gumroad or Etsy above and your purchases will appear here automatically.</p>
            </div>
          ) : (
            // ── TODO: replace with real purchase list ──
            <div className="flex flex-col gap-2">
              {purchases.map((purchase, i) => (
                <div key={purchase.id}
                  className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background:purchase.typeBg }}>
                    <Icon path={ICONS.drafts} size={15} color={purchase.typeColor}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 truncate">{purchase.title}</p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(purchase.purchased_at).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" })}
                      {purchase.amount > 0 && ` · $${purchase.amount}`}
                      {" · "}{purchase.source.charAt(0).toUpperCase()+purchase.source.slice(1)}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0"
                    style={{
                      background: purchase.status==="completed" ? "#ecfdf5" : "#eef2ff",
                      color:      purchase.status==="completed" ? "#065f46" : "#4338ca",
                      borderColor:purchase.status==="completed" ? "#bbf7d0" : "#c7d2fe",
                    }}>
                    {purchase.status==="completed" ? "Done" : purchase.status==="not_started" ? "Start" : "Active"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showManual && <ManualAddModal onClose={() => setShowManual(false)}/>}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB BAR
// ─────────────────────────────────────────────────────────────────────────────
const TAB_COUNTS: Record<DraftsTab, number> = {
  "In Progress": CONFIG.PLANNERS_READY ? MOCK_ACTIVE.length + MOCK_PAUSED.length : 3,
  "Wins":        CONFIG.PLANNERS_READY ? MOCK_COMPLETED.length : 0,
  "Saved":       0,
  "Purchases":   0,
};

const TAB_COLORS: Record<DraftsTab, { active:string; activeBg:string }> = {
  "In Progress": { active:"#4f46e5", activeBg:"#eef2ff" },
  "Wins":        { active:"#059669", activeBg:"#ecfdf5" },
  "Saved":       { active:"#7c3aed", activeBg:"#fdf4ff" },
  "Purchases":   { active:"#f59e0b", activeBg:"#fef3c7" },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function DraftsPage() {
  const router = useRouter();
  const [loading,     setLoading]     = useState(true);
  const [userName,    setUserName]    = useState("there");
  const [userEmail,   setUserEmail]   = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab,   setActiveTab]   = useState<DraftsTab>("In Progress");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      setUserName(session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "there");
      setUserEmail(session.user.email || "");
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.replace("/"); };
  const firstName = userName.split(" ")[0];

  if (loading) return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Image src="/logo/dp-mono.svg" alt="Draftpace" width={36} height={36}/>
        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    </div>
  );

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
            className="fixed inset-0 z-50 lg:hidden" style={{ background:"rgba(0,0,0,0.35)" }}
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

      <main className="flex-1 overflow-y-auto flex flex-col">

        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <Image src="/logo/dp-mono.svg" alt="Draftpace" width={30} height={30}/>
            <Link href="/dashboard/settings"
              className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-indigo-700">{firstName.slice(0,2).toUpperCase()}</span>
            </Link>
          </div>
        </div>

        {/* Desktop breadcrumb header */}
        <div className="hidden lg:block sticky top-0 z-30 bg-white border-b border-gray-100 px-6 lg:px-8">
          <div className="max-w-3xl mx-auto flex items-center justify-between h-[54px]">
            <div className="flex items-center gap-1.5 text-[12px]">
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 font-medium transition-colors">Home</Link>
              <Icon path="M9 6l6 6-6 6" size={12} color="#d1d5db"/>
              <span className="text-gray-900 font-semibold">Drafts</span>
            </div>
            <p className="text-[12px] text-gray-400">
              {CONFIG.PLANNERS_READY
                ? `${MOCK_ACTIVE.length} active · ${MOCK_COMPLETED.length} shipped`
                : "Your collection"
              }
            </p>
          </div>
        </div>

        {/* Page title — mobile */}
        <div className="lg:hidden px-4 pt-5 pb-0">
          <h1 className="text-[22px] font-bold text-gray-950 leading-none tracking-tight mb-0.5">
            Drafts
          </h1>
          <p className="text-[13px] text-gray-400">
            {CONFIG.PLANNERS_READY
              ? `${MOCK_ACTIVE.length} active · ${MOCK_COMPLETED.length} shipped`
              : "Your collection"
            }
          </p>
        </div>

        {/* Tab bar — sticky below headers */}
        <div className="sticky top-[55px] lg:top-[54px] z-20 bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto flex overflow-x-auto px-4 lg:px-8"
            style={{ scrollbarWidth:"none" }}>
            {(["In Progress","Wins","Saved","Purchases"] as DraftsTab[]).map(tab => {
              const isActive = activeTab === tab;
              const tc = TAB_COLORS[tab];
              const count = TAB_COUNTS[tab];
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-2 px-4 py-3.5 text-[13px] font-semibold border-b-2 whitespace-nowrap transition-all shrink-0"
                  style={{
                    borderBottomColor: isActive ? tc.active : "transparent",
                    color: isActive ? tc.active : "#9ca3af",
                  }}>
                  {tab}
                  {count > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                      style={isActive
                        ? { background:tc.activeBg, color:tc.active }
                        : { background:"#f3f4f6", color:"#9ca3af" }
                      }>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 px-4 lg:px-8 py-5 lg:py-6 max-w-3xl mx-auto w-full pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-4 }} transition={{ duration:0.18 }}>
              {activeTab === "In Progress" && <InProgressTab/>}
              {activeTab === "Wins"        && <WinsTab/>}
              {activeTab === "Saved"       && <SavedTab/>}
              {activeTab === "Purchases"   && <PurchasesTab/>}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav/>
      </div>

    </div>
  );
}
