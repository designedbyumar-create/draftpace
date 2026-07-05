"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "@/components/ui/Icon";
import AppShell from "@/components/app/AppShell";
import ComingSoonSystemEntry from "@/components/system-runtime/ComingSoonSystemEntry";
import SystemRuntime from "@/components/system-runtime/SystemRuntime";
import { getSystem } from "@/lib/systems";

export default function PlannerPage() {
  const params = useParams<{ id: string }>();
  const system = getSystem(params.id);

  if (!system) {
    return (
      <AppShell title="System not found" subtitle="This Draftpace System may have moved or is not published yet.">
        <Link href="/dashboard/explore" className="text-sm font-bold text-[var(--primary)]">
          Browse Systems
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={system.name}
      subtitle={
        system.status === "coming_soon"
          ? `Coming soon · ${system.paths.length} paths previewed`
          : `${system.duration} · ${system.estimatedMinutes} min loop`
      }
      action={
        <Link
          href="/dashboard/drafts"
          className="hidden items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--muted)] sm:flex"
        >
          <ArrowLeft size={14} />
          Systems
        </Link>
      }
    >
      {system.status === "coming_soon" && <ComingSoonSystemEntry blueprint={system} />}
      {system.status === "active" && <SystemRuntime blueprint={system} />}
      {system.status !== "coming_soon" && system.status !== "active" && (
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-bold text-[var(--muted)]">
            This System is not available in the app yet.
          </p>
        </section>
      )}
    </AppShell>
  );
}
