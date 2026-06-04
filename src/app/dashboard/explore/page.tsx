"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  PLANNERS_READY: false, // true → check user's existing drafts, show personalised recs
} as const;

// IDs the user already has in their Drafts — replace with real Supabase query when ready
// const USER_DRAFT_IDS = new Set(["1","2","3"]); // example
const USER_DRAFT_IDS = new Set(CONFIG.PLANNERS_READY ? ["1","2","3"] : []);

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type Source   = "app" | "gumroad" | "etsy";
type Category = "all" | "money" | "habits" | "mindset" | "productivity";
type SourceFilter = "all" | "app" | "gumroad" | "etsy";

interface ExplorePlanner {
  id: string;
  title: string;
  type: "planner" | "checklist" | "ebook" | "guide";
  category: Exclude<Category, "all">;
  source: Source;
  price: number;          // 0 = free, -1 = membership only, >0 = paid external
  rating: number;
  reviews: number;
  trending: number;       // 0–100 popularity score
  isNew: boolean;
  description: string;
  barColor: string;
  typeColor: string; typeBg: string; typeBorder: string;
  gumroadUrl?: string;
  etsyUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CATALOG DATA
// Replace with Supabase fetch: supabase.from("planners").select("*")
// ─────────────────────────────────────────────────────────────────────────────
const CATALOG: ExplorePlanner[] = [
  // ── FREE IN-APP ──
  { id:"1",  title:"Monthly Budget Reset",          type:"planner",   category:"money",        source:"app",     price:0,   rating:4.8, reviews:1203, trending:94, isNew:false, description:"Track income, expenses, and what's left. Reset every month with real numbers.", barColor:"#4f46e5", typeColor:"#4338ca", typeBg:"#eef2ff", typeBorder:"#c7d2fe" },
  { id:"2",  title:"30-Day Habit Builder",          type:"checklist", category:"habits",       source:"app",     price:0,   rating:4.9, reviews:842,  trending:97, isNew:false, description:"Build any habit in 30 days with daily check-ins and streak tracking.", barColor:"#7c3aed", typeColor:"#6d28d9", typeBg:"#fdf4ff", typeBorder:"#ddd6fe" },
  { id:"3",  title:"Savings Goal — $5,000",         type:"guide",     category:"money",        source:"app",     price:0,   rating:4.7, reviews:531,  trending:85, isNew:true,  description:"Set a target, log contributions, watch your progress bar grow every week.", barColor:"#0d9488", typeColor:"#0f766e", typeBg:"#f0fdfa", typeBorder:"#99f6e4" },
  { id:"9",  title:"30-Day Mood Tracker",           type:"checklist", category:"mindset",      source:"app",     price:0,   rating:4.6, reviews:3201, trending:87, isNew:false, description:"Daily mood logging with pattern detection and weekly reflection prompts.", barColor:"#a855f7", typeColor:"#6d28d9", typeBg:"#fdf4ff", typeBorder:"#ddd6fe" },
  // ── MEMBERSHIP IN-APP ──
  { id:"4",  title:"Deep Work Weekly Planner",      type:"planner",   category:"productivity", source:"app",     price:-1,  rating:4.9, reviews:723,  trending:94, isNew:false, description:"Plan your week around 4-hour deep work blocks with energy mapping and focus scoring.", barColor:"#0d9488", typeColor:"#0f766e", typeBg:"#f0fdfa", typeBorder:"#99f6e4" },
  { id:"7",  title:"Anxiety Reset Journal",         type:"ebook",     category:"mindset",      source:"app",     price:-1,  rating:4.9, reviews:1432, trending:95, isNew:false, description:"Guided exercises for managing anxiety using CBT, ACT, and mindfulness.", barColor:"#a855f7", typeColor:"#6d28d9", typeBg:"#fdf4ff", typeBorder:"#ddd6fe" },
  { id:"10", title:"Financial Independence Planner",type:"planner",   category:"money",        source:"app",     price:-1,  rating:4.9, reviews:921,  trending:93, isNew:false, description:"FI number, savings rate, and net worth tracker — monthly and annual.", barColor:"#059669", typeColor:"#065f46", typeBg:"#ecfdf5", typeBorder:"#bbf7d0" },
  { id:"12", title:"Burnout Recovery Roadmap",      type:"guide",     category:"mindset",      source:"app",     price:-1,  rating:4.8, reviews:672,  trending:83, isNew:true,  description:"An 8-week structured guide to recovering from burnout and rebuilding energy.", barColor:"#a855f7", typeColor:"#6d28d9", typeBg:"#fdf4ff", typeBorder:"#ddd6fe" },
  { id:"11", title:"Morning Ritual Designer",       type:"planner",   category:"habits",       source:"app",     price:-1,  rating:4.7, reviews:388,  trending:85, isNew:true,  description:"Design and lock in a morning routine that actually sticks — habit stacking included.", barColor:"#f97316", typeColor:"#9a3412", typeBg:"#fff7ed", typeBorder:"#fed7aa" },
  // ── GUMROAD ──
  { id:"g1", title:"90-Day Habit Blueprint",        type:"planner",   category:"habits",       source:"gumroad", price:12,  rating:4.9, reviews:842,  trending:97, isNew:false, description:"Build any habit over 90 days. Daily check-ins, streak counters, visual progress map.", barColor:"#f97316", typeColor:"#9a3412", typeBg:"#fff7ed", typeBorder:"#fed7aa", gumroadUrl:"https://gumroad.com" },
  { id:"g2", title:"Annual Life Audit",             type:"checklist", category:"mindset",      source:"gumroad", price:9,   rating:4.8, reviews:614,  trending:91, isNew:false, description:"Deep-dive review across 10 life dimensions. Scoring, patterns, action plan.", barColor:"#a855f7", typeColor:"#6d28d9", typeBg:"#fdf4ff", typeBorder:"#ddd6fe", gumroadUrl:"https://gumroad.com" },
  { id:"g3", title:"Second Brain Setup Guide",      type:"guide",     category:"productivity", source:"gumroad", price:15,  rating:4.8, reviews:491,  trending:82, isNew:true,  description:"Build a personal knowledge system from scratch — capture, organise, distill, express.", barColor:"#0d9488", typeColor:"#0f766e", typeBg:"#f0fdfa", typeBorder:"#99f6e4", gumroadUrl:"https://gumroad.com" },
  { id:"g4", title:"Net Worth Tracker 2025",        type:"planner",   category:"money",        source:"gumroad", price:8,   rating:4.7, reviews:302,  trending:78, isNew:true,  description:"Monthly net worth snapshot. Assets, liabilities, trend line, savings rate.", barColor:"#059669", typeColor:"#065f46", typeBg:"#ecfdf5", typeBorder:"#bbf7d0", gumroadUrl:"https://gumroad.com" },
  // ── ETSY ──
  { id:"e1", title:"Wellness & Self-Care Planner",  type:"planner",   category:"mindset",      source:"etsy",    price:11,  rating:4.8, reviews:1892, trending:88, isNew:false, description:"Daily wellness check-in, mood, sleep, water, gratitude — all in one planner.", barColor:"#ec4899", typeColor:"#9d174d", typeBg:"#fdf2f8", typeBorder:"#fbcfe8", etsyUrl:"https://etsy.com" },
  { id:"e2", title:"Fitness & Workout Tracker",     type:"checklist", category:"habits",       source:"etsy",    price:7,   rating:4.6, reviews:2341, trending:84, isNew:false, description:"Log every workout, track PRs, monitor recovery and energy levels weekly.", barColor:"#f59e0b", typeColor:"#92400e", typeBg:"#fff7ed", typeBorder:"#fde68a", etsyUrl:"https://etsy.com" },
  { id:"e3", title:"Side Hustle Income Tracker",    type:"planner",   category:"money",        source:"etsy",    price:9,   rating:4.7, reviews:743,  trending:80, isNew:true,  description:"Track every revenue stream, client, invoice, and goal for your side hustle.", barColor:"#059669", typeColor:"#065f46", typeBg:"#ecfdf5", typeBorder:"#bbf7d0", etsyUrl:"https://etsy.com" },
  { id:"e4", title:"Gratitude & Manifestation Journal",type:"ebook",  category:"mindset",      source:"etsy",    price:6,   rating:4.5, reviews:3104, trending:76, isNew:false, description:"Daily gratitude practice with intention-setting and weekly reflection prompts.", barColor:"#a855f7", typeColor:"#6d28d9", typeBg:"#fdf4ff", typeBorder:"#ddd6fe", etsyUrl:"https://etsy.com" },
];

const CATEGORIES: { id: Category; label: string; color: string }[] = [
  { id:"all",          label:"All",            color:"#4f46e5" },
  { id:"money",        label:"Money",          color:"#059669" },
  { id:"habits",       label:"Habits",         color:"#f97316" },
  { id:"mindset",      label:"Mindset",        color:"#a855f7" },
  { id:"productivity", label:"Productivity",   color:"#0d9488" },
];

const TYPE_ICONS: Record<string, string> = {
  planner:   "M3 3h18v18H3z M9 9h6M9 12h6M9 15h4",
  checklist: "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  ebook:     "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  guide:     "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
};

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const Icon = ({ path, size=16, color="currentColor" }: { path:string; size?:number; color?:string }) => (
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
  search:    "M11 11m-8 0a8 8 0 1016 0 8 8 0 00-16 0 M21 21l-4.35-4.35",
  trending:  "M23 6L13.5 15.5 8.5 10.5 1 18 M17 6h6v6",
  plus:      "M12 5v14M5 12h14",
  external:  "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6 M15 3h6v6 M10 14L21 3",
  user:      "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  clock:     "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  lock:      "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
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

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const SOURCE_CONFIG: Record<Source, { label:string; bg:string; color:string; border:string }> = {
  app:     { label:"Draftpace", bg:"#eef2ff", color:"#4338ca", border:"#c7d2fe" },
  gumroad: { label:"Gumroad",   bg:"#fff0f7", color:"#be185d", border:"#fce7f3" },
  etsy:    { label:"Etsy",      bg:"#fff7ed", color:"#c2410c", border:"#fed7aa" },
};

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
      <div className="flex-1 px-4 py-4">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">In the store</p>
        <p className="text-[12px] text-gray-400 leading-relaxed">
          Planners from Draftpace, Gumroad, and Etsy — all trackable in your Drafts.
        </p>
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
// SOURCE BADGE
// ─────────────────────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: Source }) {
  const sc = SOURCE_CONFIG[source];
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
      style={{ background:sc.bg, color:sc.color, borderColor:sc.border }}>
      {sc.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA BUTTON for each planner card
// ─────────────────────────────────────────────────────────────────────────────
function PlannerCTA({ item, compact=false }: { item:ExplorePlanner; compact?:boolean }) {
  const inDrafts = USER_DRAFT_IDS.has(item.id);
  const cls = compact
    ? "flex items-center justify-center gap-1 w-full py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-[0.97]"
    : "flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.97]";

  if (inDrafts) return (
    <div className={`${cls} bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default`}>
      <Icon path={ICONS.check} size={compact?10:12} color="#059669"/>
      In your Drafts
    </div>
  );

  if (item.source === "gumroad") return (
    <a href={item.gumroadUrl} target="_blank" rel="noopener noreferrer"
      className={`${cls} text-white`}
      style={{ background:"#ff90e8" }}>
      <Icon path={ICONS.external} size={compact?10:12} color="white"/>
      <span style={{ color:"#000", fontWeight:700 }}>Get on Gumroad</span>
    </a>
  );

  if (item.source === "etsy") return (
    <a href={item.etsyUrl} target="_blank" rel="noopener noreferrer"
      className={`${cls} text-white`}
      style={{ background:"#f56400" }}>
      <Icon path={ICONS.external} size={compact?10:12} color="white"/>
      Get on Etsy
    </a>
  );

  // In-app
  if (item.price === 0) return (
    <Link href={`/dashboard/planner/${item.id}`}
      className={`${cls} bg-gray-950 text-white hover:bg-gray-800`}>
      Start free
      <Icon path={ICONS.arrow} size={compact?10:12} color="white"/>
    </Link>
  );

  if (item.price === -1) return (
    <Link href="/pricing"
      className={`${cls} bg-indigo-600 text-white hover:bg-indigo-700`}>
      <Icon path={ICONS.lock} size={compact?10:12} color="white"/>
      Included — $7/mo
    </Link>
  );

  return (
    <Link href={`/dashboard/planner/${item.id}`}
      className={`${cls} text-white`}
      style={{ background:item.barColor }}>
      Get for ${item.price}
      <Icon path={ICONS.arrow} size={compact?10:12} color="white"/>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPACT CARD (horizontal scroll sections)
// ─────────────────────────────────────────────────────────────────────────────
function CompactCard({ item, i }: { item:ExplorePlanner; i:number }) {
  const inDrafts = USER_DRAFT_IDS.has(item.id);
  return (
    <motion.div initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }}
      transition={{ delay:i*0.06, duration:0.3 }}
      className="shrink-0 bg-white border border-gray-100 rounded-2xl overflow-hidden snap-start"
      style={{ width:"176px" }}>
      <div className="h-[3px]" style={{ background:item.barColor }}/>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border capitalize"
              style={{ background:item.typeBg, color:item.typeColor, borderColor:item.typeBorder }}>
              {item.type}
            </span>
            <SourceBadge source={item.source}/>
          </div>
          {item.isNew && (
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
              New
            </span>
          )}
        </div>
        <h3 className="text-[12px] font-semibold text-gray-900 mb-1 leading-snug"
          style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {item.title}
        </h3>
        <div className="flex items-center gap-1 mb-3">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span className="text-[10px] font-medium text-gray-500">{item.rating}</span>
          <span className="text-[10px] text-gray-400">({item.reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-black" style={{
            color: item.price===0 ? "#059669" : item.price===-1 ? "#4f46e5" : "#111827"
          }}>
            {item.price===0 ? "Free" : item.price===-1 ? "Members" : `$${item.price}`}
          </span>
          {inDrafts && (
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
              ✓ Saved
            </span>
          )}
        </div>
        <PlannerCTA item={item} compact/>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL GRID CARD
// ─────────────────────────────────────────────────────────────────────────────
function GridCard({ item, i }: { item:ExplorePlanner; i:number }) {
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:i*0.04, duration:0.3 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col hover:border-gray-200 hover:shadow-sm hover:-translate-y-0.5 transition-all">
      <div className="h-1 w-full shrink-0" style={{ background:item.barColor }}/>
      <div className="p-5 flex flex-col flex-1">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border capitalize"
              style={{ background:item.typeBg, color:item.typeColor, borderColor:item.typeBorder }}>
              {item.type}
            </span>
            <SourceBadge source={item.source}/>
            {item.isNew && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>
          {item.trending >= 90 && (
            <div className="flex items-center gap-1 text-orange-500 shrink-0">
              <Icon path={ICONS.trending} size={10} color="#f97316"/>
              <span className="text-[9px] font-bold">{item.trending}</span>
            </div>
          )}
        </div>

        <h3 className="text-[14px] font-semibold text-gray-900 mb-1.5 leading-snug">{item.title}</h3>
        <p className="text-[12px] text-gray-400 leading-relaxed mb-4 flex-1">{item.description}</p>

        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
              <svg key={s} width="10" height="10" viewBox="0 0 24 24"
                fill={s<=Math.round(item.rating)?"#f59e0b":"none"} stroke="#f59e0b" strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <span className="text-[11px] font-medium text-gray-600">{item.rating}</span>
          <span className="text-[11px] text-gray-400">({item.reviews.toLocaleString()})</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mb-3">
          <span className="text-[15px] font-black" style={{
            color: item.price===0 ? "#059669" : item.price===-1 ? "#4f46e5" : "#111827"
          }}>
            {item.price===0 ? "Free" : item.price===-1 ? "Members" : `$${item.price}`}
          </span>
          {item.price===-1 && (
            <span className="text-[10px] text-indigo-500">Included with $7/mo</span>
          )}
        </div>

        <PlannerCTA item={item}/>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HORIZONTAL SECTION
// ─────────────────────────────────────────────────────────────────────────────
function HorizontalSection({ title, items, icon, badge }: {
  title: string; items: ExplorePlanner[]; icon?: string; badge?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon && <Icon path={icon} size={14} color="#f97316"/>}
        <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
        {badge && (
          <span className="text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory" style={{ scrollbarWidth:"none" }}>
        {items.map((item, i) => <CompactCard key={item.id} item={item} i={i}/>)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const router = useRouter();
  const [loading,      setLoading]      = useState(true);
  const [userName,     setUserName]     = useState("there");
  const [userEmail,    setUserEmail]    = useState("");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [search,       setSearch]       = useState("");
  const [category,     setCategory]     = useState<Category>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

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

  const trending = useMemo(() =>
    [...CATALOG].sort((a,b) => b.trending - a.trending).slice(0,6), []);

  const newArrivals = useMemo(() =>
    CATALOG.filter(p => p.isNew).slice(0,6), []);

  const filtered = useMemo(() => {
    let items = [...CATALOG];
    if (category !== "all")     items = items.filter(i => i.category === category);
    if (sourceFilter !== "all") items = items.filter(i => i.source === sourceFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }
    return items;
  }, [category, sourceFilter, search]);

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

      <main className="flex-1 overflow-y-auto">

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
          <div className="max-w-4xl mx-auto flex items-center justify-between h-[54px]">
            <div className="flex items-center gap-1.5 text-[12px]">
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 font-medium transition-colors">Home</Link>
              <Icon path="M9 6l6 6-6 6" size={12} color="#d1d5db"/>
              <span className="text-gray-900 font-semibold">Explore</span>
            </div>
            {/* Search — desktop header */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-56">
              <Icon path={ICONS.search} size={13} color="#9ca3af"/>
              <input type="text" placeholder="Search planners..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 text-[13px] text-gray-700 placeholder-gray-400 outline-none bg-transparent"/>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-4xl mx-auto w-full space-y-6 lg:space-y-8 pb-24 lg:pb-8">

          {/* Page title */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-[22px] lg:text-[26px] font-bold text-gray-950 leading-none tracking-tight mb-1">
                Explore
              </h1>
              <p className="text-[13px] text-gray-400">
                Planners from Draftpace, Gumroad & Etsy — all trackable in your Drafts.
              </p>
            </div>
            {/* Mobile search */}
            <div className="flex lg:hidden items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 w-full sm:w-64">
              <Icon path={ICONS.search} size={14} color="#9ca3af"/>
              <input type="text" placeholder="Search planners..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 text-[13px] text-gray-700 placeholder-gray-400 outline-none bg-transparent"/>
            </div>
          </div>

          {/* Source + how it works banner */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label:"Draftpace", bg:"#eef2ff", color:"#4338ca", border:"#c7d2fe" },
                { label:"Gumroad",   bg:"#fff0f7", color:"#be185d", border:"#fce7f3" },
                { label:"Etsy",      bg:"#fff7ed", color:"#c2410c", border:"#fed7aa" },
              ].map(s => (
                <span key={s.label} className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                  style={{ background:s.bg, color:s.color, borderColor:s.border }}>
                  {s.label}
                </span>
              ))}
            </div>
            <p className="text-[12px] text-gray-400 sm:ml-2">
              Buy on Gumroad or Etsy, then connect your account in{" "}
              <Link href="/dashboard/drafts" className="text-indigo-600 font-medium hover:underline">
                Drafts → Purchases
              </Link>{" "}
              to track it here automatically.
            </p>
          </div>

          {/* Trending section — always shown */}
          {!search && (
            <HorizontalSection
              title="Trending this week"
              items={trending}
              icon={ICONS.trending}
              badge="Hot"
            />
          )}

          {/* New arrivals — always shown */}
          {!search && (
            <HorizontalSection
              title="New additions"
              items={newArrivals}
            />
          )}

          {/* Divider */}
          {!search && <div className="h-px bg-gray-100"/>}

          {/* Full catalog */}
          <div>
            <div className="flex flex-col gap-3 mb-5">
              {/* Source filter */}
              <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth:"none" }}>
                {([
                  { id:"all",     label:"All sources" },
                  { id:"app",     label:"Draftpace"   },
                  { id:"gumroad", label:"Gumroad"     },
                  { id:"etsy",    label:"Etsy"        },
                ] as { id:SourceFilter; label:string }[]).map(s => (
                  <button key={s.id} onClick={() => setSourceFilter(s.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border whitespace-nowrap transition-all shrink-0"
                    style={sourceFilter===s.id
                      ? { background:"#111827", color:"#fff", borderColor:"#111827" }
                      : { background:"#fff", color:"#6b7280", borderColor:"#e5e7eb" }
                    }>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth:"none" }}>
                {CATEGORIES.map(cat => {
                  const isActive = category === cat.id;
                  return (
                    <button key={cat.id} onClick={() => setCategory(cat.id)}
                      className="px-3 py-1.5 rounded-full text-[12px] font-semibold border whitespace-nowrap transition-all shrink-0"
                      style={isActive
                        ? { background:cat.color, color:"#fff", borderColor:cat.color }
                        : { background:"#fff", color:"#6b7280", borderColor:"#e5e7eb" }
                      }>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results count */}
            <p className="text-[12px] text-gray-400 font-medium mb-4">
              {filtered.length} {filtered.length===1?"result":"results"}
              {category!=="all" && ` in ${CATEGORIES.find(c=>c.id===category)?.label}`}
              {sourceFilter!=="all" && ` from ${SOURCE_CONFIG[sourceFilter as Source]?.label}`}
              {search && ` for "${search}"`}
            </p>

            {/* Grid */}
            <AnimatePresence mode="wait">
              <motion.div key={`${category}-${sourceFilter}-${search}`}
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0 }} transition={{ duration:0.18 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((item, i) => <GridCard key={item.id} item={item} i={i}/>)}
              </motion.div>
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[36px] mb-3">🔍</p>
                <p className="text-[16px] font-semibold text-gray-900 mb-1">Nothing found</p>
                <p className="text-[13px] text-gray-400">Try a different search, source, or category</p>
              </div>
            )}
          </div>

          {/* Membership banner */}
          <div className="relative rounded-2xl overflow-hidden px-5 lg:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background:"linear-gradient(135deg,#e0e7ff,#ede9fe,#fce7f3)", border:"1px solid rgba(99,102,241,0.15)" }}>
            <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
              style={{ backgroundImage:"radial-gradient(circle,#4f46e5 1px,transparent 1px)", backgroundSize:"20px 20px" }}/>
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Membership</p>
              <p className="text-[15px] lg:text-[17px] font-bold text-gray-950 tracking-tight leading-tight mb-0.5">
                All Draftpace planners. <span className="text-indigo-600">$7/mo unlocks everything.</span>
              </p>
              <p className="text-[12px] text-gray-500">External Gumroad & Etsy planners always available separately.</p>
            </div>
            <Link href="/pricing"
              className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all shrink-0 w-full sm:w-auto justify-center">
              See plans <Icon path={ICONS.arrow} size={12} color="white"/>
            </Link>
          </div>

        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav/>
      </div>

    </div>
  );
}
