import Image from "next/image";
import { ArrowRight } from "@/components/ui/Icon";
import { MarketingButton } from "@/components/marketing/ui";

// ── Custom principle icons ─────────────────────────────────────────────────

const IconStreak = ({ color }: { color: string }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    {/* 7 bars growing left to right — daily consistency compounding */}
    {[
      { x: 4,  h: 8,  o: 0.25 },
      { x: 10, h: 12, o: 0.35 },
      { x: 16, h: 16, o: 0.5  },
      { x: 22, h: 20, o: 0.65 },
      { x: 28, h: 26, o: 0.8  },
      { x: 34, h: 32, o: 1    },
    ].map((b, i) => (
      <rect key={i} x={b.x} y={40 - b.h - 2} width="4" height={b.h}
        rx="2" fill={color} opacity={b.o}/>
    ))}
  </svg>
);

const IconProgress = ({ color }: { color: string }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    {/* Arc showing ~68% complete — progress not perfection */}
    <circle cx="20" cy="22" r="13" stroke={color} strokeWidth="2" opacity="0.15"/>
    <path d="M7 22 A13 13 0 1 1 31.5 9.5"
      stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* Percentage label */}
    <text x="20" y="26" textAnchor="middle" fontSize="9" fontWeight="700"
      fill={color} fontFamily="system-ui">68%</text>
    {/* Dot at endpoint */}
    <circle cx="31.5" cy="9.5" r="2.5" fill={color}/>
  </svg>
);

const IconMomentum = ({ color }: { color: string }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    {/* Exponential growth curve */}
    <path d="M4 34 C4 34 10 33 16 28 C22 22 26 12 36 4"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    {/* Trail dots showing compounding */}
    <circle cx="4"  cy="34" r="2" fill={color} opacity="0.3"/>
    <circle cx="12" cy="31" r="2" fill={color} opacity="0.5"/>
    <circle cx="20" cy="24" r="2" fill={color} opacity="0.7"/>
    <circle cx="28" cy="14" r="2.5" fill={color} opacity="0.9"/>
    <circle cx="36" cy="4"  r="3" fill={color}/>
  </svg>
);

const IconPace = ({ color }: { color: string }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    {/* Winding path from A to B — your route, your pace */}
    <path d="M6 34 C6 34 14 34 18 26 C22 18 18 14 22 8 C26 2 34 6 34 6"
      stroke={color} strokeWidth="2.5" strokeLinecap="round"
      strokeDasharray="2 3" fill="none" opacity="0.4"/>
    <path d="M6 34 C6 34 14 34 18 26 C22 18 18 14 22 8"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    {/* Start + end markers */}
    <circle cx="6"  cy="34" r="3" fill={color} opacity="0.5"/>
    <circle cx="34" cy="6"  r="3" fill={color}/>
    <circle cx="34" cy="6"  r="6" stroke={color} strokeWidth="1.5"
      fill="none" opacity="0.2"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

const PRINCIPLES = [
  {
    Icon: IconStreak,
    color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe",
    title: "Consistency over intensity",
    body: "Showing up every day for 20 minutes beats an 8-hour sprint once a month. We build for the long game, not the launch day.",
  },
  {
    Icon: IconProgress,
    color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4",
    title: "Progress over perfection",
    body: "68% done is better than 0% started. Draftpace never punishes you for an imperfect week — it just helps you pick back up.",
  },
  {
    Icon: IconMomentum,
    color: "#7c3aed", bg: "#fdf4ff", border: "#ddd6fe",
    title: "Momentum compounds",
    body: "A 14-day streak isn't just 14 days — it's proof of a system that works. Small actions compound into identity shifts.",
  },
  {
    Icon: IconPace,
    color: "#f97316", bg: "#fff7ed", border: "#fed7aa",
    title: "Your pace, your plan",
    body: "No shame nudges. No rigid schedules. A system that adapts to your life and keeps moving forward regardless of yesterday.",
  },
];

const STATS = [
  { val: "200+",  label: "planners in the store"           },
  { val: "3",     label: "free planners, no card needed"   },
  { val: "3",     label: "sources — App, Gumroad & Etsy"   },
  { val: "$7/mo", label: "unlocks everything, cancel anytime" },
];

const MANIFESTO = [
  {
    quote: "We measure success in streaks built — not features shipped.",
    sub: "A user finishing their first 30-day planner matters more to us than any new UI.",
  },
  {
    quote: "We build tools we'd use ourselves, for goals we actually have.",
    sub: "Every planner in the store gets tested against a real problem, not a persona.",
  },
  {
    quote: "Consistency is the product. Everything else is the wrapper.",
    sub: "Streaks, nudges, progress bars — they exist for one reason: to help you show up again tomorrow.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fafaf9]">

      {/* ── HERO ── */}
      <section
        className="bg-white border-b border-gray-100 px-6 lg:px-8 pt-28 pb-20"
        style={{
          backgroundImage: `linear-gradient(#e8e8e6 1px, transparent 1px), linear-gradient(90deg, #e8e8e6 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
        }}
      >
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full mb-7">
            <Image src="/logo/dp-mono.svg" alt="Draftpace" width={13} height={13}/>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">About Draftpace</span>
          </div>

          <h1
            className="font-black text-gray-950 leading-[1.0] mb-6"
            style={{ fontSize: "clamp(36px, 6vw, 64px)", letterSpacing: "-0.04em" }}
          >
            We're building the
            <br />
            <span className="text-indigo-600">operating system</span>
            <br />
            for personal momentum.
          </h1>

          <p className="text-[17px] text-gray-500 leading-relaxed max-w-xl mb-8">
            Draftpace is the layer between buying a planner and actually using it. Streak tracking, daily nudges, real progress — across Gumroad, Etsy, and in-app.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <MarketingButton href="/signup" size="lg" iconRight={<ArrowRight size={15} />}>
              Start for free
            </MarketingButton>
            <MarketingButton href="/store" variant="ghost" iconRight={<ArrowRight size={14} />}>
              Browse planners
            </MarketingButton>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-b border-gray-100 px-6 lg:px-8 py-10">
        <div className="mx-auto max-w-4xl grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-black text-gray-950 leading-none mb-1.5"
                style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.04em" }}>
                {s.val}
              </p>
              <p className="text-[13px] text-gray-400 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-4xl grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">The problem</p>
            <h2 className="font-black text-gray-950 leading-tight mb-5"
              style={{ fontSize: "clamp(22px, 3vw, 30px)", letterSpacing: "-0.03em" }}>
              Most planners are abandoned by day three.
            </h2>
            <div className="space-y-4 text-[15px] text-gray-500 leading-relaxed">
              <p>You find a planner on Etsy or Gumroad. It's beautifully designed. You buy it, download it, open it once. Then life happens — and the PDF sits untouched forever.</p>
              <p>The problem isn't the planner. It's that a static file has no idea whether you showed up yesterday. It can't build a streak. It won't nudge you when Wednesday disappears unchecked.</p>
              <p>Motivation gets you started. Systems keep you going. Most planners only do the first half.</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Our answer</p>
            <h2 className="font-black text-gray-950 leading-tight mb-5"
              style={{ fontSize: "clamp(22px, 3vw, 30px)", letterSpacing: "-0.03em" }}>
              Draftpace is the layer between buying and using.
            </h2>
            <div className="space-y-4 text-[15px] text-gray-500 leading-relaxed">
              <p>We take the planners you already love — from Gumroad, Etsy, or our own store — and make them interactive. Track your progress. Build streaks. Get nudged when you've gone quiet.</p>
              <p>Every check-in adds to a streak. Every streak is proof you showed up. That compounds over weeks and months into something real: identity.</p>
              <p>Draftpace doesn't replace your planner. It makes sure you actually use it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PULL QUOTE ── */}
      <section className="px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-3xl px-8 lg:px-14 py-12 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1e1b4b 50%, #4c1d95 100%)" }}>
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}/>
            <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle, #a78bfa, transparent)", transform: "translate(30%,-40%)" }}/>
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-5">What we believe</p>
              <p className="font-black text-white leading-tight max-w-2xl"
                style={{ fontSize: "clamp(24px, 4vw, 42px)", letterSpacing: "-0.03em" }}>
                "A planner you track is worth ten you own."
              </p>
              <p className="text-[16px] text-indigo-200 mt-5 max-w-lg leading-relaxed">
                The goal was never to sell more content. The goal is to make sure you finish what you started.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRINCIPLES ── */}
      <section className="px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">How we think</p>
          <h2 className="font-black text-gray-950 leading-tight mb-10"
            style={{ fontSize: "clamp(22px, 3vw, 32px)", letterSpacing: "-0.03em" }}>
            The principles behind every decision.
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {PRINCIPLES.map((p) => (
              <div key={p.title}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-sm transition-all group">
                {/* Custom icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-105"
                  style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                  <p.Icon color={p.color}/>
                </div>
                <h3 className="text-[16px] font-bold text-gray-950 mb-2 leading-tight">{p.title}</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 lg:px-8 py-16 bg-white border-y border-gray-100">
        <div className="mx-auto max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">The model</p>
          <h2 className="font-black text-gray-950 leading-tight mb-10"
            style={{ fontSize: "clamp(22px, 3vw, 32px)", letterSpacing: "-0.03em" }}>
            Buy anywhere. Track everything here.
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step:"01", title:"Find a planner", body:"Browse our store, or buy from Gumroad and Etsy. Money, habits, mindset, productivity — all trackable.", color:"#4f46e5", bg:"#eef2ff", border:"#c7d2fe" },
              { step:"02", title:"Connect & import", body:"Link your Gumroad or Etsy account once. External purchases auto-import into your Drafts instantly.", color:"#0d9488", bg:"#f0fdfa", border:"#99f6e4" },
              { step:"03", title:"Build momentum", body:"Daily check-ins, streak counters, progress bars. Draftpace knows when you showed up — and makes it easy to come back.", color:"#7c3aed", bg:"#fdf4ff", border:"#ddd6fe" },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl p-6 border"
                style={{ background: item.bg, borderColor: item.border }}>
                <p className="text-[11px] font-black uppercase tracking-widest mb-3"
                  style={{ color: item.color }}>Step {item.step}</p>
                <h3 className="text-[16px] font-bold text-gray-950 mb-2">{item.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: item.color, opacity: 0.8 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section className="px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">The standard</p>
          <h2 className="font-black text-gray-950 leading-tight mb-12"
            style={{ fontSize: "clamp(22px, 3vw, 32px)", letterSpacing: "-0.03em" }}>
            What we hold ourselves to.
          </h2>

          <div className="flex flex-col gap-0">
            {MANIFESTO.map((m, i) => (
              <div key={i}
                className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-10 py-8 border-b border-gray-100 group">
                <span className="text-[11px] font-black text-gray-300 tracking-widest shrink-0 pt-1">
                  0{i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-gray-950 leading-snug mb-2 group-hover:text-indigo-600 transition-colors"
                    style={{ fontSize: "clamp(16px, 2vw, 20px)", letterSpacing: "-0.02em" }}>
                    {m.quote}
                  </p>
                  <p className="text-[14px] text-gray-400 leading-relaxed max-w-lg">{m.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 lg:px-8 pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-3xl overflow-hidden px-8 lg:px-12 py-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
            style={{ background: "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 50%, #fce7f3 100%)", border: "1px solid rgba(99,102,241,0.15)" }}>
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle, #4f46e5 1px, transparent 1px)", backgroundSize: "24px 24px" }}/>
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 mb-2">Get started today</p>
              <h2 className="font-black text-gray-950 leading-tight mb-2"
                style={{ fontSize: "clamp(22px, 3.5vw, 36px)", letterSpacing: "-0.03em" }}>
                Three planners free.
                <span className="block text-indigo-600">No credit card. No catch.</span>
              </h2>
              <p className="text-[14px] text-gray-500">Pick a planner, start today, build your first streak.</p>
            </div>
            <div className="relative flex flex-col gap-3 shrink-0 w-full lg:w-auto">
              <MarketingButton href="/signup" size="lg" iconRight={<ArrowRight size={15} />}>
                Create free account
              </MarketingButton>
              <MarketingButton href="/store" variant="ghost">
                Browse the store first →
              </MarketingButton>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
