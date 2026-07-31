"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Envelope, Sparkles } from "@/design-system/Icon";

type FormState = "idle" | "loading" | "success" | "error";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Could not join the list.");
      }

      setFormState("success");
      setMessage("You're on the launch list. Your free planner will be sent when Draftpace opens.");
      setEmail("");
    } catch (error) {
      setFormState("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <main className="min-h-svh overflow-hidden bg-[#f7f4ee] text-slate-950">
      <section className="relative flex min-h-svh items-center px-5 py-8 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(55,48,163,0.16),transparent_28%),radial-gradient(circle_at_84%_26%,rgba(13,148,136,0.16),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(247,244,238,0.65))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:42px_42px]" />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="max-w-2xl">
            <Image
              src="/logo/draftpace-brand-logo.svg"
              alt="Draftpace"
              width={190}
              height={58}
              priority
              className="mb-10 h-auto w-[170px] sm:w-[190px]"
            />

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.18em] text-indigo-700 shadow-sm">
              <Sparkles size={14} filled />
              Launching soon
            </div>

            <h1 className="max-w-[760px] font-serif text-[48px] font-extrabold leading-[0.95] tracking-normal text-slate-950 sm:text-[72px] lg:text-[86px]">
              Your planner is getting a better home.
            </h1>

            <p className="mt-6 max-w-xl text-[17px] leading-8 text-slate-600 sm:text-[19px]">
              Draftpace is almost ready. Join the launch list and we will send you a free planner when the first release opens.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 max-w-xl">
              <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:flex-row">
                <label className="flex min-h-[58px] flex-1 items-center gap-3 rounded-[22px] bg-slate-50 px-4 text-slate-500">
                  <Envelope size={20} />
                  <input
                    aria-label="Email address"
                    className="w-full bg-transparent text-[15px] font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                    disabled={formState === "loading" || formState === "success"}
                    inputMode="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </label>
                <button
                  className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-[22px] bg-indigo-700 px-6 text-[14px] font-extrabold text-white shadow-[0_18px_36px_rgba(55,48,163,0.28)] transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={formState === "loading" || formState === "success"}
                  type="submit"
                >
                  {formState === "loading" ? "Joining..." : "Get the free planner"}
                  <ArrowRight size={16} />
                </button>
              </div>

              {message && (
                <p className={`mt-4 text-[14px] font-semibold ${formState === "error" ? "text-red-600" : "text-emerald-700"}`}>
                  {message}
                </p>
              )}
            </form>

            <div className="mt-8 grid max-w-xl gap-3 text-[14px] font-semibold text-slate-600 sm:grid-cols-3">
              {["Free launch planner", "No spam", "First access"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-teal-700" filled />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[610px] lg:block">
            <div className="absolute right-0 top-1/2 h-[560px] w-[430px] -translate-y-1/2 rounded-[38px] border border-white/80 bg-white/70 p-5 shadow-[0_34px_90px_rgba(15,23,42,0.16)] backdrop-blur">
              <div className="h-full rounded-[28px] border border-slate-200 bg-[#fbfaf7] p-6">
                <div className="mb-7 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-slate-400">Launch gift</p>
                    <h2 className="mt-1 font-serif text-[32px] font-bold leading-none text-slate-950">Free Planner</h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                    <Sparkles size={22} filled />
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    ["01", "Set your weekly focus"],
                    ["02", "Break the draft into small sessions"],
                    ["03", "Track momentum without clutter"],
                  ].map(([number, text]) => (
                    <div key={number} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-[13px] font-black text-white">
                        {number}
                      </div>
                      <p className="text-[15px] font-bold text-slate-700">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-[28px] bg-slate-950 p-5 text-white">
                  <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal-200">Opening soon</p>
                  <p className="mt-3 text-[24px] font-black leading-tight">
                    Be first in line when Draftpace goes live.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
