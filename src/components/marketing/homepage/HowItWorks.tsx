"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Article, BookOpen, Check, CheckSquare, Lightning } from "@/components/ui/Icon";
import { useRouter } from "next/navigation";
import { marketingButtonClassName } from "@/components/marketing/ui";

const BoltIcon = ({ size = 16 }: { size?: number }) => (
  <Lightning size={size} color="#3730A3" filled />
);

const CheckIcon = () => (
  <Check size={10} color="white" />
);

const tabs = [
  {
    id: "budget",
    label: "Budget Planner",
    icon: <Article size={12} color="#4f46e5" />,
    iconBg: "#eef2ff",
    tag: "Planner",
    tagColor: "#4f46e5",
    tagBg: "#eef2ff",
  },
  {
    id: "audit",
    label: "Life Audit",
    icon: <CheckSquare size={12} color="#a855f7" />,
    iconBg: "#fdf4ff",
    tag: "Checklist",
    tagColor: "#a855f7",
    tagBg: "#fdf4ff",
  },
  {
    id: "habits",
    label: "Habit Tracker",
    icon: <BookOpen size={12} color="#059669" />,
    iconBg: "#ecfdf5",
    tag: "eBook",
    tagColor: "#059669",
    tagBg: "#ecfdf5",
  },
];

const streakDots = [1, 1, 1, 0, 0, 0, 0];

export default function HowItWorks() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("budget");
  const [income, setIncome] = useState("3200");
  const [rent, setRent] = useState("1100");
  const [groceries, setGroceries] = useState("380");
  const [checks, setChecks] = useState([true, true, false]);

  const [auditChecks, setAuditChecks] = useState([true, true, false, true, false, false]);
  const auditItems = [
    "Review last year's wins",
    "Identify 3 areas to improve",
    "Set 90-day priorities",
    "Audit recurring expenses",
    "Define this year's theme",
    "Write a personal mission",
  ];

  const habits = ["Morning pages", "No-spend day", "Read 20 mins"];
  const [habitChecks, setHabitChecks] = useState([[true, true, true, false, false, false, false], [true, false, true, true, false, false, false], [true, true, false, false, false, false, false]]);

  const incomeNum = parseFloat(income.replace(/,/g, "")) || 0;
  const rentNum = parseFloat(rent.replace(/,/g, "")) || 0;
  const groceriesNum = parseFloat(groceries.replace(/,/g, "")) || 0;
  const totalExpenses = rentNum + groceriesNum;
  const remaining = incomeNum - totalExpenses;

  const budgetProgress = Math.min(Math.round(((checks.filter(Boolean).length / checks.length) * 0.4 + (income && rent && groceries ? 0.6 : 0)) * 100), 100);
  const auditProgress = Math.round((auditChecks.filter(Boolean).length / auditChecks.length) * 100);
  const habitProgress = Math.round((habitChecks.flat().filter(Boolean).length / habitChecks.flat().length) * 100);

  const progress = activeTab === "budget" ? budgetProgress : activeTab === "audit" ? auditProgress : habitProgress;

  const toggleCheck = (i: number) => setChecks(prev => prev.map((v, idx) => idx === i ? !v : v));
  const toggleAudit = (i: number) => setAuditChecks(prev => prev.map((v, idx) => idx === i ? !v : v));
  const toggleHabit = (hIdx: number, dIdx: number) => {
    setHabitChecks(prev => prev.map((row, ri) => ri === hIdx ? row.map((v, di) => di === dIdx ? !v : v) : row));
  };

  return (
    <section className="bg-white px-6 lg:px-8 py-24 lg:py-32 border-b border-gray-100">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="mb-6 inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-widest">
              Try it right now — no signup needed
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-black tracking-[-0.04em] text-gray-950 mb-4"
            style={{ fontSize: "clamp(30px, 3.8vw, 46px)", lineHeight: "1.05" }}
          >
            This is what finishing
            <span className="block text-indigo-600">actually feels like.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            viewport={{ once: true }}
            className="text-[16px] text-gray-400 leading-relaxed max-w-lg mx-auto"
          >
            Fill in a real planner. Watch your progress move. This is exactly what you unlock when you buy from us.
          </motion.p>
        </div>

        {/* Demo shell */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm"
        >

          {/* Tabs */}
          <div className="flex items-center border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600 bg-white"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: tab.iconBg }}>
                  {tab.icon}
                </div>
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => router.push("/library")}
              className="ml-auto flex items-center gap-1.5 px-5 py-4 text-[12px] font-semibold text-indigo-500 hover:text-indigo-600 whitespace-nowrap transition-colors"
            >
              200+ more in library <ArrowRight size={13} />
            </button>
          </div>

          {/* Body */}
          <div className="grid lg:grid-cols-2 min-h-[420px]">

            {/* Left — Interactive */}
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
              <AnimatePresence mode="wait">

                {/* Budget tab */}
                {activeTab === "budget" && (
                  <motion.div key="budget" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.25 }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Article size={18} color="#4f46e5" />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-gray-900 leading-none mb-0.5">Monthly Budget Reset</p>
                        <p className="text-[12px] text-gray-400">November 2026 · Fill in your numbers</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      {[
                        { label: "Monthly income", value: income, setter: setIncome },
                        { label: "Rent / mortgage", value: rent, setter: setRent },
                        { label: "Groceries", value: groceries, setter: setGroceries },
                      ].map((field) => (
                        <div key={field.label}>
                          <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">{field.label}</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-gray-400 font-semibold">$</span>
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) => field.setter(e.target.value)}
                              className="w-full pl-7 pr-4 py-3 border border-gray-200 focus:border-indigo-400 focus:outline-none rounded-xl text-[14px] text-gray-900 font-semibold transition-colors"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 mb-3 block">Monthly goals</label>
                      <div className="space-y-2">
                        {["Track all expenses", "Save $500 this month", "Review subscriptions"].map((item, i) => (
                          <button
                            key={item}
                            onClick={() => toggleCheck(i)}
                            className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${checks[i] ? "bg-indigo-600 border-indigo-600" : "border-2 border-gray-300 bg-white"}`}>
                              {checks[i] && <CheckIcon />}
                            </div>
                            <span className={`text-[13px] font-medium transition-all ${checks[i] ? "line-through text-gray-400" : "text-gray-700"}`}>{item}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Audit tab */}
                {activeTab === "audit" && (
                  <motion.div key="audit" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.25 }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                        <CheckSquare size={18} color="#a855f7" />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-gray-900 leading-none mb-0.5">2026 Life Audit</p>
                        <p className="text-[12px] text-gray-400">Annual review · {auditChecks.filter(Boolean).length} of {auditChecks.length} done</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {auditItems.map((item, i) => (
                        <button
                          key={item}
                          onClick={() => toggleAudit(i)}
                          className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${auditChecks[i] ? "bg-purple-600" : "border-2 border-gray-300 bg-white"}`}>
                            {auditChecks[i] && <CheckIcon />}
                          </div>
                          <span className={`text-[13px] font-medium transition-all ${auditChecks[i] ? "line-through text-gray-400" : "text-gray-700"}`}>{item}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Habits tab */}
                {activeTab === "habits" && (
                  <motion.div key="habits" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.25 }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <BookOpen size={18} color="#059669" />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-gray-900 leading-none mb-0.5">Habit Builder</p>
                        <p className="text-[12px] text-gray-400">This week · Tap to check off</p>
                      </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-8 gap-1.5 mb-3">
                      <div className="text-[10px] text-gray-400 font-semibold" />
                      {["M","T","W","T","F","S","S"].map((d, i) => (
                        <div key={i} className="text-[10px] text-gray-400 font-semibold text-center">{d}</div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      {habits.map((habit, hIdx) => (
                        <div key={habit} className="grid grid-cols-8 gap-1.5 items-center">
                          <div className="text-[11px] font-semibold text-gray-600 truncate">{habit}</div>
                          {habitChecks[hIdx].map((checked, dIdx) => (
                            <button
                              key={dIdx}
                              onClick={() => toggleHabit(hIdx, dIdx)}
                              className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                                checked ? "bg-emerald-500" : "bg-gray-100 hover:bg-gray-200"
                              }`}
                            >
                              {checked && (
                                <Check size={8} color="white" />
                              )}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Right — Live results */}
            <div className="p-8 flex flex-col gap-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your progress</p>

              {/* Progress bar */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[13px] font-semibold text-gray-700">Planner completion</p>
                  <p className="text-[15px] font-black text-indigo-600">{progress}%</p>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-indigo-600"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Budget summary */}
              {activeTab === "budget" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3"
                >
                  {[
                    { label: "Monthly income", value: `$${incomeNum.toLocaleString()}`, color: "text-gray-900" },
                    { label: "Total expenses", value: `−$${totalExpenses.toLocaleString()}`, color: "text-red-500" },
                    { label: "Left this month", value: `$${remaining.toLocaleString()}`, color: remaining >= 0 ? "text-emerald-600" : "text-red-500" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-[13px] text-gray-500">{row.label}</span>
                      <span className={`text-[14px] font-bold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Audit summary */}
              {activeTab === "audit" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[13px] text-gray-500">Items completed</span>
                    <span className="text-[14px] font-bold text-purple-600">{auditChecks.filter(Boolean).length} of {auditChecks.length}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {auditChecks.map((checked, i) => (
                      <div key={i} className={`flex-1 h-2 rounded-full transition-all ${checked ? "bg-purple-500" : "bg-gray-200"}`} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Habits summary */}
              {activeTab === "habits" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3"
                >
                  {habits.map((habit, hIdx) => {
                    const done = habitChecks[hIdx].filter(Boolean).length;
                    return (
                      <div key={habit}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[12px] text-gray-500">{habit}</span>
                          <span className="text-[12px] font-bold text-emerald-600">{done}/7</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${(done / 7) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* Streak */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                  <BoltIcon size={15} />
                </div>
                <div>
                  <p className="text-[15px] font-black text-gray-900 leading-none mb-0.5">Day 3</p>
                  <p className="text-[10px] text-indigo-500 font-semibold">streak started</p>
                </div>
                <div className="flex gap-1.5 ml-auto">
                  {streakDots.map((active, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ background: active ? "#4f46e5" : "#e0e7ff" }}
                    />
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => router.push("/signup")}
                  className={marketingButtonClassName({
                    size: "md",
                    className: "flex-1 py-3.5 text-[13px] font-bold",
                  })}
                >
                  Save & continue <ArrowRight size={13} />
                </button>
                <button
                  onClick={() => router.push("/pricing")}
                  className={marketingButtonClassName({
                    variant: "secondary",
                    size: "md",
                    className: "flex-1 py-3.5 text-[13px] font-semibold",
                  })}
                >
                  Unlock full version
                </button>
              </div>

            </div>
          </div>

          {/* Bottom bar */}
          <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[12px] text-gray-400">
              Trying: <span className="font-semibold text-gray-600">{tabs.find(t => t.id === activeTab)?.label}</span> — free preview
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
              <Check size={10} />
              Auto-saved
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
