"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { ArrowRight, BookOpen, CaretDown, LogOut, Menu, Settings, SquaresFour, X } from "@/components/ui/Icon";
import { MarketingButton } from "@/components/marketing/ui";

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
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/progress") ||
    pathname.startsWith("/account")
  ) return null;

  const initials = userName.slice(0, 2).toUpperCase() || "U";
  const firstName = userName.split(" ")[0];

  const NAV_LINKS = [
    { label: "Features", href: "/features" },
    { label: "Store",    href: "/store"      },
    { label: "Pricing",  href: "/pricing"    },
  ];

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-4 pt-4">

      <div className="mx-auto max-w-6xl flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 sm:px-6 py-3 shadow-sm">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/logo/draftpace-brand-logo.svg"
            alt="Draftpace"
            width={168}
            height={52}
            priority
            className="h-auto w-[168px] shrink-0"
          />
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
                  <CaretDown size={12} className={`text-gray-400 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
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
                        <SquaresFour size={15} />
                        Open app
                      </Link>
                      <Link href="/dashboard/library" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <BookOpen size={15} />
                        My library
                      </Link>
                      <Link href="/dashboard/settings" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings size={15} />
                        Settings
                      </Link>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="p-1.5">
                      <button onClick={handleSignOut}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors w-full">
                        <LogOut size={15} />
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
              <MarketingButton
                href="/signup"
                size="sm"
                className="hidden sm:flex"
                iconRight={<ArrowRight size={13} />}
              >
                Get started
              </MarketingButton>

              {/* Mobile logged out */}
              <MarketingButton href="/signup" size="sm" className="sm:hidden px-3 text-[12px]">
                Get started
              </MarketingButton>
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex lg:hidden items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                {menuOpen
                  ? <X size={16} />
                  : <Menu size={16} />
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
                {l.label} <ArrowRight size={13} />
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
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--marketing-primary)] text-white text-[12px] font-semibold shrink-0">
                    Open app <ArrowRight size={11} />
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
                <MarketingButton
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  fullWidth
                  iconRight={<ArrowRight size={13} />}
                >
                  Get started free
                </MarketingButton>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
