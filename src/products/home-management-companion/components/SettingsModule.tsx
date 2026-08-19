"use client";

import { useCallback, useEffect, useState } from "react";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Select from "@/design-system/Select";
import Toggle from "@/design-system/Toggle";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import { Settings } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { loadNotificationPreferences, saveNotificationPreferences } from "../domain/notificationPreferences";
import {
  notificationCategorySchema,
  NOTIFICATION_CATEGORY_LABEL,
  notificationPrivacyLevelSchema,
  NOTIFICATION_PRIVACY_LEVEL_LABEL,
  type HomeManagementCompanionNotificationPreferences,
  type NotificationCategory,
} from "../notificationPreferences";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * Home Base's settings: notification category preferences/privacy level
 * and time zone, same shape as PFC's own SettingsModule minus the
 * finance-specific review-rhythm control (no equivalent concept here).
 * Nothing here sends a real notification yet - see notifications.supported
 * on the product definition, flipped once a real evaluator exists.
 */
export default function SettingsModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<HomeManagementCompanionNotificationPreferences | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);
  const [supportedTimeZones, setSupportedTimeZones] = useState<string[]>([]);

  useEffect(() => {
    try {
      setDetectedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setDetectedTimezone(null);
    }
    const supportedValuesOf = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
    if (supportedValuesOf) {
      try {
        setSupportedTimeZones(supportedValuesOf("timeZone"));
      } catch {
        setSupportedTimeZones([]);
      }
    }
  }, []);

  const load = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    const found = await findHomeManagementCompanionInstanceId();
    if (found.status === "error") {
      setErrorMessage(found.message);
      setStatus("error");
      return;
    }
    if (found.status === "not-found") {
      setStatus("no-instance");
      return;
    }
    setInstanceId(found.id);
    const result = await loadNotificationPreferences(found.id);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      setStatus("error");
      return;
    }
    setPreferences(result.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function persist(next: HomeManagementCompanionNotificationPreferences) {
    setPreferences(next);
    if (!instanceId) return;
    setSaveState("saving");
    const result = await saveNotificationPreferences(instanceId, next);
    setSaveState(result.ok ? "saved" : "error");
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading settings…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Settings}
        title="Couldn't load settings"
        description={errorMessage ?? "Something went wrong. Try again."}
        action={
          <Button size="sm" variant="secondary" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }

  if (status === "no-instance" || !preferences) {
    return <EmptyState icon={Settings} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--text)]">Settings</h1>
        <Badge tone={saveState === "saved" ? "success" : saveState === "error" ? "danger" : "neutral"}>
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : saveState === "error" ? "Save failed" : ""}
        </Badge>
      </div>

      <Surface className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)]">Your home</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--muted)]">Add or update appliances and maintenance tasks.</p>
        </div>
        <Button variant="secondary" href="/app/products/home-management-companion/setup">
          Manage your home
        </Button>
      </Surface>

      <Surface>
        <p className="text-[13px] font-semibold text-[var(--text)]">Time zone</p>
        <p className="mt-0.5 text-[12px] text-[var(--muted)]">Used to keep reminders inside a reasonable local time, never sent late at night or before your day starts.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="max-w-xs flex-1">
            {supportedTimeZones.length > 0 ? (
              <Select
                label="Time zone"
                value={preferences.timezone}
                onChange={(e) => persist({ ...preferences, timezone: e.target.value })}
              >
                {supportedTimeZones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </Select>
            ) : (
              <p className="text-[13px] text-[var(--text)]">{preferences.timezone}</p>
            )}
          </div>
          {detectedTimezone && detectedTimezone !== preferences.timezone && (
            <Button size="sm" variant="secondary" onClick={() => persist({ ...preferences, timezone: detectedTimezone })}>
              Use detected: {detectedTimezone}
            </Button>
          )}
        </div>
      </Surface>

      <Surface>
        <p className="text-[13px] font-semibold text-[var(--text)]">Notification preview privacy</p>
        <p className="mt-0.5 text-[12px] text-[var(--muted)]">How much detail appears in a notification preview.</p>
        <div className="mt-3 max-w-xs">
          <Select
            label="Privacy level"
            value={preferences.privacyLevel}
            onChange={(e) => persist({ ...preferences, privacyLevel: e.target.value as typeof preferences.privacyLevel })}
          >
            {notificationPrivacyLevelSchema.options.map((option) => (
              <option key={option} value={option}>
                {NOTIFICATION_PRIVACY_LEVEL_LABEL[option]}
              </option>
            ))}
          </Select>
        </div>
      </Surface>

      <Surface>
        <p className="text-[13px] font-semibold text-[var(--text)]">What Home Base should remember for you</p>
        <p className="mt-0.5 text-[12px] text-[var(--muted)]">
          Nothing is sent unless a category is on here and notifications are enabled.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {notificationCategorySchema.options.map((category: NotificationCategory) => (
            <div key={category} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
              <span className="text-[13px] font-medium text-[var(--text)]">{NOTIFICATION_CATEGORY_LABEL[category]}</span>
              <Toggle
                checked={preferences.categories[category] === true}
                onChange={(checked) => persist({ ...preferences, categories: { ...preferences.categories, [category]: checked } })}
                label={NOTIFICATION_CATEGORY_LABEL[category]}
              />
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
