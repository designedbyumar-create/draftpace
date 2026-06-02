"use client";

import { useEffect, useState, useMemo } from "react";
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
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  search:    "M11 11m-8 0a8 8 0 1016 0 8 8 0 00-16 0 M21 21l-4.35-4.35",
  trending:  "M23 6L13.5 15.5 8.5 10.5 1 18 M17 6h6v6",
  plus:      "M12 5v14M5 12h14",
};

type Category = "all" | "money" | "habits" | "mindset" | "productivity";

const CATEGORIES = [
  { id: "all" as Category,         label: "All",            count: 24, color: "#4f46e5" },
  { id: "money" as Category,       label: "Money",          count: 7,  color: "#059669" },
  { id: "habits" as Category,      label: "Habits & Goals", count: 8,  color: "#f97316" },
  { id: "mindset" as Category,     label: "Mindset",        count: 5,  color: "#a855f7" },
  { id: "productivity" as Category,label: "Productivity",   count: 4,  color: "#0d9488" },
];

const ITEMS = [
  { id:"e1", title:"Deep Work Weekly Planner",  type:"planner",   category:"productivity" as Category, color:"#0d9488", typeBg:"#f0fdfa", typeColor:"#0f766e", typeBorder:"#99f6e4", price:12, rating:4.9, reviews:723,  isNew:false, trending:94, desc:"Plan your week around 4-hour deep work blocks." },
  { id:"e2", title:"Anxiety Reset Journal",     type:"ebook",     category:"mindset" as Category,      color:"#a855f7", typeBg:"#fdf4ff", typeColor:"#6d28d9", typeBorder:"#ddd6fe", price:12, rating:4.9, reviews:1432, isNew:false, trending:95, desc:"CBT and mindfulness exercises for anxiety." },
  { id:"e3", title:"Financial Independence",    type:"planner",   category:"money" as Category,        color:"#059669", typeBg:"#ecfdf5", typeColor:"#065f46", typeBorder:"#bbf7d0", price:15, rating:4.9, reviews:921,  isNew:false, trending:93, desc:"FI number, savings rate, and net worth tracker." },
  { id:"e4", title:"Morning Ritual Designer",   type:"planner",   category:"habits" as Category,       color:"#f97316", typeBg:"#fff7ed", typeColor:"#9a3412", typeBorder:"#fde68a", price:8,  rating:4.7, reviews:388,  isNew:true,  trending:85, desc:"Design a morning routine that actually sticks." },
  { id:"e5", title:"Second Brain Setup Guide",  type:"guide",     category:"productivity" as Category, color:"#0d9488", typeBg:"#f0fdfa", typeColor:"#0f766e", typeBorder:"#99f6e4", price:15, rating:4.8, reviews:491,  isNew:true,  trending:82, desc:"Build a personal knowledge system from scratch." },
  { id:"e6", title:"Burnout Recovery Roadmap",  type:"guide",     category:"mindset" as Category,      color:"#a855f7", typeBg:"#fdf4ff", typeColor:"#6d28d9", typeBorder:"#ddd6fe", price:14, rating:4.8, reviews:672,  isNew:true,  trending:83, desc:"8-week guide to rebuild from burnout." },
  { id:"e7", title:"30-Day Mood Tracker",       type:"checklist", category:"mindset" as Category,      color:"#a855f7", typeBg:"#fdf4ff", typeColor:"#6d28d9", typeBorder:"#ddd6fe", price:0,  rating:4.6, reviews:3201, isNew:false, trending:87, desc:"Daily mood logging with weekly reflection prompts." },
  { id:"e8", title:"Feynman Study Method",      type:"guide",     category:"productivity" as Category, color:"#0d9488", typeBg:"#f0fdfa", typeColor:"#0f766e", typeBorder:"#99f6e4", price:9,  rating:4.9, reviews:814,  isNew:true,  trending:91, desc:"Master any subject by teaching it." },
];

const TYPE_ICONS: Record<string, string> = {
  planner:   "M3 3h18v18H3z M9 9h6M9 12h6M9 15h4",
  checklist: "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  ebook:     "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  guide:     "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
};

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

export default function ExplorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("there");
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [category, setCategory] = useState<Category>("all");
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
      if (category !== "all" && item.category !== category) return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [category, search]);

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
        <div className="lg:hidden flex items-center justify-between px-4 py-3.5 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="w-8 h-8 flex items-center justify-center text-gray-600 rounded-lg hover:bg-gray-100">
            <Icon path={ICONS.menu} size={18} />
          </button>
          <span className="text-[14px] font-semibold text-gray-900">Explore</span>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-[10px] font-bold text-indigo-700">{userName.slice(0,2).toUpperCase()}</span>
          </div>
        </div>

        <div className="px-6 lg:px-8 py-7 max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[12px] text-gray-400 mb-0.5">Explore</p>
              <h1 className="text-[26px] font-bold text-gray-950 leading-none tracking-tight">Add to your library</h1>
              <p className="text-[13px] text-gray-400 mt-1.5">200+ planners, guides, and ebooks — pick your next one.</p>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 w-full sm:w-64 shadow-sm">
              <Icon path={ICONS.search} size={14} color="#9ca3af" />
              <input type="text" placeholder="Search planners..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 text-[13px] text-gray-700 placeholder-gray-400 outline-none bg-transparent" />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => {
              const isActive = category === cat.id;
              return (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border whitespace-nowrap transition-all shrink-0"
                  style={isActive
                    ? { background: cat.color, color: "#fff", borderColor: cat.color }
                    : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }}>
                  {cat.label}
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={isActive ? { background: "rgba(255,255,255,0.2)", color: "#fff" } : { background: "#f3f4f6", color: "#9ca3af" }}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Trending strip */}
          <div className="flex items-center gap-2 mb-1">
            <Icon path={ICONS.trending} size={14} color="#f97316" />
            <span className="text-[12px] font-semibold text-gray-600">Trending this week</span>
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div key={`${category}-${search}`}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col hover:border-gray-200 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer">

                  <div className="h-[3px]" style={{ background: item.color }} />

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: item.typeBg }}>
                        <Icon path={TYPE_ICONS[item.type]} size={15} color={item.typeColor} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.isNew && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">New</span>
                        )}
                        {item.trending >= 90 && (
                          <div className="flex items-center gap-1 text-orange-500">
                            <Icon path={ICONS.trending} size={10} color="#f97316" />
                            <span className="text-[9px] font-bold">{item.trending}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-[14px] font-semibold text-gray-900 mb-1 leading-snug">{item.title}</h3>
                    <p className="text-[12px] text-gray-400 mb-4 flex-1 leading-relaxed">{item.desc}</p>

                    <div className="flex items-center gap-1 mb-4">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= Math.round(item.rating) ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="1.5">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                      <span className="text-[11px] font-medium text-gray-500 ml-0.5">{item.rating}</span>
                      <span className="text-[10px] text-gray-400">({item.reviews.toLocaleString()})</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-[15px] font-bold" style={{ color: item.price === 0 ? "#059669" : "#111827" }}>
                        {item.price === 0 ? "Free" : `$${item.price}`}
                      </span>
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: item.color }}>
                        <Icon path={ICONS.plus} size={10} color="white" />
                        Add to library
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
