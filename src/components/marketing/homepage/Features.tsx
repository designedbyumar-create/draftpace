"use client";

import { motion } from "framer-motion";
import { ArrowRight, Article, Bell, BookOpen, CheckSquare, Library, Lightning, Smartphone, TrendingUp } from "@/components/ui/Icon";
import { marketingButtonClassName } from "@/components/marketing/ui";

const BoltIcon = ({ size = 16 }: { size?: number }) => (
  <Lightning size={size} color="#3730A3" filled />
);

const liveItems = [
  {
    icon: <Article size={18} color="#4f46e5" />,
    iconBg: "#eef2ff", name: "Budget Reset Planner", tag: "Planner",
    tagBg: "#eef2ff", tagColor: "#4f46e5", progress: 68, color: "#4f46e5", meta: "Day 14",
  },
  {
    icon: <BookOpen size={18} color="#059669" />,
    iconBg: "#ecfdf5", name: "Atomic Habits Guide", tag: "eBook",
    tagBg: "#ecfdf5", tagColor: "#059669", progress: 52, color: "#059669", meta: "Ch. 8 of 15",
  },
  {
    icon: <CheckSquare size={18} color="#a855f7" />,
    iconBg: "#fdf4ff", name: "2026 Life Audit Checklist", tag: "Checklist",
    tagBg: "#fdf4ff", tagColor: "#a855f7", progress: 83, color: "#a855f7", meta: "20 of 24 done",
  },
];

const supporting = [
  {
    icon: <Lightning size={18} color="#f97316" filled />,
    bg: "bg-orange-50", border: "border-orange-100",
    title: "Streak system that sticks",
    desc: "Show up daily, watch the dots fill. Miss a day? No shame — just pick up where you left off.",
  },
  {
    icon: <TrendingUp size={18} color="#7c3aed" />,
    bg: "bg-violet-50", border: "border-violet-100",
    title: "Progress you can actually see",
    desc: "Every item moves from 0% to done. Watch your library transform from untouched to finished.",
  },
  {
    icon: <Bell size={18} color="#d97706" />,
    bg: "bg-amber-50", border: "border-amber-100",
    title: "Reminders that feel human",
    desc: "Gentle nudges that bring you back without guilt. It chases you — not the other way around.",
  },
  {
    icon: <Smartphone size={18} color="#0d9488" />,
    bg: "bg-teal-50", border: "border-teal-100",
    title: "Works on every device",
    desc: "Phone, tablet, desktop — your progress is always synced, always waiting where you left off.",
  },
];

const stats = [
  { val: "12,400+", label: "Active streaks" },
  { val: "3,200+", label: "Items completed" },
  { val: "83%", label: "Avg completion rate" },
  { val: "200+", label: "Items in library" },
];

const streakDots = [1,1,1,1,1,0.4,0];

export default function Features() {
  return (
    <section className="bg-[#fafaf9] px-6 lg:px-8 py-24 lg:py-32 border-b border-gray-100">
      <div className="mx-auto max-w-6xl flex flex-col gap-4">

        {/* ── TOP SPOTLIGHT BLOCK ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 50%, #fce7f3 100%)",
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10 grid lg:grid-cols-2 gap-0">

            {/* Left — copy */}
            <div className="px-10 py-12 lg:py-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/40">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/60 border border-white/80 px-4 py-2 rounded-full mb-8">
                  <Library size={13} className="text-indigo-600" />
                  <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-widest">
                    The core experience
                  </span>
                </div>

                <h2
                  className="font-black tracking-[-0.04em] text-gray-950 mb-5"
                  style={{ fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: "1.05" }}
                >
                  Why is Draftpace better
                  <span className="block text-indigo-600">than just having the PDF?</span>
                </h2>

                <p className="text-[15px] text-gray-600 leading-[1.7] mb-10 max-w-md">
                  Because a PDF doesn't know where you stopped. It doesn't celebrate when you finish. It doesn't remind you to come back. It just sits there. Draftpace doesn't.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="bg-white/60 border border-white/80 rounded-2xl px-5 py-4">
                    <p className="text-[26px] font-black text-gray-950 leading-none mb-1 tracking-[-0.03em]">{s.val}</p>
                    <p className="text-[11px] text-gray-500 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — live items */}
            <div className="px-8 py-10 lg:py-12 flex flex-col justify-center gap-3">
              <p className="text-[10px] font-bold text-indigo-700/60 uppercase tracking-widest mb-2">
                Live inside your library right now
              </p>

              {liveItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-white/70 border border-white/90 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: item.iconBg }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[13px] font-bold text-gray-900 truncate max-w-[160px]">{item.name}</span>
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full ml-2 shrink-0"
                        style={{ background: item.tagBg, color: item.tagColor }}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/80 rounded-full mb-1.5">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.progress}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-bold" style={{ color: item.color }}>{item.progress}% complete</span>
                      <span className="text-[10px] text-gray-400">{item.meta}</span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Streak bar — matching Hero exactly */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white/70 border border-white/90 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                  <BoltIcon size={16} />
                </div>
                <div>
                  <p className="text-[14px] font-black text-gray-900 leading-none mb-0.5">14 days</p>
                  <p className="text-[10px] text-indigo-500 font-semibold">current streak</p>
                </div>
                <div className="flex gap-1.5 ml-auto">
                  {streakDots.map((opacity, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-sm"
                      style={{
                        background: opacity === 1 ? "#4f46e5" : opacity === 0.4 ? "#c7d2fe" : "#e8e8e8",
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={marketingButtonClassName({
                  size: "lg",
                  fullWidth: true,
                  className: "mt-1 rounded-2xl font-bold",
                })}
              >
                See your library <ArrowRight size={15} />
              </motion.button>
            </div>

          </div>
        </motion.div>

        {/* ── BOTTOM 4 SUPPORTING CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {supporting.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true }}
              className={`bg-white border ${f.border} rounded-3xl p-6 hover:shadow-sm hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
            >
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                {f.icon}
              </div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-2.5 leading-snug">
                {f.title}
              </h3>
              <p className="text-[13px] text-gray-400 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
