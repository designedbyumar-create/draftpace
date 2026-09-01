"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import {
  validateNotificationPreferences,
  defaultNotificationPreferences,
  type HomeManagementCompanionNotificationPreferences,
} from "../notificationPreferences";

/**
 * CRUD for hmc_notification_preferences - a single settings row per
 * product instance, not a list. Mirrors PFC's identical domain file.
 */

interface NotificationPreferencesRow {
  categories: unknown;
  privacy_level: string;
  timezone: string;
}

function fromRow(row: NotificationPreferencesRow): HomeManagementCompanionNotificationPreferences {
  return validateNotificationPreferences({
    categories: row.categories,
    privacyLevel: row.privacy_level,
    timezone: row.timezone,
  });
}

export async function loadNotificationPreferences(
  productInstanceId: string
): Promise<Result<HomeManagementCompanionNotificationPreferences>> {
  const { data, error } = await supabase
    .from("hmc_notification_preferences")
    .select("categories, privacy_level, timezone")
    .eq("product_instance_id", productInstanceId)
    .maybeSingle();

  if (error) return err({ kind: "network", message: error.message });
  if (!data) return ok(defaultNotificationPreferences());

  try {
    return ok(fromRow(data));
  } catch {
    return err({ kind: "validation", message: "Saved notification preferences failed validation." });
  }
}

export async function saveNotificationPreferences(
  productInstanceId: string,
  preferences: HomeManagementCompanionNotificationPreferences
): Promise<Result<HomeManagementCompanionNotificationPreferences>> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) return err({ kind: "network", message: sessionError.message });
  if (!session) return err({ kind: "not-authenticated" });

  const { data, error } = await supabase
    .from("hmc_notification_preferences")
    .upsert(
      {
        product_instance_id: productInstanceId,
        user_id: session.user.id,
        categories: preferences.categories,
        privacy_level: preferences.privacyLevel,
        timezone: preferences.timezone,
      },
      { onConflict: "product_instance_id" }
    )
    .select("categories, privacy_level, timezone")
    .single();

  if (error) return err({ kind: "network", message: error.message });
  return ok(fromRow(data));
}
