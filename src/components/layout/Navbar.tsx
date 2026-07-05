"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Store", href: "/store" },
  { label: "Pricing", href: "/pricing" },
];

const MenuArrow = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        setUserName(session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "");
        setUserEmail(session.user.email || "");
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
      if (session) {
        setUserName(session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "");
        setUserEmail(session.user.email || "");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setDropOpen(false);
    setMenuOpen(false);
    router.replace("/");
  };

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/progress") ||
    pathname.startsWith("/account")
  ) return null;

  const initials = userName.slice(0, 2).toUpperCase() || "U";
  const firstName = userName.split(" ")[0];

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-4 pt-4">

      <div className="mx-auto max-w-6xl flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 sm:px-6 py-3 shadow-sm">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo/dp-mono.svg" alt="Draftpace" width={36} height={36} priority className="shrink-0"/>
          <div className="leading-none">
            <p className="text-[15px] font-bold tracking-[-0.02em] text-gray-950 leading-none">Draftpace</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Momentum OS</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <Link key={l.label} href={l.href}
              className="px-4 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isLoggedIn ? (
            <>
              {/* Desktop — avatar pill + dropdown */}
              <div className="hidden lg:block relative" ref={dropRef}>
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-white">{initials}</span>
                  </div>
                  <span className="text-[13px] font-medium text-gray-800">{firstName}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    className={`text-gray-400 transition-transform ${dropOpen ? "rotate-180" : ""}`}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                        <span className="text-[12px] font-bold text-white">{initials}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-gray-900 truncate">{firstName}</p>
                        <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <Link href="/dashboard" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                        Open app
                      </Link>
                      <Link href="/dashboard/library" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                        My library
                      </Link>
                      <Link href="/dashboard/settings" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/></svg>
                        Settings
                      </Link>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="p-1.5">
                      <button onClick={handleSignOut}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors w-full">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile — avatar opens drawer */}
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex lg:hidden w-9 h-9 rounded-full bg-indigo-600 items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-white">{initials}</span>
              </button>
            </>
          ) : (
            <>
              {/* Desktop logged out */}
              <Link href="/login"
                className="hidden lg:block text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap px-3 py-2">
                Sign in
              </Link>
              <div className="hidden lg:block w-px h-4 bg-gray-200" />
              <Link href="/signup"
                className="hidden sm:flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-[13px] font-semibold text-white transition-all active:scale-[0.98] whitespace-nowrap">
                Get started <MenuArrow />
              </Link>

              {/* Mobile logged out */}
              <Link href="/signup"
                className="sm:hidden flex items-center rounded-xl bg-indigo-600 px-3 py-2 text-[12px] font-semibold text-white">
                Get started
              </Link>
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex lg:hidden items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                {menuOpen
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
                }
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-gray-200 bg-white shadow-sm lg:hidden overflow-hidden">
          <div className="px-3 pt-3 pb-2">
            {NAV_LINKS.map(l => (
              <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-3 text-[14px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                {l.label} <MenuArrow />
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 p-3">
            {isLoggedIn ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                    <span className="text-[13px] font-bold text-white">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900 truncate">{firstName}</p>
                    <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-[12px] font-semibold shrink-0">
                    Open app <MenuArrow size={11} />
                  </Link>
                </div>
                <button onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full border border-gray-200 text-red-600 px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-red-50 transition-colors">
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center w-full border border-gray-200 text-gray-700 px-5 py-3 rounded-xl text-[13px] font-semibold hover:bg-gray-50 transition-colors">
                  Sign in
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-[13px] font-semibold transition-colors">
                  Get started free <MenuArrow />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
