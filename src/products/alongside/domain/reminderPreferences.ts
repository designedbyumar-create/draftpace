"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import { DEFAULT_REMINDER_PREFERENCES, type ReminderPreferences } from "../reminders";

/**
 * One settings row per product instance. Reads fall back to the defaults,
 * which have reminders off, so a person who never opens Settings is never
 * sent anything. Writes only the columns a person chooses: the send-once
 * ledger lives on the same row and belongs to the server.
 */

interface Row {
  reminders_enabled: boolean;
  show_detail: boolean;
  quiet_start_hour: number;
  quiet_end_hour: number;
  timezone: string;
}

const COLUMNS = "reminders_enabled, show_detail, quiet_start_hour, quiet_end_hour, timezone";

function fromRow(row: Row): ReminderPreferences {
  return {
    remindersEnabled: row.reminders_enabled,
    showDetail: row.show_detail,
    quietStartHour: row.quiet_start_hour,
    quietEndHour: row.quiet_end_hour,
    timezone: row.timezone,
  };
}

export function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export async function loadReminderPreferences(instanceId: string): Promise<Result<ReminderPreferences>> {
  const { data, error } = await supabase
    .from("als_notification_preferences")
    .select(COLUMNS)
    .eq("product_instance_id", instanceId)
    .maybeSingle();
  if (error) return err({ kind: "network", message: error.message });
  if (!data) return ok({ ...DEFAULT_REMINDER_PREFERENCES, timezone: deviceTimezone() });
  return ok(fromRow(data as Row));
}

export async function saveReminderPreferences(
  instanceId: string,
  preferences: ReminderPreferences,
): Promise<Result<ReminderPreferences>> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) return err({ kind: "network", message: sessionError.message });
  if (!session) return err({ kind: "not-authenticated" });

  const { data, error } = await supabase
    .from("als_notification_preferences")
    .upsert(
      {
        product_instance_id: instanceId,
        user_id: session.user.id,
        reminders_enabled: preferences.remindersEnabled,
        show_detail: preferences.showDetail,
        quiet_start_hour: preferences.quietStartHour,
        quiet_end_hour: preferences.quietEndHour,
        timezone: preferences.timezone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "product_instance_id" },
    )
    .select(COLUMNS)
    .single();
  if (error) return err({ kind: "network", message: error.message });
  return ok(fromRow(data as Row));
}
