import type { SupabaseClient } from "@supabase/supabase-js";
import { pruneNotified, type ReminderPreferences } from "@/lib/notifications/reminderClock";
import { sendWebPush } from "@/lib/notifications/webPush";
import { maintenanceItemSchema, renewalSchema, vehicleSchema } from "./state";
import { planVehicleReminder } from "./vehicleReminders";

export type ReminderDeliveryOutcome = "off" | "none" | "sent" | "no-device" | "failed";

/**
 * Sends the one reminder that is due for this instance, if any.
 *
 * Server side, service role, called by the hourly cron once entitlement has
 * already been checked. Every decision about whether to send is
 * planVehicleReminder's; this only reads, claims, sends and records.
 *
 * The claim is written before the push goes out, so two overlapping runs
 * cannot both send, and released again if nothing reached a device so the
 * next hour tries again instead of losing the reminder.
 *
 * Rows are parsed with the same schemas the client uses; a row that does
 * not parse is skipped rather than allowed to stop everyone else's reminder.
 */
type Row = Record<string, unknown>;

function parseAll<T>(rows: Row[] | null, parse: (row: Row) => { success: boolean; data?: T }): T[] {
  const out: T[] = [];
  for (const row of rows ?? []) {
    const result = parse(row);
    if (result.success && result.data !== undefined) out.push(result.data);
  }
  return out;
}

export async function deliverVehicleReminders(
  supabase: SupabaseClient,
  input: { instanceId: string; userId: string; now: Date }
): Promise<ReminderDeliveryOutcome> {
  const { instanceId, userId, now } = input;

  const { data: row } = await supabase
    .from("vmc_notification_preferences")
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

  const [vehicleRows, itemRows, renewalRows] = await Promise.all([
    supabase.from("vmc_vehicles").select("*").eq("product_instance_id", instanceId).eq("status", "active"),
    supabase.from("vmc_maintenance_items").select("*").eq("product_instance_id", instanceId).eq("status", "active"),
    supabase.from("vmc_renewals").select("*").eq("product_instance_id", instanceId).eq("status", "active"),
  ]);

  const vehicles = parseAll(vehicleRows.data as Row[] | null, (r) =>
    vehicleSchema.safeParse({
      id: r.id, label: r.label, year: r.year, make: r.make, model: r.model,
      currentMileage: r.current_mileage, mileageUpdatedAt: r.mileage_updated_at, historyKnown: r.history_known,
      fuelType: r.fuel_type ?? null, hardUse: r.hard_use ?? false,
      plate: r.plate ?? null, vin: r.vin ?? null, tyreSize: r.tyre_size ?? null, oilSpec: r.oil_spec ?? null,
      insurer: r.insurer ?? null, policyNumber: r.policy_number ?? null, roadsidePhone: r.roadside_phone ?? null,
      status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
    })
  );
  const items = parseAll(itemRows.data as Row[] | null, (r) =>
    maintenanceItemSchema.safeParse({
      id: r.id, vehicleId: r.vehicle_id, templateId: r.template_id, taskName: r.task_name,
      intervalMiles: r.interval_miles, intervalMonths: r.interval_months, severeDuty: r.severe_duty,
      lastDoneAt: r.last_done_at, lastDoneMileage: r.last_done_mileage, status: r.status,
      createdAt: r.created_at, updatedAt: r.updated_at,
    })
  );
  const renewals = parseAll(renewalRows.data as Row[] | null, (r) =>
    renewalSchema.safeParse({
      id: r.id, vehicleId: r.vehicle_id, kind: r.kind, label: r.label, dueOn: r.due_on,
      whereKept: r.where_kept, note: r.note, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
    })
  );

  const push = planVehicleReminder({ vehicles, items, renewals, prefs, notified, now });
  if (!push) return "none";

  const claimed = { ...notified, ...Object.fromEntries(push.keys.map((key) => [key, now.toISOString()])) };
  await supabase.from("vmc_notification_preferences").update({ notified: claimed }).eq("product_instance_id", instanceId);
  const release = () => supabase.from("vmc_notification_preferences").update({ notified }).eq("product_instance_id", instanceId);

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
      { title: push.title, body: push.body, url: push.url }
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
