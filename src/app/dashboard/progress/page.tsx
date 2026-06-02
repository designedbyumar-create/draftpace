"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
  trophy:    "M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z",
  flame:     "M8.5 14.5A2.5 2.5 0 0011 17c1.38 0 2.5-1.12 2.5-2.5 0-1.14-.77-2.06-1.8-2.4C10.54 11.74 10 10.93 10 10c0 0 1.5 1 2 3.5C13.5 11 14 8 12 5.5c0 0 0 3-2 4.5-1 .75-1.5 1.5-1.5 2.5z",
};

const NAV_ITEMS = [
  { label: "Dashboard", path: ICONS.dashboard, href: "/dashboard"          },
  { label: "My Library", path: ICONS.library,  href: "/dashboard/library"  },
  { label: "Progress",   path: ICONS.progress, href: "/dashboard/progress" },
  { label: "Explore",    path: ICONS.explore,  href: "/dashboard/explore"  },
  { label: "Settings",   path: ICONS.settings, href: "/dashboard/settings" },
];

// 12 weeks × 7 days heatmap data
const HEATMAP = Array.from({ length: 84 }, (_, i) => {
  if (i > 72) return 0;
  if (i > 65) return Math.random() > 0.4 ? Math.floor(Math.random() * 2) + 1 : 0;
  return Math.random() > 0.25 ? Math.floor(Math.random() * 4) + 1 : 0;
});

const WEEK_LABELS = ["W1","","","W4","","","W7","","","W10","",""];
const DAY_LABELS  = ["Mo","Tu","We","Th","Fr","Sa","Su"];

const COMPLETIONS = [
  { title:"Q3 Life Audit",           date:"Sep 30", days:18, color:"#059669" },
  { title:"Morning Routine",         date:"Oct 14", days:7,  color:"#059669" },
  { title:"Side Hustle Starter",     date:"Nov 1",  days:5,  color:"#059669" },
  { title:"Budget Reset — October",  date:"Oct 31", days:22, color:"#059669" },
];

const ACTIVE_ITEMS = [
  { title:"Monthly Budget Reset", progress:68, color:"#4f46e5", days:"14/30" },
  { title:"30-Day Habit Builder",  progress:53, color:"#7c3aed", days:"16/30" },
  { title:"Savings Goal $5k",      progress:41, color:"#0d9488", days:"42/84" },
];

const MONTHLY = [
  { month:"Jul", val:42 },
  { month:"Aug", val:58 },
  { month:"Sep", val:71 },
  { month:"Oct", val:83 },
  { month:"Nov", val:86 },
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
      <div className="flex-1" />
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
          <button onClick={onSignOut} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-all shrink-0">
            <Icon path={ICONS.logout} size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function ProgressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("there");
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      setUserName(session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "there");
      setUserEmail(session.user.email || "");
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.replace("/"); };

  if (loading) return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center"><BoltIcon size={16} /></div>
        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  const maxBar = Math.max(...MONTHLY.map(m => m.val));

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
        <div className="lg:hidden flex items-center justify-between px-4 py-3.5 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="w-8 h-8 flex items-center justify-center text-gray-600 rounded-lg hover:bg-gray-100">
            <Icon path={ICONS.menu} size={18} />
          </button>
          <span className="text-[14px] font-semibold text-gray-900">Progress</span>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-[10px] font-bold text-indigo-700">{userName.slice(0,2).toUpperCase()}</span>
          </div>
        </div>

        <div className="px-6 lg:px-8 py-7 max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div>
            <p className="text-[12px] text-gray-400 mb-0.5">Progress</p>
            <h1 className="text-[26px] font-bold text-gray-950 leading-none tracking-tight">Your growth story</h1>
            <p className="text-[13px] text-gray-400 mt-1.5">Every day you showed up is recorded here.</p>
          </div>

          {/* Top stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Current streak", value: "12", sub: "days",        color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
              { label: "Best streak",    value: "21", sub: "days",        color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe" },
              { label: "Total done",     value: "7",  sub: "planners",    color: "#059669", bg: "#ecfdf5", border: "#bbf7d0" },
              { label: "Avg completion", value: "86%",sub: "this month",  color: "#7c3aed", bg: "#fdf4ff", border: "#ddd6fe" },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl p-4 border" style={{ background: s.bg, borderColor: s.border }}>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">{s.label}</p>
                <p className="font-bold leading-none mb-0.5" style={{ fontSize: "26px", color: s.color, letterSpacing: "-0.03em" }}>{s.value}</p>
                <p className="text-[10px] font-medium" style={{ color: s.color, opacity: 0.65 }}>{s.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
                <Icon path="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" size={13} color="#4f46e5" />
                Activity heatmap — last 12 weeks
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">Less</span>
                {[0,1,2,3,4].map(v => (
                  <div key={v} className="w-3 h-3 rounded-sm" style={{
                    background: v === 0 ? "#f3f4f6" : v === 1 ? "#c7d2fe" : v === 2 ? "#a5b4fc" : v === 3 ? "#6366f1" : "#4f46e5"
                  }} />
                ))}
                <span className="text-[10px] text-gray-400">More</span>
              </div>
            </div>
            <div className="flex gap-3">
              {/* Day labels */}
              <div className="flex flex-col gap-1 pt-5">
                {DAY_LABELS.map(d => (
                  <div key={d} className="text-[9px] text-gray-400 h-4 flex items-center">{d}</div>
                ))}
              </div>
              {/* Grid */}
              <div className="flex-1">
                <div className="flex gap-1 mb-1">
                  {WEEK_LABELS.map((w, i) => (
                    <div key={i} className="flex-1 text-[9px] text-gray-400 text-center">{w}</div>
                  ))}
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 12 }, (_, week) => (
                    <div key={week} className="flex-1 flex flex-col gap-1">
                      {Array.from({ length: 7 }, (_, day) => {
                        const val = HEATMAP[week * 7 + day];
                        const bg = val === 0 ? "#f3f4f6" : val === 1 ? "#c7d2fe" : val === 2 ? "#a5b4fc" : val === 3 ? "#6366f1" : "#4f46e5";
                        return <div key={day} className="h-4 rounded-sm transition-all hover:scale-110" style={{ background: bg }} />;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly completion chart + active items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Monthly avg */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-[13px] font-semibold text-gray-800 mb-5">Monthly completion avg</p>
              <div className="flex items-end gap-3 h-32">
                {MONTHLY.map((m, i) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-indigo-600">{m.val}%</span>
                    <motion.div className="w-full rounded-lg"
                      style={{ background: i === MONTHLY.length - 1 ? "#4f46e5" : "#e0e7ff" }}
                      initial={{ height: 0 }} animate={{ height: `${(m.val / maxBar) * 100}px` }}
                      transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }} />
                    <span className="text-[10px] text-gray-400">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active progress */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-[13px] font-semibold text-gray-800 mb-5">Active right now</p>
              <div className="flex flex-col gap-4">
                {ACTIVE_ITEMS.map((item, i) => (
                  <div key={item.title}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[12px] font-medium text-gray-700 truncate">{item.title}</span>
                      <span className="text-[11px] font-semibold shrink-0 ml-2" style={{ color: item.color }}>
                        {item.days} days
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: item.color }}
                        initial={{ width: 0 }} animate={{ width: `${item.progress}%` }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 0.7, ease: "easeOut" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Completions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
                <Icon path={ICONS.trophy} size={13} color="#f59e0b" />
                Finished planners
              </p>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                7 completed
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {COMPLETIONS.map((c, i) => (
                <motion.div key={c.title}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <Icon path={ICONS.check} size={13} color="#059669" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 truncate">{c.title}</p>
                    <p className="text-[11px] text-gray-400">Completed in {c.days} days</p>
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0">{c.date}</span>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
