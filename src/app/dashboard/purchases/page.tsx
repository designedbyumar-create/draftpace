"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES — matches purchases table in Supabase
// ─────────────────────────────────────────────────────────────────────────────
interface Purchase {
  id: string;
  planner_id: string;
  title: string;
  type: string;
  source: "gumroad" | "etsy" | "manual" | "membership";
  amount: number;
  currency: string;
  purchased_at: string;
  status: "active" | "completed" | "not_started";
  typeBg: string;
  typeColor: string;
  typeBorder: string;
  barColor: string;
  progress: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
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
  close:     "M18 6L6 18M6 6l12 12",
  arrow:     "M5 12h14M12 5l7 7-7 7",
  check:     "M20 6L9 17l-5-5",
  plus:      "M12 5v14M5 12h14",
  user:      "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  purchases: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0",
  link:      "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  mail:      "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  tag:       "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
  refresh:   "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
};

const NAV_ITEMS = [
  { label:"Dashboard",  path:ICONS.dashboard, href:"/dashboard"           },
  { label:"My Library", path:ICONS.library,   href:"/dashboard/library"   },
  { label:"Purchases",  path:ICONS.purchases, href:"/dashboard/purchases" },
  { label:"Progress",   path:ICONS.progress,  href:"/dashboard/progress"  },
  { label:"Settings",   path:ICONS.settings,  href:"/dashboard/settings"  },
];

const BOTTOM_NAV = [
  { label:"Home",      path:ICONS.home,      href:"/dashboard"           },
  { label:"Library",   path:ICONS.library,   href:"/dashboard/library"   },
  { label:"Purchases", path:ICONS.purchases, href:"/dashboard/purchases" },
  { label:"Progress",  path:ICONS.progress,  href:"/dashboard/progress"  },
  { label:"You",       path:ICONS.user,      href:"/dashboard/settings"  },
];

function Skeleton({ className = "" }: { className?: string }) {
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
      <div className="flex-1"/>
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
          <button onClick={onSignOut}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-all shrink-0">
            <Icon path={ICONS.logout} size={13}/>
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOTTOM NAV (mobile)
// ─────────────────────────────────────────────────────────────────────────────
function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100"
      style={{ paddingBottom:"env(safe-area-inset-bottom)" }}>
      <div className="flex items-center h-16 max-w-lg mx-auto px-2">
        {BOTTOM_NAV.map(({ label, path, href }) => {
          const isActive = pathname === href;
          return (
            <Link key={label} href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 h-full relative">
              <Icon path={path} size={22} color={isActive?"#4f46e5":"#9ca3af"}/>
              <span className="text-[10px] font-medium" style={{ color:isActive?"#4f46e5":"#9ca3af" }}>{label}</span>
              {isActive && (
                <motion.div layoutId="bottom-nav-dot"
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
// SOURCE BADGE
// ─────────────────────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: Purchase["source"] }) {
  const config = {
    gumroad:    { label:"Gumroad",    bg:"#fff0f7", color:"#be185d", border:"#fce7f3" },
    etsy:       { label:"Etsy",       bg:"#fff7ed", color:"#c2410c", border:"#fed7aa" },
    manual:     { label:"Manual",     bg:"#f9fafb", color:"#6b7280", border:"#e5e7eb" },
    membership: { label:"Membership", bg:"#eef2ff", color:"#4338ca", border:"#c7d2fe" },
  }[source];
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
      style={{ background:config.bg, color:config.color, borderColor:config.border }}>
      {config.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONNECT CARD
// ─────────────────────────────────────────────────────────────────────────────
function ConnectCard({
  icon, title, description, badge, buttonLabel, buttonColor, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  buttonLabel: string;
  buttonColor: string;
  onClick: () => void;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background:buttonColor+"15" }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[14px] font-semibold text-gray-900">{title}</p>
          {badge && (
            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[12px] text-gray-400 truncate">{description}</p>
      </div>
      <button onClick={onClick}
        className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
        style={{ background:buttonColor }}>
        <Icon path={ICONS.link} size={12} color="white"/>
        {buttonLabel}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GUMROAD LOGO SVG
// ─────────────────────────────────────────────────────────────────────────────
const GumroadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#ff90e8"/>
    <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#000">G</text>
  </svg>
);

const EtsyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#f56400"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">E</text>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL ADD MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ManualAddModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email && !orderId) return;
    setSubmitting(true);
    // TODO: verify purchase via Supabase edge function
    // await supabase.functions.invoke("verify-purchase", { body: { email, orderId } })
    setTimeout(() => { setSubmitting(false); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background:"rgba(0,0,0,0.4)" }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        exit={{ opacity:0, y:20 }} transition={{ duration:0.2 }}
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
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function PurchasesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("there");
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);

  // ── When Gumroad/Etsy integration is ready, replace with real data ──
  // const [purchases, setPurchases] = useState<Purchase[]>([]);
  // const [loadingPurchases, setLoadingPurchases] = useState(true);
  const purchases: Purchase[] = []; // empty until integration is live

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      setUserName(session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "there");
      setUserEmail(session.user.email || "");
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.replace("/"); };
  const handleGumroadConnect = () => {
    // TODO: implement Gumroad OAuth or API key flow
    alert("Gumroad integration coming soon!");
  };
  const handleEtsyConnect = () => {
    // TODO: implement Etsy OAuth flow
    alert("Etsy integration coming soon!");
  };

  const firstName = userName.split(" ")[0];

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
            className="fixed inset-0 z-50 lg:hidden" style={{ background:"rgba(0,0,0,0.35)" }}
            onClick={() => setSidebarOpen(false)}>
            <motion.div initial={{ x:-260 }} animate={{ x:0 }} exit={{ x:-260 }}
              transition={{ type:"spring", damping:28, stiffness:220 }}
              className="absolute left-0 top-0 bottom-0 w-64" onClick={e => e.stopPropagation()}>
              <Sidebar name={userName} email={userEmail} onSignOut={handleSignOut} mobile onClose={() => setSidebarOpen(false)}/>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual add modal */}
      <AnimatePresence>
        {showManualAdd && <ManualAddModal onClose={() => setShowManualAdd(false)}/>}
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
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 transition-colors font-medium">Home</Link>
              <Icon path="M9 6l6 6-6 6" size={12} color="#d1d5db"/>
              <span className="text-gray-900 font-semibold">Purchases</span>
            </div>
            <button onClick={() => setShowManualAdd(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors">
              <Icon path={ICONS.plus} size={12} color="#4f46e5"/>
              Add manually
            </button>
          </div>
        </div>

        <div className="px-4 lg:px-8 py-5 lg:py-7 max-w-4xl mx-auto w-full space-y-5 lg:space-y-6 pb-24 lg:pb-8">

          {/* Header */}
          <div>
            <h1 className="text-[22px] lg:text-[26px] font-bold text-gray-950 leading-none tracking-tight mb-1">
              Purchases
            </h1>
            <p className="text-[13px] text-gray-400">
              Connect Gumroad or Etsy to auto-import everything you've bought.
            </p>
          </div>

          {/* Connect sources */}
          <div className="space-y-3">
            <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-widest">Connect your stores</p>

            <ConnectCard
              icon={<GumroadIcon/>}
              title="Gumroad"
              description="Auto-import all planners & ebooks you've purchased"
              badge="Recommended"
              buttonLabel="Connect"
              buttonColor="#ff90e8"
              onClick={handleGumroadConnect}
            />

            <ConnectCard
              icon={<EtsyIcon/>}
              title="Etsy"
              description="Sync your Etsy digital downloads automatically"
              buttonLabel="Connect"
              buttonColor="#f56400"
              onClick={handleEtsyConnect}
            />

            {/* Manual add */}
            <button onClick={() => setShowManualAdd(true)}
              className="w-full flex items-center gap-4 p-5 bg-white border border-dashed border-gray-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-gray-200 group-hover:border-indigo-300 flex items-center justify-center shrink-0 transition-colors">
                <Icon path={ICONS.plus} size={18} color="#9ca3af"/>
              </div>
              <div className="text-left">
                <p className="text-[14px] font-semibold text-gray-700 group-hover:text-indigo-700 transition-colors">Add purchase manually</p>
                <p className="text-[12px] text-gray-400">Enter your order email or receipt ID</p>
              </div>
              <Icon path={ICONS.arrow} size={16} color="#9ca3af" className="ml-auto shrink-0"/>
            </button>
          </div>

          {/* How it works */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-[13px] font-semibold text-gray-800 mb-4">How it works</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step:"1", icon:ICONS.purchases, color:"#4f46e5", bg:"#eef2ff", title:"Buy on Gumroad or Etsy", desc:"Purchase any planner from our store" },
                { step:"2", icon:ICONS.link,      color:"#0d9488", bg:"#f0fdfa", title:"Connect your account",  desc:"Link your store in one tap" },
                { step:"3", icon:ICONS.check,     color:"#059669", bg:"#ecfdf5", title:"Opens in Draftpace",    desc:"Track, progress, and streak" },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:item.bg }}>
                    <Icon path={item.icon} size={15} color={item.color}/>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-900 mb-0.5">{item.title}</p>
                    <p className="text-[11px] text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Purchases list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold text-gray-800">Your purchases</p>
              {purchases.length > 0 && (
                <button className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400 hover:text-gray-600 transition-colors">
                  <Icon path={ICONS.refresh} size={13}/> Sync
                </button>
              )}
            </div>

            {purchases.length === 0 ? (
              // ── Empty state ──
              <motion.div
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Icon path={ICONS.purchases} size={24} color="#9ca3af"/>
                </div>
                <p className="text-[15px] font-semibold text-gray-900 mb-1">No purchases yet</p>
                <p className="text-[13px] text-gray-400 mb-5 max-w-xs mx-auto">
                  Connect Gumroad or Etsy above and your purchases will appear here automatically.
                </p>
                <button onClick={() => setShowManualAdd(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all">
                  <Icon path={ICONS.plus} size={13} color="white"/>
                  Add manually
                </button>
              </motion.div>
            ) : (
              // ── Purchase list — rendered when data exists ──
              // TODO: map over real purchases from Supabase
              <div className="flex flex-col gap-3">
                {purchases.map((purchase, i) => (
                  <motion.div key={purchase.id}
                    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.05 }}
                    className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-gray-200 hover:shadow-sm transition-all">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background:purchase.typeBg }}>
                      <Icon path={ICONS.purchases} size={16} color={purchase.typeColor}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[14px] font-semibold text-gray-900 truncate">{purchase.title}</p>
                        <SourceBadge source={purchase.source}/>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] text-gray-400">
                          {new Date(purchase.purchased_at).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" })}
                        </p>
                        {purchase.amount > 0 && (
                          <>
                            <span className="text-gray-200">·</span>
                            <p className="text-[11px] text-gray-400">${purchase.amount}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {purchase.status === "not_started" ? (
                        <Link href={`/dashboard/planner/${purchase.planner_id}`}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all"
                          style={{ background:purchase.barColor }}>
                          Start →
                        </Link>
                      ) : (
                        <Link href={`/dashboard/planner/${purchase.planner_id}`}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                          style={{ background:purchase.typeBg, color:purchase.typeColor }}>
                          {purchase.status === "completed" ? "Review" : "Continue"} →
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
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
