"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Icons ──────────────────────────────────────────────────────────────────

const BoltIcon = ({ size = 14, color = "#4f46e5" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill={color} stroke={color === "white" ? "rgba(255,255,255,0.5)" : "#4338ca"} strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const CheckIcon = ({ color = "#4f46e5" }: { color?: string }) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

const ArrowRight = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const StarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const TrendingIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

// ── Types & Data ─────────────────────────────────────────────────────────

type Category = "all" | "money" | "habits" | "mindset" | "productivity";
type ContentType = "all" | "planner" | "checklist" | "ebook" | "guide";
type SortBy = "trending" | "newest" | "top-rated";
type Access = "free" | "paid";

interface Item {
  id: string;
  title: string;
  type: "planner" | "checklist" | "ebook" | "guide";
  category: Exclude<Category, "all">;
  price: number;
  access: Access;
  rating: number;
  reviews: number;
  trending: number;
  isNew: boolean;
  description: string;
  includes: string[];
  pages?: number;
  duration?: string;
}

const CATEGORIES: { id: Category; label: string; count: number; color: string }[] = [
  { id: "all",          label: "All",            count: 237, color: "#4f46e5" },
  { id: "money",        label: "Money",          count: 48,  color: "#059669" },
  { id: "habits",       label: "Habits & Goals", count: 52,  color: "#f97316" },
  { id: "mindset",      label: "Mindset",        count: 41,  color: "#a855f7" },
  { id: "productivity", label: "Productivity",   count: 36,  color: "#0d9488" },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  planner:   { bg: "#eef2ff", text: "#4338ca", accent: "#4f46e5" },
  checklist: { bg: "#fdf4ff", text: "#6d28d9", accent: "#a855f7" },
  ebook:     { bg: "#ecfdf5", text: "#065f46", accent: "#059669" },
  guide:     { bg: "#fff7ed", text: "#9a3412", accent: "#f97316" },
};

const ITEMS: Item[] = [
  {
    id: "1", title: "90-Day Habit Blueprint", type: "planner", category: "habits",
    price: 12, access: "paid", rating: 4.9, reviews: 842, trending: 97, isNew: false,
    description: "Build any habit in 90 days with daily check-ins, streak tracking, and reflection prompts designed to keep you consistent.",
    includes: ["Daily habit check-in with streak counter", "Weekly reflection prompts", "Visual progress map — 90 dots", "PDF download included"],
    duration: "90 days",
  },
  {
    id: "2", title: "Monthly Budget Reset", type: "planner", category: "money",
    price: 0, access: "free", rating: 4.8, reviews: 1203, trending: 94, isNew: false,
    description: "Track income, expenses, and what's left. Reset every month with a clean slate and real numbers.",
    includes: ["Monthly income & expense tracker", "Auto-calculated remaining balance", "Savings goal progress bar", "PDF download included"],
    duration: "Monthly",
  },
  {
    id: "3", title: "Annual Life Audit", type: "checklist", category: "mindset",
    price: 9, access: "paid", rating: 4.8, reviews: 614, trending: 91, isNew: false,
    description: "A deep-dive annual review across 10 life dimensions. Find what's working, what isn't, and what needs to change.",
    includes: ["10-dimension life review", "Scoring system per area", "Action planning worksheet", "PDF download included"],
    pages: 24,
  },
  {
    id: "4", title: "Deep Work Weekly Planner", type: "planner", category: "productivity",
    price: 12, access: "paid", rating: 4.9, reviews: 723, trending: 94, isNew: false,
    description: "Plan your week around 4-hour deep work blocks with energy mapping and focus scoring.",
    includes: ["Weekly deep work block planner", "Energy level tracker", "Focus score review", "PDF download included"],
    duration: "Weekly",
  },
  {
    id: "5", title: "30-Day Mindset Reset", type: "ebook", category: "mindset",
    price: 0, access: "free", rating: 4.5, reviews: 1203, trending: 88, isNew: false,
    description: "Daily prompts and mini challenges to shift your thinking patterns over 30 days.",
    includes: ["30 daily prompts", "Mini challenge per day", "Weekly reflection", "PDF download included"],
    duration: "30 days",
  },
  {
    id: "6", title: "Savings Goal Tracker", type: "planner", category: "money",
    price: 8, access: "paid", rating: 4.7, reviews: 531, trending: 85, isNew: true,
    description: "Set a savings target, log contributions, and watch your progress bar grow every week.",
    includes: ["Visual savings progress bar", "Weekly contribution log", "Milestone celebrations", "PDF download included"],
    duration: "Ongoing",
  },
  {
    id: "7", title: "Anxiety Reset Journal", type: "ebook", category: "mindset",
    price: 12, access: "paid", rating: 4.9, reviews: 1432, trending: 95, isNew: false,
    description: "Guided exercises for managing anxiety using CBT, ACT, and mindfulness techniques.",
    includes: ["CBT thought record sheets", "ACT values clarification", "Daily grounding exercises", "PDF download included"],
    pages: 48,
  },
  {
    id: "8", title: "Second Brain Setup Guide", type: "guide", category: "productivity",
    price: 15, access: "paid", rating: 4.8, reviews: 491, trending: 82, isNew: true,
    description: "Build a personal knowledge system from scratch — capture, organise, distill, express.",
    includes: ["Step-by-step setup framework", "Tool comparison guide", "Templates for notes & projects", "PDF download included"],
    pages: 36,
  },
  {
    id: "9", title: "30-Day Mood Tracker", type: "checklist", category: "mindset",
    price: 0, access: "free", rating: 4.6, reviews: 3201, trending: 87, isNew: false,
    description: "Daily mood logging with pattern detection and weekly reflection prompts. Free forever.",
    includes: ["Daily mood check-in", "Weekly pattern review", "Emotion vocabulary guide", "PDF download included"],
    duration: "30 days",
  },
  {
    id: "10", title: "Financial Independence Planner", type: "planner", category: "money",
    price: 15, access: "paid", rating: 4.9, reviews: 921, trending: 93, isNew: false,
    description: "Monthly and annual financial planning — budget, savings rate, FI number, and net worth tracker.",
    includes: ["FI number calculator", "Monthly budget tracker", "Net worth dashboard", "PDF download included"],
    duration: "Annual",
  },
  {
    id: "11", title: "Morning Ritual Designer", type: "planner", category: "habits",
    price: 8, access: "paid", rating: 4.7, reviews: 388, trending: 85, isNew: true,
    description: "Design and lock in a morning routine that actually sticks — with habit stacking support.",
    includes: ["Routine design worksheet", "Habit stacking guide", "7-day implementation tracker", "PDF download included"],
    duration: "Ongoing",
  },
  {
    id: "12", title: "Burnout Recovery Roadmap", type: "guide", category: "mindset",
    price: 14, access: "paid", rating: 4.8, reviews: 672, trending: 83, isNew: true,
    description: "A structured 8-week guide to recovering from burnout and rebuilding sustainable energy.",
    includes: ["8-week recovery framework", "Energy audit worksheet", "Boundary-setting guide", "PDF download included"],
    duration: "8 weeks",
  },
];

// ── Signup Prompt ────────────────────────────────────────────────────────

function SignupPrompt({ onClose, onSignup, item }: {
  onClose: () => void;
  onSignup: () => void;
  item: Item;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-5">
          <BoltIcon size={22} color="white" />
        </div>
        <h3 className="text-[22px] font-black text-gray-950 tracking-tight mb-2">
          Create your free account
        </h3>
        <p className="text-[14px] text-gray-400 leading-relaxed mb-6">
          Sign up free to start{" "}
          <span className="font-semibold text-gray-700">{item.title}</span>
          {" "}— plus get access to all free planners instantly.
        </p>
        <button
          onClick={onSignup}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl text-[15px] font-bold transition-all mb-3 active:scale-[0.98]"
        >
          Sign up free <ArrowRight size={14} />
        </button>
        <button
          onClick={onClose}
          className="w-full text-[13px] text-gray-400 hover:text-gray-600 transition-colors py-2"
        >
          Maybe later
        </button>
        <p className="text-[11px] text-gray-400 mt-3">No credit card · Cancel anytime</p>
      </motion.div>
    </motion.div>
  );
}

// ── Preview Modal ────────────────────────────────────────────────────────

function PreviewModal({ item, onClose, onCTA, isLoggedIn }: {
  item: Item;
  onClose: () => void;
  onCTA: () => void;
  isLoggedIn: boolean;
}) {
  const typeStyle = TYPE_COLORS[item.type];
  const isFree = item.access === "free";
  const cat = CATEGORIES.find(c => c.id === item.category)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.28 }}
        className="bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl rounded-t-3xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg capitalize"
              style={{ background: typeStyle.bg, color: typeStyle.text }}
            >
              {item.type}
            </span>
            {item.isNew && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">New</span>
            )}
            {isFree && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">Free</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-6 py-6">

          {/* Category accent bar */}
          <div className="w-full h-1 rounded-full mb-5" style={{ background: `linear-gradient(90deg, ${cat.color}, ${cat.color}40)` }} />

          {/* Title + desc */}
          <h2 className="text-[24px] font-black text-gray-950 tracking-[-0.03em] leading-tight mb-3">
            {item.title}
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed mb-6">
            {item.description}
          </p>

          {/* Streak bar */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <BoltIcon size={15} color="white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900 leading-none mb-0.5">Streak tracking included</p>
              <p className="text-[11px] text-indigo-500">Show up daily. Watch the dots fill.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { val: item.rating.toString(), label: "★ Rating" },
              { val: item.reviews.toLocaleString(), label: "Reviews" },
              { val: item.duration || (item.pages ? `${item.pages} pages` : "Ongoing"), label: "Duration" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-3 text-center">
                <p className="text-[18px] font-black text-gray-950 leading-none mb-1">{s.val}</p>
                <p className="text-[10px] text-gray-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="h-px bg-gray-100 mb-5" />

          {/* What's inside */}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">What's inside</p>
          <div className="space-y-3 mb-5">
            {item.includes.map((inc) => (
              <div key={inc} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: typeStyle.bg }}
                >
                  <CheckIcon color={typeStyle.text} />
                </div>
                <span className="text-[14px] text-gray-700">{inc}</span>
              </div>
            ))}
          </div>

          <div className="h-px bg-gray-100 mb-5" />

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCTA}
              className="flex-1 flex items-center justify-center gap-2 text-white py-4 rounded-2xl text-[15px] font-bold transition-all active:scale-[0.98]"
              style={{ background: isFree ? "#111827" : "#4f46e5" }}
            >
              {isFree
                ? isLoggedIn ? "Start for free" : "Sign up & start free"
                : isLoggedIn ? `Get for $${item.price}` : `Unlock — $${item.price}`
              }
              <ArrowRight size={14} />
            </button>
            {!isFree && (
              <button
                onClick={onClose}
                className="sm:w-auto w-full px-5 py-4 rounded-2xl border border-gray-200 text-gray-600 text-[14px] font-semibold hover:bg-gray-50 transition-colors"
              >
                Maybe later
              </button>
            )}
          </div>

          {!isLoggedIn && (
            <p className="text-center text-[11px] text-gray-400 mt-3">
              Free account · No credit card for free items · Cancel anytime
            </p>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const router = useRouter();
  const isLoggedIn = false;

  const [category, setCategory] = useState<Category>("all");
  const [contentType, setContentType] = useState<ContentType>("all");
  const [sortBy, setSortBy] = useState<SortBy>("trending");
  const [search, setSearch] = useState("");
  const [previewItem, setPreviewItem] = useState<Item | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [pendingItem, setPendingItem] = useState<Item | null>(null);

  const filtered = useMemo(() => {
    let items = [...ITEMS];
    if (category !== "all") items = items.filter(i => i.category === category);
    if (contentType !== "all") items = items.filter(i => i.type === contentType);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => {
      if (sortBy === "trending") return b.trending - a.trending;
      if (sortBy === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      if (sortBy === "top-rated") return b.rating - a.rating;
      return 0;
    });
    return items;
  }, [category, contentType, sortBy, search]);

  const handleCTA = (item: Item) => {
    if (isLoggedIn) {
      router.push(`/planners/${item.id}/use`);
    } else {
      setPendingItem(item);
      setPreviewItem(null);
      setShowSignup(true);
    }
  };

  const handleSignup = () => {
    router.push(pendingItem
      ? `/signup?redirect=/planners/${pendingItem.id}/use`
      : "/signup"
    );
  };

  return (
    <main className="min-h-screen" style={{ background: "#fafaf9" }}>

      {/* ── Header ── */}
      <div
        className="bg-white border-b border-gray-100 px-6 lg:px-8"
        style={{
          paddingTop: "100px",
          paddingBottom: "0",
          backgroundImage: `linear-gradient(#e8e8e6 1px, transparent 1px), linear-gradient(90deg, #e8e8e6 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
        }}
      >
        <div className="mx-auto max-w-6xl">

          {/* Title + search row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full mb-4">
                <BoltIcon size={11} color="#4f46e5" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Library</span>
              </div>
              <h1
                className="font-black text-gray-950 leading-[1.0] mb-2"
                style={{ fontSize: "clamp(26px, 4vw, 40px)", letterSpacing: "-0.04em" }}
              >
                Browse everything.
                <span className="text-indigo-600"> Own what you love.</span>
              </h1>
              <p className="text-[14px] text-gray-400">
                237 interactive planners, guides, checklists & ebooks — free to browse.
              </p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 w-full lg:w-72 shadow-sm shrink-0">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search planners, guides..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-[14px] text-gray-700 placeholder-gray-400 outline-none bg-transparent min-w-0"
              />
            </div>
          </div>

          {/* Signup banner */}
          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl px-5 py-4"
              style={{
                background: "linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)",
                border: "1px solid #bfdbfe",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#2563eb" }}>
                  <BoltIcon size={15} color="white" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-blue-900 leading-none mb-1">
                    3 planners free — no credit card needed.
                  </p>
                  <p className="text-[11px] text-blue-600">
                    Sign up free and start using them right now.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/signup")}
                className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98] shrink-0 whitespace-nowrap"
                style={{ background: "#2563eb" }}
              >
                Sign up free <ArrowRight size={12} />
              </button>
            </motion.div>
          )}

        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="bg-white border-b border-gray-100 px-6 lg:px-8 sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-6xl flex items-center overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className="flex items-center gap-2 px-4 py-4 text-[13px] font-semibold border-b-2 whitespace-nowrap transition-all shrink-0"
                style={{
                  borderBottomColor: isActive ? cat.color : "transparent",
                  color: isActive ? cat.color : "#9ca3af",
                }}
              >
                {cat.label}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    background: isActive ? cat.color + "18" : "#f3f4f6",
                    color: isActive ? cat.color : "#9ca3af",
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-6xl px-6 lg:px-8 py-8">

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

          {/* Type pills — wrap on mobile */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "planner", "ebook", "checklist", "guide"] as ContentType[]).map((t) => (
              <button
                key={t}
                onClick={() => setContentType(t)}
                className="px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all whitespace-nowrap"
                style={
                  contentType === t
                    ? { background: "#111827", color: "#fff", borderColor: "#111827" }
                    : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }
                }
              >
                {t === "all" ? "All types" : t.charAt(0).toUpperCase() + t.slice(1) + "s"}
              </button>
            ))}
          </div>

          {/* Sort — stays on one line */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shrink-0 self-start sm:self-auto">
            {(["trending", "newest", "top-rated"] as SortBy[]).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap"
                style={
                  sortBy === s
                    ? { background: "#111827", color: "#fff" }
                    : { color: "#9ca3af" }
                }
              >
                {s === "top-rated" ? "Top rated" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-[12px] text-gray-400 mb-6 font-medium">
          {filtered.length} {filtered.length === 1 ? "result" : "results"}
          {category !== "all" && ` in ${CATEGORIES.find(c => c.id === category)?.label}`}
          {search && ` for "${search}"`}
        </p>

        {/* ── Grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${category}-${contentType}-${sortBy}-${search}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((item, i) => {
              const typeStyle = TYPE_COLORS[item.type];
              const cat = CATEGORIES.find(c => c.id === item.category)!;
              const isFree = item.access === "free";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  onClick={() => setPreviewItem(item)}
                  className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  {/* Top color bar */}
                  <div className="h-1 w-full shrink-0" style={{ background: cat.color }} />

                  <div className="p-5 flex flex-col flex-1">

                    {/* Badges + trending */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg capitalize"
                          style={{ background: typeStyle.bg, color: typeStyle.text }}
                        >
                          {item.type}
                        </span>
                        {item.isNew && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">New</span>
                        )}
                        {isFree && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">Free</span>
                        )}
                      </div>
                      {item.trending >= 90 && (
                        <div className="flex items-center gap-1 text-orange-500 shrink-0">
                          <TrendingIcon />
                          <span className="text-[10px] font-bold">{item.trending}</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-[15px] font-bold text-gray-900 leading-tight mb-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[12px] text-gray-400 leading-relaxed mb-4 flex-1">
                      {item.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <span key={s} style={{ opacity: s <= Math.round(item.rating) ? 1 : 0.2 }}>
                            <StarIcon />
                          </span>
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-gray-600">{item.rating}</span>
                      <span className="text-[11px] text-gray-400">({item.reviews.toLocaleString()})</span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 gap-3">
                      <div className="shrink-0">
                        {isFree
                          ? <span className="text-[15px] font-black text-emerald-600">Free</span>
                          : <span className="text-[15px] font-black text-gray-900">${item.price}</span>
                        }
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all shrink-0"
                        style={
                          isFree
                            ? { background: "#111827", color: "#fff" }
                            : { background: typeStyle.bg, color: typeStyle.text }
                        }
                      >
                        Preview <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-[40px] mb-4">🔍</p>
            <p className="text-[18px] font-bold text-gray-900 mb-2">Nothing found</p>
            <p className="text-[14px] text-gray-400">Try a different search or category</p>
          </div>
        )}

        {/* ── Signup CTA — logged out only ── */}
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12 relative rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 50%, #fce7f3 100%)",
              border: "1px solid rgba(99,102,241,0.15)",
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, #4f46e5 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative px-8 py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">Free account</p>
                <p
                  className="font-black text-gray-950 tracking-tight leading-tight mb-2"
                  style={{ fontSize: "clamp(20px, 3vw, 26px)" }}
                >
                  3 planners free. Forever.
                  <span className="block text-indigo-600">Sign up and start today.</span>
                </p>
                <p className="text-[14px] text-gray-500">No credit card. No trial. Just pick a planner and go.</p>
              </div>
              <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0">
                <button
                  onClick={() => router.push("/signup")}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-[15px] font-bold transition-all active:scale-[0.98]"
                >
                  Create free account <ArrowRight size={14} />
                </button>
                <Link
                  href="/pricing"
                  className="text-center text-[13px] text-indigo-600 font-semibold hover:underline"
                >
                  Or see all plans →
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Membership banner ── */}
        <div className="mt-4 rounded-3xl bg-gray-950 px-6 lg:px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Membership</p>
            <p
              className="font-black text-white leading-tight tracking-tight mb-1"
              style={{ fontSize: "clamp(17px, 2.5vw, 22px)" }}
            >
              Unlock all 237 items for $7/mo
            </p>
            <p className="text-[13px] text-gray-400">Or $49/yr — saves 42%. Cancel anytime.</p>
          </div>
          <Link
            href="/pricing"
            className="flex items-center gap-2 bg-white text-gray-950 font-bold text-[14px] px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-colors shrink-0 whitespace-nowrap"
          >
            See membership <ArrowRight size={13} />
          </Link>
        </div>

      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {previewItem && (
          <PreviewModal
            item={previewItem}
            onClose={() => setPreviewItem(null)}
            onCTA={() => handleCTA(previewItem)}
            isLoggedIn={isLoggedIn}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSignup && pendingItem && (
          <SignupPrompt
            item={pendingItem}
            onClose={() => { setShowSignup(false); setPendingItem(null); }}
            onSignup={handleSignup}
          />
        )}
      </AnimatePresence>

    </main>
  );
}