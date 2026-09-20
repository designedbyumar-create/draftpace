import type { SupabaseClient } from "@supabase/supabase-js";
import { sendWebPush } from "@/lib/notifications/webPush";
import { ITEM_COLUMNS, toItem } from "./domain/alongsideData";
import { planReminder, pruneNotified, type ReminderPreferences } from "./reminders";

export type ReminderDeliveryOutcome = "off" | "none" | "sent" | "no-device" | "failed";

/**
 * Sends the one reminder that is due for this instance, if any.
 *
 * Server side, service role, called by the hourly cron once entitlement has
 * already been checked. Every decision about whether to send is planReminder's;
 * this only reads, claims, sends and records.
 *
 * The claim is written before the push goes out, so two overlapping runs
 * cannot both send, and released again if nothing reached a device so the
 * next hour tries again instead of losing the reminder.
 */
export async function deliverAlongsideReminders(
  supabase: SupabaseClient,
  input: { instanceId: string; userId: string; now: Date },
): Promise<ReminderDeliveryOutcome> {
  const { instanceId, userId, now } = input;

  const { data: row } = await supabase
    .from("als_notification_preferences")
    .select("reminders_enabled, show_detail, quiet_start_hour, quiet_end_hour, timezone, notified")
    .eq("product_instance_id", instanceId)
    .maybeSingle();
  if (!row || !row.reminders_enabled) return "off";

  const prefs: ReminderPreferences = {
    remindersEnabled: true,
    showDetail: Boolean(row.show_detail),
    quietStartHour: row.quiet_start_hour as number,
    quietEndHour: row.quiet_end_hour as number,
    timezone: row.timezone as string,
  };
  const notified = pruneNotified((row.notified ?? {}) as Record<string, string>, now);

  const { data: itemRows } = await supabase
    .from("als_items")
    .select(ITEM_COLUMNS)
    .eq("product_instance_id", instanceId)
    .neq("status", "archived");
  const items = ((itemRows ?? []) as unknown as Record<string, unknown>[]).map(toItem);

  const push = planReminder({ items, prefs, notified, now });
  if (!push) return "none";

  const claimed = { ...notified, ...Object.fromEntries(push.keys.map((key) => [key, now.toISOString()])) };
  await supabase.from("als_notification_preferences").update({ notified: claimed }).eq("product_instance_id", instanceId);
  const release = () =>
    supabase.from("als_notification_preferences").update({ notified }).eq("product_instance_id", instanceId);

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key")
    .eq("user_id", userId)
    .is("revoked_at", null);
  if (!subs || subs.length === 0) {
    await release();
    return "no-device";
  }

  let anySent = false;
  for (const sub of subs) {
    const outcome = await sendWebPush(
      { endpoint: sub.endpoint as string, keys: { p256dh: sub.p256dh as string, auth: sub.auth_key as string } },
      { title: push.title, body: push.body, url: push.url },
    );
    if (outcome.outcome === "sent") {
      anySent = true;
      await supabase.from("push_subscriptions").update({ last_success_at: now.toISOString() }).eq("id", sub.id);
    } else if (outcome.outcome === "gone") {
      await supabase.from("push_subscriptions").update({ revoked_at: now.toISOString() }).eq("id", sub.id);
    } else {
      await supabase.from("push_subscriptions").update({ last_failure_at: now.toISOString() }).eq("id", sub.id);
    }
  }

  if (!anySent) {
    await release();
    return "failed";
  }
  return "sent";
}
