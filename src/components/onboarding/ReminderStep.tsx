"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "@/design-system/Icon";
import { EASE_OUT, useCombinedReducedMotion } from "./motion";

const REMINDER_TIMES = ["7:30 AM", "9:00 AM", "12:30 PM", "6:00 PM", "8:30 PM"];

const NOTIFICATION_LABELS: Record<NotificationPermission | "unsupported", string> = {
  granted: "Reminders on",
  denied: "Blocked in your browser settings",
  default: "Turn on reminders",
  unsupported: "Not supported on this device",
};

export default function ReminderStep({
  reminderTime,
  onSelectTime,
  notifications,
  onRequestNotifications,
}: {
  reminderTime: string | null;
  onSelectTime: (time: string) => void;
  notifications: NotificationPermission | "unsupported";
  onRequestNotifications: () => void;
}) {
  const reduceMotion = useCombinedReducedMotion();

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Optional</p>
      <h1 className="mt-3 font-serif text-[26px] font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-[28px]">
        Want a nudge to come back?
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-[var(--muted)]">
        Notifications stay off until you turn them on here. Skip this if you&apos;d rather not.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2">
        {REMINDER_TIMES.map((time) => {
          const active = reminderTime === time;
          return (
            <button
              key={time}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectTime(time)}
              className={`rounded-lg border px-4 py-3 text-[13px] font-semibold transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                active
                  ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--border-strong)]"
              }`}
            >
              {time}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onRequestNotifications}
        disabled={notifications === "granted" || notifications === "unsupported"}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[13px] font-semibold text-[var(--text)] transition-colors duration-[var(--dur-fast)] disabled:opacity-60"
      >
        <Bell size={15} aria-hidden />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={notifications}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
          >
            {NOTIFICATION_LABELS[notifications]}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
