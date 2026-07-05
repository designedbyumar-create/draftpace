"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, CheckCircle2, Clock, Flame, Sparkles, Target } from "@/components/ui/Icon";
import AppShell, { AppBadge, AppCard, InstallPromptCard } from "@/components/app/AppShell";
import { categoryLabels, planners } from "@/lib/planners";
import { getActiveSystems, getComingSoonSystems } from "@/lib/systems";

type LocalProfile = {
  focus?: string[];
  goal?: string;
  starterPlanner?: string;
  reminderTime?: string;
};

function readProfile(): LocalProfile {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem("draftpace-profile") || "{}");
  } catch {
    return {};
  }
}

function readCheckins() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem("draftpace-checkins") || "{}");
  } catch {
    return {};
  }
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<LocalProfile>({});
  const [checkins, setCheckins] = useState<Record<string, Record<string, boolean>>>({});

  useEffect(() => {
    setProfile(readProfile());
    setCheckins(readCheckins());
  }, []);

  const activeSystems = useMemo(() => getActiveSystems(), []);
  const activeSystemIds = useMemo(() => new Set(activeSystems.map((system) => system.id)), [activeSystems]);
  const comingSoonSystems = useMemo(() => getComingSoonSystems(), []);
  const starter = useMemo(
    () => planners.find((planner) => planner.id === profile.starterPlanner && planner.status === "active") || planners.find((planner) => planner.status === "active"),
    [profile.starterPlanner]
  );
  const today = new Date().toISOString().slice(0, 10);
  const checkedInToday = Boolean(starter && checkins[starter.id]?.[today]);
  const focus = starter
    ? profile.focus?.slice(0, 2).join(" + ") || categoryLabels[starter.category]
    : "System previews";
  const completedCount = Object.entries(checkins).reduce(
    (count, [systemId, plannerDays]) =>
      activeSystemIds.has(systemId) ? count + Object.values(plannerDays).filter(Boolean).length : count,
    0
  );
  const streak = checkedInToday ? Math.max(1, completedCount) : completedCount;
  const hasActiveSystems = activeSystems.length > 0;

  return (
    <AppShell
      title="Today"
      subtitle={
        hasActiveSystems
          ? checkedInToday
            ? "Your streak is safe today."
            : "One small check-in keeps momentum alive."
          : "Your System previews are staged. Active loops are not open yet."
      }
    >
      <div className="space-y-4">
        <InstallPromptCard />

        <AppCard className="overflow-hidden">
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <AppBadge>{focus}</AppBadge>
                <h2 className="mt-4 text-[26px] font-black leading-tight tracking-tight text-[var(--text)]">
                  {hasActiveSystems ? (checkedInToday ? "Momentum logged." : "Your System is waiting.") : "Systems are being prepared."}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {hasActiveSystems && starter
                    ? `Continue ${starter.title}. It should take about ${starter.estimatedMinutes} minutes.`
                    : `${comingSoonSystems.length} Draftpace Systems are available to preview. None are marking progress yet.`}
                </p>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-[var(--primary-soft)] text-[var(--primary)]">
                {hasActiveSystems ? checkedInToday ? <CheckCircle2 size={24} /> : <Target size={24} /> : <Clock size={24} />}
              </div>
            </div>

            <Link
              href={hasActiveSystems && starter ? `/dashboard/planner/${starter.id}` : "/dashboard/drafts"}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-4 text-sm font-black text-[var(--primary-contrast)]"
            >
              {hasActiveSystems ? (checkedInToday ? "Review today" : "Open Daily Page") : "View System Previews"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </AppCard>

        <div className="grid grid-cols-2 gap-3">
          <AppCard className="p-4">
            <div className="flex items-center gap-2 text-[var(--orange)]">
              <Flame size={18} />
              <span className="text-xs font-black uppercase tracking-[0.16em]">Streak</span>
            </div>
            <p className="mt-3 text-3xl font-black text-[var(--text)]">{streak}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{hasActiveSystems ? "check-ins logged" : "no active loops yet"}</p>
          </AppCard>

          <AppCard className="p-4">
            <div className="flex items-center gap-2 text-[var(--teal)]">
              <Sparkles size={18} />
              <span className="text-xs font-black uppercase tracking-[0.16em]">Goal</span>
            </div>
            <p className="mt-3 text-sm font-black leading-tight text-[var(--text)]">{profile.goal || "Build consistency"}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">personalized during onboarding</p>
          </AppCard>
        </div>

        <AppCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-[var(--text)]">Reminder rhythm</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Draftpace will nudge you around {profile.reminderTime || "9:00 AM"} once notifications are enabled.
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Bell size={19} />
            </div>
          </div>
          <Link href="/dashboard/settings" className="mt-4 inline-flex text-sm font-bold text-[var(--primary)]">
            Tune notifications
          </Link>
        </AppCard>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[var(--faint)]">Recommended next</h3>
            <Link href="/dashboard/explore" className="text-xs font-bold text-[var(--primary)]">
              Explore
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {planners
              .filter((planner) => planner.id !== starter?.id)
              .slice(0, 2)
              .map((planner) => (
                <Link
                  key={planner.id}
                  href={`/dashboard/planner/${planner.id}`}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <div className="h-1.5 w-16 rounded-full" style={{ background: planner.accent }} />
                  <p className="mt-4 text-sm font-black text-[var(--text)]">{planner.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                    {planner.status === "coming_soon" ? planner.dashboardCard.statusLine || "Coming soon" : planner.description}
                  </p>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
