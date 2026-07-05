"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, Check, Moon, Sparkles, Sun } from "@/components/ui/Icon";
import { supabase } from "@/lib/supabase";
import { planners } from "@/lib/planners";
import { ThemeMode, useTheme } from "@/components/providers/ThemeProvider";

const focusAreas = ["Money", "Habits", "Focus", "Productivity", "Health", "Learning"];
const goals = [
  "Build consistency",
  "Finish a System",
  "Track money",
  "Create a routine",
  "Reduce overwhelm",
  "Plan deep work",
];
const reminderTimes = ["7:30 AM", "9:00 AM", "12:30 PM", "6:00 PM", "8:30 PM"];

export default function OnboardingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const defaultStarterId =
    planners.find((planner) => planner.status === "active" && (planner.access === "free" || planner.prototypeUnlocked))?.id || "";
  const [step, setStep] = useState(0);
  const [name, setName] = useState("there");
  const [focus, setFocus] = useState<string[]>(["Money"]);
  const [goal, setGoal] = useState("Track money");
  const [starterPlanner, setStarterPlanner] = useState(defaultStarterId);
  const [reminderTime, setReminderTime] = useState("9:00 AM");
  const [notifications, setNotifications] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/signup");
        return;
      }
      setName(session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "there");
    });

    if (!("Notification" in window)) setNotifications("unsupported");
    else setNotifications(Notification.permission);
  }, [router]);

  const starterOptions = useMemo(
    () => planners.filter((planner) => planner.status === "active" && (planner.access === "free" || planner.prototypeUnlocked)),
    []
  );
  const previewCount = planners.filter((planner) => planner.status === "coming_soon").length;

  const toggleFocus = (area: string) => {
    setFocus((current) =>
      current.includes(area)
        ? current.filter((item) => item !== area)
        : [...current, area]
    );
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      setNotifications("unsupported");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifications(permission);
  };

  const finish = async () => {
    const payload = {
      focus,
      goal,
      starterPlanner,
      reminderTime,
      onboardingComplete: true,
      completedAt: new Date().toISOString(),
    };

    window.localStorage.setItem("draftpace-profile", JSON.stringify(payload));

    await supabase.auth.updateUser({
      data: {
        onboarding_complete: true,
        focus_categories: focus,
        primary_goal: goal,
        reminder_time: reminderTime,
        theme,
      },
    });

    router.replace(starterPlanner ? `/dashboard/planner/${starterPlanner}` : "/dashboard");
  };

  const skip = () => {
    const payload = {
      focus,
      goal,
      starterPlanner,
      reminderTime,
      onboardingComplete: true,
      completedAt: new Date().toISOString(),
    };
    window.localStorage.setItem("draftpace-profile", JSON.stringify(payload));
    router.replace("/dashboard");
  };

  const steps = [
    {
      eyebrow: "Welcome",
      title: `Let's tune Draftpace to you, ${name}.`,
      body: "A premium System app should feel like it knows the job you hired it for. This takes under a minute.",
      content: (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <p className="text-sm font-bold text-[var(--text)]">Your app will start with:</p>
          <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
            {["A personal Today screen", "One recommended starter System", "Reminder rhythm", "Light, Calm, or Calm Dark mode"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check size={15} className="text-[var(--green)]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      eyebrow: "Focus",
      title: "What are you trying to improve?",
      body: "Pick the areas you want Draftpace to prioritize.",
      content: (
        <div className="grid grid-cols-2 gap-2">
          {focusAreas.map((area) => {
            const active = focus.includes(area);
            return (
              <button
                key={area}
                type="button"
                onClick={() => toggleFocus(area)}
                className={`rounded-2xl border px-4 py-4 text-left text-sm font-bold transition ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                }`}
              >
                {area}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      eyebrow: "Goal",
      title: "What should the app help with first?",
      body: "This drives your Today screen and recommendations.",
      content: (
        <div className="grid gap-2">
          {goals.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setGoal(item)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-bold ${
                goal === item
                  ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
              }`}
            >
              {item}
              {goal === item && <Check size={16} />}
            </button>
          ))}
        </div>
      ),
    },
    {
      eyebrow: "Starter",
      title: "Pick your first Draftpace System.",
      body:
        starterOptions.length > 0
          ? "You can change this later. The point is to get one small win immediately."
          : "The first interactive Systems are staged as previews, so your dashboard will open without a fake starter loop.",
      content: (
        <div className="grid gap-3">
          {starterOptions.length > 0 ? (
            starterOptions.map((planner) => (
              <button
                key={planner.id}
                type="button"
                onClick={() => setStarterPlanner(planner.id)}
                className={`rounded-3xl border p-4 text-left transition ${
                  starterPlanner === planner.id
                    ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[var(--text)]">{planner.title}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{planner.description}</p>
                  </div>
                  <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-bold text-[var(--muted)]">
                    {planner.access === "paid" ? "Paid" : "Free"}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <p className="text-sm font-black text-[var(--text)]">System previews are ready.</p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                {previewCount} coming-soon Systems are available to preview. Progress tracking will open when a System is marked active.
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      eyebrow: "Rhythm",
      title: "When should Draftpace nudge you?",
      body: "Notifications stay optional. We will not ask for permission until you choose it.",
      content: (
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            {reminderTimes.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setReminderTime(time)}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                  reminderTime === time
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={requestNotifications}
            className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text)]"
          >
            <Bell size={16} />
            {notifications === "granted"
              ? "Notifications enabled"
              : notifications === "denied"
                ? "Notifications blocked in browser"
                : notifications === "unsupported"
                  ? "Notifications unsupported"
                  : "Enable reminders on this device"}
          </button>
        </div>
      ),
    },
    {
      eyebrow: "Theme",
      title: "Choose the app mood.",
      body: "Light for clarity, Calm for softness, Calm Dark for late-night planning.",
      content: (
        <div className="grid gap-2">
          {([
            { value: "light", label: "Light", desc: "White background, crisp System workspace.", Icon: Sun },
            { value: "calm", label: "Calm", desc: "Cool pastel surfaces and softer contrast.", Icon: Sparkles },
            { value: "calm-dark", label: "Calm Dark", desc: "Dark, quiet, and low-glare.", Icon: Moon },
          ] as { value: ThemeMode; label: string; desc: string; Icon: typeof Sun }[]).map(({ value, label, desc, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={`flex items-center gap-3 rounded-3xl border p-4 text-left ${
                theme === value
                  ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-[var(--primary)]">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-[var(--text)]">{label}</p>
                <p className="text-xs leading-5 text-[var(--muted)]">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      ),
    },
  ];

  const current = steps[step];
  const last = step === steps.length - 1;

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-[var(--text)]">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-md flex-col">
        <div className="flex items-center justify-between">
          <Image src="/logo/dp-monogram-indigo.svg" alt="Draftpace" width={42} height={42} priority />
          <button onClick={skip} className="text-xs font-bold text-[var(--muted)]">
            Skip
          </button>
        </div>

        <div className="mt-8 flex items-center gap-1.5">
          {steps.map((_, index) => (
            <div
              key={index}
              className="h-1.5 flex-1 rounded-full"
              style={{ background: index <= step ? "var(--primary)" : "var(--surface-strong)" }}
            />
          ))}
        </div>

        <section className="mt-6 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--primary)]">{current.eyebrow}</p>
          <h1 className="mt-3 text-[28px] font-black leading-tight tracking-tight">{current.title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{current.body}</p>
          <div className="mt-6">{current.content}</div>
        </section>

        <div className="mt-auto grid grid-cols-[auto_1fr] gap-3 pt-6">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-bold text-[var(--muted)] disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => (last ? finish() : setStep((currentStep) => currentStep + 1))}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-black text-[var(--primary-contrast)]"
          >
            {last ? (starterPlanner ? "Open my System" : "Open dashboard") : "Continue"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </main>
  );
}
