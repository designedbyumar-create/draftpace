"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

const BoltIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#4f46e5" stroke="#4338ca" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const Avatar = ({ bg, face, hair }: { bg: string; face: string; hair: string }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="14" fill={bg}/>
    <circle cx="14" cy="12" r="5.5" fill={face} opacity="0.9"/>
    <ellipse cx="14" cy="11" rx="5.5" ry="3.5" fill={hair}/>
    <ellipse cx="14" cy="22" rx="7" ry="5" fill={face} opacity="0.7"/>
  </svg>
);

const avatars = [
  { bg: "#e0e7ff", face: "#4338ca", hair: "#312e81" },
  { bg: "#fce7f3", face: "#be185d", hair: "#831843" },
  { bg: "#d1fae5", face: "#065f46", hair: "#064e3b" },
  { bg: "#fef3c7", face: "#92400e", hair: "#78350f" },
];

const streakDots = [1, 1, 1, 1, 1, 0.4, 0];

export default function Hero() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleStart = () => {
    if (email) router.push(`/signup?email=${encodeURIComponent(email)}`);
    else router.push("/signup");
  };

  return (
    
    <section className="relative bg-[#fafaf9] overflow-hidden border-b border-gray-100 flex items-center min-h-screen lg:min-h-[calc(100vh-80px)] pt-[100px]">

      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `linear-gradient(#e8e8e6 1px, transparent 1px), linear-gradient(90deg, #e8e8e6 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative w-full mx-auto max-w-6xl px-6 lg:px-8 py-24 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-0 items-center min-h-[calc(100vh-80px)]">

          {/* ── LEFT — Text ── */}
          <div className="flex flex-col py-16 lg:py-24 z-10">

            {/* Kicker */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm w-fit"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                The home for everything you've bought
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-black tracking-[-0.04em] text-gray-950 mb-6"
              style={{ fontSize: "clamp(38px, 5.5vw, 64px)", lineHeight: "1.0" }}
            >
              Your planner
              <br />
              deserves better
              <br />
              <span className="text-indigo-600">than a downloads</span>
              <br />
              <span className="text-indigo-600">folder.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[17px] text-gray-400 leading-[1.7] mb-9 max-w-[420px]"
            >
              Every planner, guide, and checklist you buy — now interactive, trackable, and alive.
            </motion.p>

            {/* Email capture */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex mb-6 bg-white border-[1.5px] border-gray-200 rounded-2xl overflow-hidden shadow-sm focus-within:border-indigo-400 transition-colors"
              style={{ maxWidth: "440px" }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder="Enter your email address"
                className="flex-1 border-none outline-none px-5 py-4 text-[15px] text-gray-900 placeholder-gray-400 bg-transparent min-w-0"
              />
              <button
                onClick={handleStart}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 m-1.5 rounded-xl text-[13px] font-bold transition-all active:scale-[0.97] whitespace-nowrap flex items-center gap-2 shrink-0"
              >
                Claim free access <ArrowRight size={13} />
              </button>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex items-center gap-3 flex-wrap"
            >
              <div className="flex items-center shrink-0">
                {avatars.map((av, i) => (
                  <div key={i} className="rounded-full border-2 border-white -ml-1.5 first:ml-0" style={{ zIndex: avatars.length - i }}>
                    <Avatar {...av} />
                  </div>
                ))}
              </div>
              <span className="text-[12px] font-semibold text-gray-600 shrink-0">2,400+ joined this week</span>
              <span className="w-px h-3 bg-gray-200 block shrink-0" />
              <span className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                <Check size={10} className="text-emerald-500" strokeWidth={3} />No credit card
              </span>
              <span className="w-px h-3 bg-gray-200 block shrink-0" />
              <span className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                <Check size={10} className="text-emerald-500" strokeWidth={3} />Cancel anytime
              </span>
            </motion.div>

          </div>

          {/* ── RIGHT — Floating widgets ── */}
          <div className="hidden lg:block relative h-full min-h-[calc(100vh-80px)]">

            {/* Book illustration — anchor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="absolute"
              style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
            >
              {/* Book shadow */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full"
                style={{ background: "rgba(0,0,0,0.08)", filter: "blur(8px)", bottom: "-12px" }}
              />
              {/* Book body */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
                style={{
                  width: "110px",
                  height: "148px",
                  background: "linear-gradient(145deg, #e0e7ff, #c7d2fe)",
                  borderRadius: "4px 14px 14px 4px",
                  boxShadow: "6px 6px 0 #a5b4fc, -3px 0 0 #818cf8",
                }}
              >
                {/* Spine */}
                <div className="absolute left-0 top-0 bottom-0 w-2 rounded-l-sm" style={{ background: "#818cf8" }} />
                {/* Page lines */}
                <div className="absolute right-0 top-0 bottom-0 w-px bg-white/30" />
                <div className="pl-5 pr-3 pt-5 flex flex-col gap-2">
                  {[80, 65, 75, 55, 70, 60, 50].map((w, i) => (
                    <div key={i} className="h-1 rounded-full" style={{ width: `${w}%`, background: "rgba(99,102,241,0.25)" }} />
                  ))}
                </div>
                {/* Small bookmark */}
                <div className="absolute top-0 right-6 w-3 h-5 rounded-b-sm" style={{ background: "#f97316" }} />
              </motion.div>
            </motion.div>

            {/* Widget 1 — Progress card (top left of right column) */}
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                className="absolute bg-white border border-gray-100 rounded-2xl p-4 shadow-md"
                style={{ left: "0%", top: "18%", width: "210px" }}
              >
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">In progress</p>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/>
                    </svg>
                  </div>
                  <p className="text-[12px] font-bold text-gray-900 leading-snug">Budget Reset Planner</p>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full mb-1.5">
                  <motion.div
                    className="h-full rounded-full bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: "68%" }}
                    transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-indigo-600">68%</span>
                  <span className="text-[10px] text-gray-400">Day 14</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Widget 2 — Checklist card (top right) */}
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.75, duration: 0.5 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bg-white border border-gray-100 rounded-2xl p-4 shadow-md"
                style={{ right: "0%", top: "12%", width: "175px" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                    </svg>
                  </div>
                  <p className="text-[11px] font-bold text-gray-900">Life Audit</p>
                </div>
                {[
                  { label: "Review last year", done: true },
                  { label: "Set 3 priorities", done: true },
                  { label: "Audit expenses", done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${item.done ? "bg-purple-500" : "border-2 border-gray-200"}`}>
                      {item.done && (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      )}
                    </div>
                    <span className={`text-[11px] font-medium ${item.done ? "line-through text-gray-400" : "text-gray-700"}`}>{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Widget 3 — Streak (bottom left) */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bg-white border border-gray-100 rounded-2xl p-4 shadow-md"
                style={{ left: "5%", bottom: "18%", width: "185px" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                    <BoltIcon size={15} />
                  </div>
                  <div>
                    <p className="text-[20px] font-black text-gray-950 leading-none">14</p>
                    <p className="text-[9px] text-indigo-500 font-semibold mt-0.5">day streak</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {streakDots.map((o, i) => (
                    <div key={i} className="flex-1 h-2 rounded-sm" style={{ background: o === 1 ? "#4f46e5" : o === 0.4 ? "#c7d2fe" : "#e8e8e8" }} />
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Widget 4 — Completion pill (bottom right) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bg-white border border-gray-100 rounded-2xl p-4 shadow-md"
                style={{ right: "2%", bottom: "22%", width: "180px" }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                    </svg>
                  </div>
                  <p className="text-[11px] font-bold text-gray-900">Atomic Habits</p>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full mb-1.5">
                  <motion.div
                    className="h-full rounded-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: "52%" }}
                    transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-emerald-600">52%</span>
                  <span className="text-[10px] text-gray-400">Ch. 8 of 15</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Widget 5 — Done pill floating top center */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bg-white border border-gray-100 rounded-full px-4 py-2.5 shadow-md flex items-center gap-2"
                style={{ left: "25%", top: "10%" }}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-gray-700">Life Audit — 83% done</span>
              </motion.div>
            </motion.div>

          </div>

        </div>
      </div>

      {/* Mobile widgets — shown below text on small screens */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 px-6 pb-8 flex gap-3 overflow-x-auto">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm shrink-0 flex items-center gap-3" style={{ width: "180px" }}>
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <BoltIcon size={13} />
          </div>
          <div>
            <p className="text-[18px] font-black text-gray-950 leading-none">14</p>
            <p className="text-[9px] text-indigo-500 font-semibold">day streak</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm shrink-0" style={{ width: "190px" }}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Budget Planner</p>
          <div className="h-1.5 bg-gray-100 rounded-full mb-1">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: "68%" }} />
          </div>
          <p className="text-[10px] font-bold text-indigo-600">68% complete</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm shrink-0 flex items-center gap-2" style={{ width: "170px" }}>
          <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <span className="text-[11px] font-bold text-gray-700">83% done today</span>
        </div>
      </div>

    </section>
  );
}