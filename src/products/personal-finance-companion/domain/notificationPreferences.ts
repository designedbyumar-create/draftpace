"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import {
  validateNotificationPreferences,
  defaultNotificationPreferences,
  type PersonalFinanceCompanionNotificationPreferences,
} from "../notificationPreferences";

/**
 * CRUD for pfc_notification_preferences — a single settings row per
 * product instance, not a list. Simpler than the seven record
 * repositories (no lifecycle/archive concept, one row always), and
 * simpler than setup-state (no optimistic-concurrency revision, since
 * this is a deliberate settings-form save, not a high-frequency autosave
 * racing across tabs).
 */

interface NotificationPreferencesRow {
  categories: unknown;
  privacy_level: string;
  review_rhythm: string;
}

function fromRow(row: NotificationPreferencesRow): PersonalFinanceCompanionNotificationPreferences {
  return validateNotificationPreferences({
    categories: row.categories,
    privacyLevel: row.privacy_level,
    reviewRhythm: row.review_rhythm,
  });
}

export async function loadNotificationPreferences(
  productInstanceId: string
): Promise<Result<PersonalFinanceCompanionNotificationPreferences>> {
  const { data, error } = await supabase
    .from("pfc_notification_preferences")
    .select("categories, privacy_level, review_rhythm")
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
  preferences: PersonalFinanceCompanionNotificationPreferences
): Promise<Result<PersonalFinanceCompanionNotificationPreferences>> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) return err({ kind: "network", message: userError.message });
  if (!user) return err({ kind: "not-authenticated" });

  const { data, error } = await supabase
    .from("pfc_notification_preferences")
    .upsert(
      {
        product_instance_id: productInstanceId,
        user_id: user.id,
        categories: preferences.categories,
        privacy_level: preferences.privacyLevel,
        review_rhythm: preferences.reviewRhythm,
      },
      { onConflict: "product_instance_id" }
    )
    .select("categories, privacy_level, review_rhythm")
    .single();

  if (error) return err({ kind: "network", message: error.message });
  return ok(fromRow(data));
}
