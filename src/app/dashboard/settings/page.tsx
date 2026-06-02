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
  user:      "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  bell:      "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  card:      "M1 4h22v16H1z M1 10h22",
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  trash:     "M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
  check:     "M20 6L9 17l-5-5",
  edit:      "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
};

const NAV_ITEMS = [
  { label: "Dashboard", path: ICONS.dashboard, href: "/dashboard"          },
  { label: "My Library", path: ICONS.library,  href: "/dashboard/library"  },
  { label: "Progress",   path: ICONS.progress, href: "/dashboard/progress" },
  { label: "Explore",    path: ICONS.explore,  href: "/dashboard/explore"  },
  { label: "Settings",   path: ICONS.settings, href: "/dashboard/settings" },
];

const TABS = ["Account", "Notifications", "Billing", "Security"];

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

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)}
      className="relative w-10 h-5 rounded-full transition-colors shrink-0"
      style={{ background: on ? "#4f46e5" : "#e5e7eb" }}>
      <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all"
        style={{ left: on ? "22px" : "2px" }} />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("there");
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Account");
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({ streaks: true, reminders: true, weekly: true, marketing: false });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      const name = session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "there";
      setUserName(name);
      setDisplayName(name);
      setUserEmail(session.user.email || "");
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.replace("/"); };

  const handleSave = async () => {
    await supabase.auth.updateUser({ data: { display_name: displayName } });
    setUserName(displayName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center"><BoltIcon size={16} /></div>
        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  const initials = userName.slice(0, 2).toUpperCase();

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
          <span className="text-[14px] font-semibold text-gray-900">Settings</span>
          <div className="w-8" />
        </div>

        <div className="px-6 lg:px-8 py-7 max-w-2xl mx-auto space-y-6">

          {/* Header */}
          <div>
            <p className="text-[12px] text-gray-400 mb-0.5">Settings</p>
            <h1 className="text-[26px] font-bold text-gray-950 leading-none tracking-tight">Account settings</h1>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-all"
                style={activeTab === tab
                  ? { background: "#111827", color: "#fff" }
                  : { color: "#9ca3af" }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Account tab */}
          {activeTab === "Account" && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Avatar section */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-[18px] font-bold text-indigo-700">{initials}</span>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-gray-900">{userName}</p>
                    <p className="text-[12px] text-gray-400">{userEmail}</p>
                  </div>
                  <span className="ml-auto text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full">
                    Pro member
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Display name</label>
                    <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 text-[14px] text-gray-900 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Email address</label>
                    <input type="email" value={userEmail} disabled
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-[14px] text-gray-400 cursor-not-allowed" />
                    <p className="text-[11px] text-gray-400 mt-1">Contact support to change your email.</p>
                  </div>

                  <button onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-semibold transition-all">
                    {saved ? <><Icon path={ICONS.check} size={13} color="white" />Saved!</> : "Save changes"}
                  </button>
                </div>
              </div>

              {/* Danger zone */}
              <div className="bg-white border border-red-100 rounded-2xl p-6">
                <p className="text-[13px] font-semibold text-gray-800 mb-1">Danger zone</p>
                <p className="text-[12px] text-gray-400 mb-4">These actions are permanent and cannot be undone.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-[13px] font-semibold transition-all">
                    <Icon path={ICONS.logout} size={13} />Sign out
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl text-[13px] font-semibold transition-all">
                    <Icon path={ICONS.trash} size={13} color="#dc2626" />Delete account
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications tab */}
          {activeTab === "Notifications" && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
                {[
                  { key: "streaks" as keyof typeof notifs, label: "Streak reminders", desc: "Get notified before you break your streak" },
                  { key: "reminders" as keyof typeof notifs, label: "Daily check-ins", desc: "Morning nudges to open your active planners" },
                  { key: "weekly" as keyof typeof notifs, label: "Weekly summary", desc: "A recap of your progress every Sunday" },
                  { key: "marketing" as keyof typeof notifs, label: "New planners & updates", desc: "When we add new content to the library" },
                ].map((n, i) => (
                  <div key={n.key}>
                    {i > 0 && <div className="h-px bg-gray-100 mb-5" />}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900 mb-0.5">{n.label}</p>
                        <p className="text-[12px] text-gray-400">{n.desc}</p>
                      </div>
                      <Toggle on={notifs[n.key]} onChange={v => setNotifs(prev => ({ ...prev, [n.key]: v }))} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Billing tab */}
          {activeTab === "Billing" && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900 mb-0.5">Current plan</p>
                    <p className="text-[12px] text-gray-400">Billed monthly</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[20px] font-bold text-gray-950">$7<span className="text-[13px] font-normal text-gray-400">/mo</span></p>
                    <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">Pro</span>
                  </div>
                </div>
                <div className="h-px bg-gray-100 mb-5" />
                <div className="space-y-3">
                  {["200+ planners, guides & ebooks", "Streak tracking & analytics", "Progress dashboard", "Cancel anytime"].map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <Icon path={ICONS.check} size={9} color="#059669" />
                      </div>
                      <span className="text-[13px] text-gray-700">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-5">
                  <Link href="/pricing"
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-semibold transition-all">
                    Switch to yearly — save 42%
                  </Link>
                  <button className="px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl text-[13px] font-semibold transition-all">
                    Cancel plan
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security tab */}
          {activeTab === "Security" && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
                <div>
                  <p className="text-[13px] font-semibold text-gray-900 mb-1.5">Change password</p>
                  <p className="text-[12px] text-gray-400 mb-4">You'll be signed out and asked to sign back in.</p>
                  <button
                    onClick={() => supabase.auth.resetPasswordForEmail(userEmail)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl text-[13px] font-semibold transition-all">
                    <Icon path={ICONS.shield} size={13} />Send reset email
                  </button>
                </div>
                <div className="h-px bg-gray-100" />
                <div>
                  <p className="text-[13px] font-semibold text-gray-900 mb-1">Connected accounts</p>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mt-3">
                    <div className="flex items-center gap-2.5">
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-[13px] font-medium text-gray-700">Google</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Connected</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
