"use client";

import EmptyState from "@/design-system/EmptyState";
import { Settings } from "@/design-system/Icon";

/**
 * Settings.
 *
 * Nothing to set yet, and this says so rather than showing controls that
 * do nothing. Reminders are the obvious future occupant of this screen,
 * and they stay off until there is a delivery route worth switching on:
 * an unbuilt toggle that claims to send reminders is exactly the kind of
 * broken promise this audience has been let down by before.
 */
export default function SettingsModule() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Settings</p>
      </header>
      <EmptyState
        icon={Settings}
        title="Nothing to set yet"
        description="When there is something worth choosing here, it will appear. Nothing is switched on behind the scenes."
      />
    </div>
  );
}
