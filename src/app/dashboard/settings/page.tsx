"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

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
  chevron:   "M9 6l6 6-6 6",
  check:     "M20 6L9 17l-5-5",
  user:      "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  mail:      "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  bell:      "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  clock:     "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  crown:     "M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z M5 20h14",
  link:      "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  trash:     "M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6",
  edit:      "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  download:  "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  external:  "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6 M15 3h6v6 M10 14L21 3",
  bolt:      "M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z",
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

const REMINDER_TIMES = [
  "6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM",
  "10:00 AM","10:30 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM",
  "4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM","9:00 PM","10:00 PM",
];

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE
// ─────────────────────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled:boolean; onChange:(v:boolean)=>void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onChange(!enabled); }}
      className="relative shrink-0 transition-colors duration-200"
      style={{ width:44, height:24, borderRadius:99, background:enabled?"#4f46e5":"#e5e7eb" }}>
      <div
        className="absolute top-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out"
        style={{ transform: enabled ? "translateX(20px)" : "translateX(2px)" }}
      />
    </button>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// SETTING ROW
// ─────────────────────────────────────────────────────────────────────────────
function SettingRow({
  iconPath, iconBg="#f3f4f6", iconColor="#6b7280",
  label, sublabel, value,
  onClick, toggle, toggleEnabled, onToggle,
  destructive=false, disabled=false,
  badge,
}: {
  iconPath:string; iconBg?:string; iconColor?:string;
  label:string; sublabel?:string; value?:string;
  onClick?:()=>void; toggle?:boolean;
  toggleEnabled?:boolean; onToggle?:(v:boolean)=>void;
  destructive?:boolean; disabled?:boolean;
  badge?:string;
}) {
  return (
    <button
      onClick={toggle ? undefined : onClick}
      disabled={disabled}
      className={`flex items-center gap-3.5 w-full px-4 py-3.5 transition-colors text-left
        ${disabled ? "opacity-40 cursor-not-allowed" : onClick || toggle ? "hover:bg-gray-50 active:bg-gray-100" : "cursor-default"}`}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background:destructive?"#fef2f2":iconBg }}>
        <Icon path={iconPath} size={15} color={destructive?"#ef4444":iconColor}/>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-medium leading-tight ${destructive?"text-red-600":"text-gray-900"}`}>
          {label}
        </p>
        {sublabel && <p className="text-[12px] text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      {badge && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
          {badge}
        </span>
      )}
      {value && <span className="text-[13px] text-gray-400 shrink-0">{value}</span>}
      {toggle && onToggle && (
        <Toggle enabled={toggleEnabled??false} onChange={onToggle}/>
      )}
      {!toggle && onClick && (
        <Icon path={ICONS.chevron} size={14} color="#d1d5db"/>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTING SECTION
// ─────────────────────────────────────────────────────────────────────────────
function SettingSection({ title, children }: { title?:string; children:React.ReactNode }) {
  return (
    <div>
      {title && (
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-1 mb-2">
          {title}
        </p>
      )}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT NAME MODAL
// ─────────────────────────────────────────────────────────────────────────────
function EditNameModal({ current, onSave, onClose }: {
  current:string; onSave:(name:string)=>void; onClose:()=>void;
}) {
  const [name, setName] = useState(current);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || name === current) { onClose(); return; }
    setSaving(true);
    await supabase.auth.updateUser({ data:{ display_name:name.trim() } });
    onSave(name.trim());
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background:"rgba(0,0,0,0.4)" }} onClick={onClose}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        exit={{ opacity:0, y:20 }} transition={{ duration:0.22 }}
        className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 sm:m-4"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-bold text-gray-950">Edit display name</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <Icon path={ICONS.close} size={15}/>
          </button>
        </div>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key==="Enter" && handleSave()}
          autoFocus
          className="w-full h-12 bg-gray-50 border border-gray-200 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 text-[15px] text-gray-900 mb-4 transition-all"/>
        <button onClick={handleSave} disabled={saving || !name.trim()}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-[14px]">
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : "Save changes"}
        </button>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REMINDER TIME PICKER MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ReminderTimePicker({ current, onSave, onClose }: {
  current:string; onSave:(time:string)=>void; onClose:()=>void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background:"rgba(0,0,0,0.4)" }} onClick={onClose}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        exit={{ opacity:0, y:20 }} transition={{ duration:0.22 }}
        className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl sm:m-4 overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-[17px] font-bold text-gray-950">Daily reminder</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <Icon path={ICONS.close} size={15}/>
          </button>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {REMINDER_TIMES.map(time => (
            <button key={time} onClick={() => { onSave(time); onClose(); }}
              className={`flex items-center justify-between w-full px-5 py-3.5 text-[14px] font-medium transition-colors hover:bg-gray-50
                ${time===current ? "text-indigo-600 bg-indigo-50" : "text-gray-700"}`}>
              {time}
              {time===current && <Icon path={ICONS.check} size={14} color="#4f46e5"/>}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE ACCOUNT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function DeleteAccountModal({ onClose, onConfirm }: { onClose:()=>void; onConfirm:()=>void }) {
  const [input, setInput] = useState("");
  const confirmed = input === "DELETE";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background:"rgba(0,0,0,0.5)" }} onClick={onClose}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        exit={{ opacity:0, y:20 }} transition={{ duration:0.22 }}
        className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 sm:m-4"
        onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <Icon path={ICONS.trash} size={22} color="#ef4444"/>
        </div>
        <h2 className="text-[18px] font-bold text-gray-950 text-center mb-1">Delete your account?</h2>
        <p className="text-[13px] text-gray-400 text-center mb-5 leading-relaxed">
          This permanently deletes your account, all your progress, streaks, and drafts. There's no undo.
        </p>
        <p className="text-[12px] font-semibold text-gray-600 mb-2">Type <strong>DELETE</strong> to confirm</p>
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="DELETE"
          className="w-full h-11 bg-gray-50 border border-gray-200 focus:border-red-400 focus:outline-none rounded-xl px-4 text-[14px] text-gray-900 placeholder-gray-300 mb-4 transition-all"/>
        <button onClick={onConfirm} disabled={!confirmed}
          className="w-full h-12 bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-[14px] mb-3">
          Delete my account
        </button>
        <button onClick={onClose}
          className="w-full text-[13px] text-gray-400 hover:text-gray-600 transition-colors py-2 text-center">
          Cancel
        </button>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN OUT CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────
function SignOutModal({ onClose, onConfirm }: { onClose:()=>void; onConfirm:()=>void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background:"rgba(0,0,0,0.4)" }} onClick={onClose}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        exit={{ opacity:0, y:20 }} transition={{ duration:0.22 }}
        className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 sm:m-4"
        onClick={e => e.stopPropagation()}>
        <h2 className="text-[18px] font-bold text-gray-950 mb-1">Sign out?</h2>
        <p className="text-[13px] text-gray-400 mb-5">Your progress and streaks are saved. You can sign back in anytime.</p>
        <button onClick={onConfirm}
          className="w-full h-12 bg-gray-950 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all text-[14px] mb-3">
          Sign out
        </button>
        <button onClick={onClose}
          className="w-full text-[13px] text-gray-400 hover:text-gray-600 transition-colors py-2 text-center">
          Cancel
        </button>
      </motion.div>
    </div>
  );
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
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();

  // ── Auth ──
  const [loading,     setLoading]     = useState(true);
  const [userName,    setUserName]    = useState("there");
  const [userEmail,   setUserEmail]   = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Modals ──
  const [showEditName,    setShowEditName]    = useState(false);
  const [showReminder,    setShowReminder]    = useState(false);
  const [showSignOut,     setShowSignOut]     = useState(false);
  const [showDeleteAcct,  setShowDeleteAcct]  = useState(false);

  // ── Settings state ──
  const [plan,              ] = useState<"free"|"pro">("free");
  const [reminderEnabled,   setReminderEnabled]   = useState(true);
  const [reminderTime,      setReminderTime]      = useState("9:00 AM");
  const [streakAlert,       setStreakAlert]        = useState(true);
  const [completionCelebrate,setCompletionCelebrate]=useState(true);
  const [gumroadConnected,  setGumroadConnected]  = useState(false);
  const [etsyConnected,     setEtsyConnected]     = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState<string|null>(null);
  const showToast = (msg:string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data:{ session } }) => {
      if (!session) { router.replace("/login"); return; }
      setUserName(session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "there");
      setUserEmail(session.user.email || "");
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const handleDeleteAccount = async () => {
    // TODO: supabase.auth.admin.deleteUser — requires server-side edge function
    await supabase.auth.signOut();
    router.replace("/");
  };

  const handleGumroadConnect = () => {
    // TODO: Gumroad OAuth
    if (gumroadConnected) { setGumroadConnected(false); showToast("Gumroad disconnected"); }
    else { setGumroadConnected(true); showToast("Gumroad connected"); }
  };

  const handleEtsyConnect = () => {
    // TODO: Etsy OAuth
    if (etsyConnected) { setEtsyConnected(false); showToast("Etsy disconnected"); }
    else { setEtsyConnected(true); showToast("Etsy connected"); }
  };

  const handleExportData = () => {
    // TODO: generate and download CSV/JSON of user data
    showToast("Export started — check your email shortly");
  };

  const initials    = userName.slice(0,2).toUpperCase();
  const firstName   = userName.split(" ")[0];

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
        <Sidebar name={userName} email={userEmail} onSignOut={() => setShowSignOut(true)}/>
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
              <Sidebar name={userName} email={userEmail}
                onSignOut={() => { setSidebarOpen(false); setShowSignOut(true); }}
                mobile onClose={() => setSidebarOpen(false)}/>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showEditName   && <EditNameModal current={userName} onSave={name => { setUserName(name); showToast("Name updated"); }} onClose={() => setShowEditName(false)}/>}
        {showReminder   && <ReminderTimePicker current={reminderTime} onSave={t => { setReminderTime(t); showToast(`Reminder set for ${t}`); }} onClose={() => setShowReminder(false)}/>}
        {showSignOut    && <SignOutModal onClose={() => setShowSignOut(false)} onConfirm={handleSignOut}/>}
        {showDeleteAcct && <DeleteAccountModal onClose={() => setShowDeleteAcct(false)} onConfirm={handleDeleteAccount}/>}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:10 }} transition={{ duration:0.2 }}
            className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-950 text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap">
            <Icon path={ICONS.check} size={13} color="white"/>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto">

        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <Image src="/logo/dp-mono.svg" alt="Draftpace" width={30} height={30}/>
            <span className="text-[14px] font-semibold text-gray-900">Settings</span>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-[10px] font-bold text-indigo-700">{initials}</span>
            </div>
          </div>
        </div>

        {/* Desktop breadcrumb header */}
        <div className="hidden lg:block sticky top-0 z-30 bg-white border-b border-gray-100 px-6 lg:px-8">
          <div className="max-w-2xl mx-auto flex items-center h-[54px]">
            <div className="flex items-center gap-1.5 text-[12px]">
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 font-medium transition-colors">Home</Link>
              <Icon path={ICONS.chevron} size={12} color="#d1d5db"/>
              <span className="text-gray-900 font-semibold">Settings</span>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-8 py-5 lg:py-7 max-w-2xl mx-auto w-full space-y-6 pb-24 lg:pb-10">

          {/* ── PROFILE CARD ── */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            className="bg-white border border-gray-100 rounded-3xl p-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-[22px] font-black text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-bold text-gray-950 leading-tight">{userName}</h2>
              <p className="text-[13px] text-gray-400 truncate">{userEmail}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan==="pro" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-gray-100 text-gray-500"}`}>
                  {plan==="pro" ? "Pro member" : "Free plan"}
                </span>
                {plan==="free" && (
                  <Link href="/pricing" className="text-[10px] font-semibold text-indigo-600 hover:underline">
                    Upgrade →
                  </Link>
                )}
              </div>
            </div>
            <button onClick={() => setShowEditName(true)}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0">
              <Icon path={ICONS.edit} size={15} color="#6b7280"/>
            </button>
          </motion.div>

          {/* ── SUBSCRIPTION ── */}
          <SettingSection title="Subscription">
            {plan === "free" ? (
              <>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900">Free plan</p>
                      <p className="text-[12px] text-gray-400">3 planners · Basic streak tracking</p>
                    </div>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">Current</span>
                  </div>
                  <Link href="/pricing"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold transition-all">
                    <Icon path={ICONS.crown} size={14} color="white"/>
                    Upgrade to Pro — $7/mo
                  </Link>
                </div>
                <div className="px-4 py-3 bg-gray-50 flex items-center gap-3">
                  <Icon path={ICONS.bolt} size={13} color="#9ca3af"/>
                  <p className="text-[12px] text-gray-400">Pro includes all 200+ planners, unlimited streaks, and priority support.</p>
                </div>
              </>
            ) : (
              <>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900">Pro — $7/mo</p>
                      <p className="text-[12px] text-gray-400">All 200+ planners · Unlimited everything</p>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full">Active</span>
                  </div>
                </div>
                <SettingRow iconPath={ICONS.external} label="Manage billing" sublabel="Change plan or cancel" onClick={() => window.open("https://billing.stripe.com","_blank")}/>
              </>
            )}
          </SettingSection>

          {/* ── NOTIFICATIONS ── */}
          <SettingSection title="Notifications">
            <SettingRow
              iconPath={ICONS.bell} iconBg="#fff7ed" iconColor="#f97316"
              label="Daily reminder"
              sublabel="Nudge me to open my planner"
              toggle toggleEnabled={reminderEnabled}
              onToggle={v => { setReminderEnabled(v); showToast(v ? "Reminders on" : "Reminders off"); }}
            />
            <SettingRow
              iconPath={ICONS.clock} iconBg="#eef2ff" iconColor="#4f46e5"
              label="Reminder time"
              sublabel="When should we nudge you?"
              value={reminderEnabled ? reminderTime : "Off"}
              onClick={reminderEnabled ? () => setShowReminder(true) : undefined}
              disabled={!reminderEnabled}
            />
            <SettingRow
              iconPath={ICONS.flame} iconBg="#fff7ed" iconColor="#ea580c"
              label="Streak alert"
              sublabel="Warn me before I break my streak"
              toggle toggleEnabled={streakAlert}
              onToggle={v => { setStreakAlert(v); showToast(v ? "Streak alerts on" : "Streak alerts off"); }}
            />
            <SettingRow
              iconPath={ICONS.check} iconBg="#ecfdf5" iconColor="#059669"
              label="Completion celebration"
              sublabel="Celebrate when I finish a planner"
              toggle toggleEnabled={completionCelebrate}
              onToggle={v => { setCompletionCelebrate(v); showToast(v ? "Celebrations on" : "Celebrations off"); }}
            />
          </SettingSection>

          {/* ── CONNECTED ACCOUNTS ── */}
          <SettingSection title="Connected accounts">
            <div className="px-4 py-3 bg-gray-50">
              <p className="text-[12px] text-gray-400 leading-relaxed">
                Connect Gumroad or Etsy to auto-import planners you've bought externally into your Drafts.
              </p>
            </div>
            <SettingRow
              iconPath={ICONS.link} iconBg="#fff0f7" iconColor="#be185d"
              label="Gumroad"
              sublabel={gumroadConnected ? "Auto-importing purchases" : "Not connected"}
              badge={gumroadConnected ? "Connected" : undefined}
              onClick={handleGumroadConnect}
            />
            <SettingRow
              iconPath={ICONS.link} iconBg="#fff7ed" iconColor="#c2410c"
              label="Etsy"
              sublabel={etsyConnected ? "Auto-importing purchases" : "Not connected"}
              badge={etsyConnected ? "Connected" : undefined}
              onClick={handleEtsyConnect}
            />
          </SettingSection>

          {/* ── DATA & PRIVACY ── */}
          <SettingSection title="Data & privacy">
            <SettingRow
              iconPath={ICONS.download} iconBg="#f0fdfa" iconColor="#0d9488"
              label="Export my data"
              sublabel="Download your progress and history"
              onClick={handleExportData}
            />
            <SettingRow
              iconPath={ICONS.shield} iconBg="#eef2ff" iconColor="#4f46e5"
              label="Privacy policy"
              sublabel="How we handle your data"
              onClick={() => window.open("/privacy","_blank")}
            />
            <SettingRow
              iconPath={ICONS.external} iconBg="#f9fafb" iconColor="#6b7280"
              label="Terms of service"
              sublabel="Your rights and ours"
              onClick={() => window.open("/terms","_blank")}
            />
          </SettingSection>

          {/* ── SUPPORT ── */}
          <SettingSection title="Support">
            <SettingRow
              iconPath={ICONS.mail} iconBg="#f0fdfa" iconColor="#0d9488"
              label="Contact support"
              sublabel="Get help from the team"
              onClick={() => window.open("mailto:support@draftpace.com","_blank")}
            />
          </SettingSection>

          {/* ── ACCOUNT ── */}
          <SettingSection title="Account">
            <SettingRow
              iconPath={ICONS.logout}
              label="Sign out"
              sublabel="Your progress stays saved"
              onClick={() => setShowSignOut(true)}
            />
            <SettingRow
              iconPath={ICONS.trash}
              label="Delete account"
              sublabel="Permanently remove your account and data"
              onClick={() => setShowDeleteAcct(true)}
              destructive
            />
          </SettingSection>

          {/* App version */}
          <p className="text-center text-[11px] text-gray-300 pb-2">
            Draftpace · v0.1.0 · Momentum OS
          </p>

        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav/>
      </div>

    </div>
  );
}
