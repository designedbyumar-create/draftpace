"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ── Icons ─────────────────────────────────────────────────────────────────

const BoltIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="white" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

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
  search:    "M11 11m-8 0a8 8 0 1016 0 8 8 0 00-16 0 M21 21l-4.35-4.35",
  filter:    "M3 6h18M6 12h12M9 18h6",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  play:      "M5 3l14 9-14 9V3z",
  pause:     "M6 4h4v16H6zM14 4h4v16h-4z",
  lock:      "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
};

// ── Types & Data ──────────────────────────────────────────────────────────

type Filter = "all" | "active" | "completed" | "paused" | "locked";
type ContentType = "all" | "planner" | "checklist" | "ebook" | "guide";

interface LibItem {
  id: string;
  title: string;
  type: "planner" | "checklist" | "ebook" | "guide";
  category: string;
  status: "active" | "completed" | "paused" | "locked";
  progress: number;
  color: string;
  typeBg: string;
  typeColor: string;
  typeBorder: string;
  rating: number;
  lastOpened: string;
  totalDays?: number;
  currentDay?: number;
  description: string;
}

const ITEMS: LibItem[] = [
  { id:"1",  title:"Monthly Budget Reset",     type:"planner",   category:"Money",      status:"active",    progress:68,  color:"#4f46e5", typeBg:"#eef2ff", typeColor:"#4338ca", typeBorder:"#c7d2fe", rating:4.8, lastOpened:"Today",      totalDays:30,  currentDay:14, description:"Track income, expenses and what's left every month." },
  { id:"2",  title:"30-Day Habit Builder",     type:"checklist", category:"Habits",     status:"active",    progress:53,  color:"#7c3aed", typeBg:"#fdf4ff", typeColor:"#6d28d9", typeBorder:"#ddd6fe", rating:4.9, lastOpened:"Yesterday",  totalDays:30,  currentDay:16, description:"Build any habit in 30 days with daily check-ins." },
  { id:"3",  title:"Savings Goal — $5,000",    type:"guide",     category:"Money",      status:"active",    progress:41,  color:"#0d9488", typeBg:"#f0fdfa", typeColor:"#0f766e", typeBorder:"#99f6e4", rating:4.7, lastOpened:"2 days ago", totalDays:84,  currentDay:42, description:"A guided system to hit any savings target." },
  { id:"4",  title:"Q3 Life Audit",            type:"guide",     category:"Mindset",    status:"completed", progress:100, color:"#059669", typeBg:"#ecfdf5", typeColor:"#065f46", typeBorder:"#bbf7d0", rating:4.8, lastOpened:"Sep 30",     description:"Annual review across 10 life dimensions." },
  { id:"5",  title:"Morning Routine Checklist",type:"checklist", category:"Habits",     status:"completed", progress:100, color:"#059669", typeBg:"#ecfdf5", typeColor:"#065f46", typeBorder:"#bbf7d0", rating:4.9, lastOpened:"Oct 14",     description:"Design and lock in your perfect morning." },
  { id:"6",  title:"Side Hustle Starter",      type:"ebook",     category:"Money",      status:"completed", progress:100, color:"#059669", typeBg:"#ecfdf5", typeColor:"#065f46", typeBorder:"#bbf7d0", rating:4.6, lastOpened:"Nov 1",      description:"Launch your first income stream in 30 days." },
  { id:"7",  title:"Annual Life Audit",        type:"guide",     category:"Mindset",    status:"paused",    progress:34,  color:"#f59e0b", typeBg:"#fff7ed", typeColor:"#92400e", typeBorder:"#fde68a", rating:4.7, lastOpened:"Oct 9",      description:"Deep review of every area of your life." },
  { id:"8",  title:"Fitness Tracker — Nov",    type:"planner",   category:"Health",     status:"paused",    progress:18,  color:"#f59e0b", typeBg:"#fff7ed", typeColor:"#92400e", typeBorder:"#fde68a", rating:4.5, lastOpened:"Nov 4",      description:"Track workouts, sleep, and energy levels." },
  { id:"9",  title:"Deep Work Weekly Planner", type:"planner",   category:"Productivity",status:"locked",   progress:0,   color:"#9ca3af", typeBg:"#f9fafb", typeColor:"#6b7280", typeBorder:"#e5e7eb", rating:4.9, lastOpened:"—",          description:"Plan your week around 4-hour deep work blocks." },
  { id:"10", title:"Anxiety Reset Journal",    type:"ebook",     category:"Mindset",    status:"locked",    progress:0,   color:"#9ca3af", typeBg:"#f9fafb", typeColor:"#6b7280", typeBorder:"#e5e7eb", rating:4.9, lastOpened:"—",          description:"CBT and mindfulness exercises for anxiety." },
  { id:"11", title:"Financial Independence",   type:"planner",   category:"Money",      status:"locked",    progress:0,   color:"#9ca3af", typeBg:"#f9fafb", typeColor:"#6b7280", typeBorder:"#e5e7eb", rating:4.8, lastOpened:"—",          description:"Your FI number, savings rate, and net worth." },
];

const TYPE_ICONS: Record<string, string> = {
  planner:   "M3 3h18v18H3z M9 9h6M9 12h6M9 15h4",
  checklist: "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  ebook:     "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  guide:     "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
};

const STATUS_CONFIG = {
  active:    { label: "Active",    bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" },
  completed: { label: "Completed", bg: "#ecfdf5", color: "#065f46", border: "#bbf7d0" },
  paused:    { label: "Paused",    bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  locked:    { label: "Locked",    bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" },
};

// ── Sidebar (shared) ──────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard", path: ICONS.dashboard, href: "/dashboard"          },
  { label: "My Library", path: ICONS.library,  href: "/dashboard/library"  },
  { label: "Progress",   path: ICONS.progress, href: "/dashboard/progress" },
  { label: "Explore",    path: ICONS.explore,  href: "/dashboard/explore"  },
  { label: "Settings",   path: ICONS.settings, href: "/dashboard/settings" },
];

function Sidebar({ name, email, onSignOut, mobile, onClose }: {
  name: string; email: string; onSignOut: () => void; mobile?: boolean; onClose?: () => void;
}) {
  const pathname = usePathname();
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <aside className={`flex flex-col bg-white border-r border-gray-100 ${mobile ? "w-full h-full" : "w-[220px] shrink-0"}`}>
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-700 transition-colors">
            <BoltIcon size={12} />
          </div>
          <span className="text-[14px] font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Draftpace</span>
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
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${isActive ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium"}`}>
              <Icon path={path} size={15} color={isActive ? "#4f46e5" : "currentColor"} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 py-3 flex-1 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-2">Active now</p>
        {ITEMS.filter(i => i.status === "active").map((item) => (
          <Link key={item.id} href={`/dashboard/planner/${item.id}`} onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }} />
            <span className="truncate flex-1">{item.title}</span>
            <span className="text-[10px] font-semibold shrink-0" style={{ color: item.color }}>{item.progress}%</span>
          </Link>
        ))}
      </div>
      <div className="px-2 pb-3 pt-2 border-t border-gray-100">
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all mb-1">
          <Icon path={ICONS.home} size={14} />Back to site
        </Link>
        <div className="flex items-center gap-2.5 px-3 py-2">
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
      </div>
    </aside>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("there");
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [typeFilter, setTypeFilter] = useState<ContentType>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      setUserName(session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "there");
      setUserEmail(session.user.email || "");
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.replace("/"); };

  const filtered = useMemo(() => {
    return ITEMS.filter(item => {
      if (filter !== "all" && item.status !== filter) return false;
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filter, typeFilter, search]);

  const stats = {
    active: ITEMS.filter(i => i.status === "active").length,
    completed: ITEMS.filter(i => i.status === "completed").length,
    paused: ITEMS.filter(i => i.status === "paused").length,
    locked: ITEMS.filter(i => i.status === "locked").length,
  };

  if (loading) return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center"><BoltIcon size={16} /></div>
        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

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

      <main className="flex-1 overflow-y-auto">

        {/* Mobile bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3.5 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="w-8 h-8 flex items-center justify-center text-gray-600 rounded-lg hover:bg-gray-100">
            <Icon path={ICONS.menu} size={18} />
          </button>
          <span className="text-[14px] font-semibold text-gray-900">My Library</span>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-[10px] font-bold text-indigo-700">{userName.slice(0,2).toUpperCase()}</span>
          </div>
        </div>

        <div className="px-6 lg:px-8 py-7 max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[12px] text-gray-400 mb-0.5">My Library</p>
              <h1 className="text-[26px] font-bold text-gray-950 leading-none tracking-tight">
                Everything you own
              </h1>
              <p className="text-[13px] text-gray-400 mt-1.5">
                {ITEMS.filter(i => i.status !== "locked").length} items · {stats.active} active · {stats.completed} done
              </p>
            </div>
            {/* Search */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 w-full sm:w-64 shadow-sm">
              <Icon path={ICONS.search} size={14} color="#9ca3af" />
              <input type="text" placeholder="Search your library..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 text-[13px] text-gray-700 placeholder-gray-400 outline-none bg-transparent" />
            </div>
          </div>

          {/* Stat overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Active",    val: stats.active,    color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe" },
              { label: "Completed", val: stats.completed, color: "#059669", bg: "#ecfdf5", border: "#bbf7d0" },
              { label: "Paused",    val: stats.paused,    color: "#f59e0b", bg: "#fef3c7", border: "#fde68a" },
              { label: "Locked",    val: stats.locked,    color: "#9ca3af", bg: "#f9fafb", border: "#e5e7eb" },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl p-4 border cursor-pointer transition-all hover:shadow-sm"
                style={{ background: filter === s.label.toLowerCase() ? s.bg : "#fff", borderColor: filter === s.label.toLowerCase() ? s.border : "#f3f4f6" }}
                onClick={() => setFilter(filter === s.label.toLowerCase() as Filter ? "all" : s.label.toLowerCase() as Filter)}>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">{s.label}</p>
                <p className="text-[28px] font-bold leading-none" style={{ color: s.color, letterSpacing: "-0.03em" }}>{s.val}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(["all","planner","checklist","ebook","guide"] as ContentType[]).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
                  style={typeFilter === t
                    ? { background: "#111827", color: "#fff", borderColor: "#111827" }
                    : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }}>
                  {t === "all" ? "All types" : t.charAt(0).toUpperCase() + t.slice(1) + "s"}
                </button>
              ))}
            </div>
            <p className="text-[12px] text-gray-400">{filtered.length} {filtered.length === 1 ? "item" : "items"}</p>
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${filter}-${typeFilter}-${search}`}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item, i) => {
                const sc = STATUS_CONFIG[item.status];
                const isLocked = item.status === "locked";
                return (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col transition-all ${!isLocked ? "hover:border-gray-200 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer" : "opacity-60"}`}>

                    {/* Color bar */}
                    <div className="h-[3px]" style={{ background: item.color }} />

                    <div className="p-5 flex flex-col flex-1">
                      {/* Top row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: item.typeBg }}>
                          <Icon path={TYPE_ICONS[item.type]} size={15} color={item.typeColor} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isLocked && (
                            <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
                              <Icon path={ICONS.lock} size={12} color="#9ca3af" />
                            </div>
                          )}
                          <span className="text-[10px] font-semibold px-2 py-1 rounded-full border"
                            style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                            {sc.label}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-[14px] font-semibold text-gray-900 mb-1 leading-snug">{item.title}</h3>
                      <p className="text-[12px] text-gray-400 mb-4 flex-1 leading-relaxed">{item.description}</p>

                      {/* Progress */}
                      {!isLocked && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11px] text-gray-400">
                              {item.status === "active" && item.currentDay ? `Day ${item.currentDay} of ${item.totalDays}` : item.lastOpened}
                            </span>
                            <span className="text-[12px] font-bold" style={{ color: item.color }}>{item.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div className="h-full rounded-full" style={{ background: item.color }}
                              initial={{ width: 0 }} animate={{ width: `${item.progress}%` }}
                              transition={{ delay: i * 0.04 + 0.1, duration: 0.7, ease: "easeOut" }} />
                          </div>
                        </div>
                      )}

                      {/* Rating + CTA */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Icon path={ICONS.star} size={11} color="#f59e0b" />
                          <span className="text-[11px] font-medium text-gray-600">{item.rating}</span>
                        </div>
                        {isLocked ? (
                          <Link href="/pricing"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                            <Icon path={ICONS.lock} size={10} color="#6b7280" />
                            Unlock
                          </Link>
                        ) : (
                          <Link href={`/dashboard/planner/${item.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all hover:opacity-90"
                            style={{ background: item.color }}>
                            <Icon path={item.status === "active" ? ICONS.play : item.status === "completed" ? ICONS.check : ICONS.play} size={10} color="white" />
                            {item.status === "active" ? "Continue" : item.status === "completed" ? "Review" : "Resume"}
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[32px] mb-3">📭</p>
              <p className="text-[16px] font-semibold text-gray-900 mb-1">Nothing here</p>
              <p className="text-[13px] text-gray-400">Try a different filter</p>
            </div>
          )}

          {/* Unlock banner */}
          <div className="relative rounded-2xl overflow-hidden px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: "linear-gradient(135deg,#e0e7ff,#ede9fe,#fce7f3)", border: "1px solid rgba(99,102,241,0.15)" }}>
            <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
              style={{ backgroundImage: "radial-gradient(circle,#4f46e5 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Membership</p>
              <p className="text-[17px] font-bold text-gray-950 tracking-tight leading-tight mb-0.5">
                {stats.locked} planners locked. <span className="text-indigo-600">$7/mo opens everything.</span>
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
