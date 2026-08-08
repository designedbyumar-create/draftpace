"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import { reminderDeepLink } from "../reminders/copy";
import type {
  PersonalFinanceCompanionReminderKind,
  ReminderLifecycleState,
  ReminderMetadata,
  ReminderSchedule,
  ReminderSource,
} from "../reminders";
import type { FinancialArea } from "../state";

/**
 * CRUD for pfc_reminders — mirrors the seven record repositories' RLS-
 * enforced direct-write pattern (see 202608080003's header) rather than
 * an RPC, for the same reason: no optimistic-concurrency or denormalized-
 * cache requirement here that would call for one.
 */

interface ReminderRow {
  id: string;
  user_id: string;
  product_instance_id: string;
  entity_type: string | null;
  entity_id: string | null;
  kind: string;
  source: string;
  schedule: unknown;
  note: string | null;
  dedupe_key: string;
  status: string;
  next_eligible_at: string;
  snoozed_until: string | null;
  acknowledged_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

const SELECT_COLUMNS =
  "id, user_id, product_instance_id, entity_type, entity_id, kind, source, schedule, note, dedupe_key, status, next_eligible_at, snoozed_until, acknowledged_at, cancelled_at, created_at, updated_at";

function entityContext(entityType: string | null, entityId: string | null): Parameters<typeof reminderDeepLink>[1] {
  if (!entityType || !entityId) return {};
  switch (entityType as FinancialArea) {
    case "bills":
      return { billId: entityId };
    case "income":
      return { incomeSourceId: entityId };
    case "accounts":
      return { accountId: entityId };
    case "subscriptions":
      return { subscriptionId: entityId };
    case "debt":
      return { debtId: entityId };
    default:
      return {};
  }
}

function fromRow(row: ReminderRow): ReminderMetadata {
  const kind = row.kind as PersonalFinanceCompanionReminderKind;
  return {
    id: row.id,
    userId: row.user_id,
    productInstanceId: row.product_instance_id,
    entityType: (row.entity_type as FinancialArea) ?? null,
    entityId: row.entity_id,
    kind,
    source: row.source as ReminderSource,
    schedule: row.schedule as ReminderSchedule,
    note: row.note,
    dedupeKey: row.dedupe_key,
    state: row.status as ReminderLifecycleState,
    nextEligibleAt: row.next_eligible_at,
    snoozedUntil: row.snoozed_until,
    acknowledgedAt: row.acknowledged_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** The actual safe URL for this reminder — computed, not stored, from kind + entity context. */
export function resolvedReminderDeepLink(reminder: ReminderMetadata): string {
  return reminderDeepLink(reminder.kind, entityContext(reminder.entityType, reminder.entityId));
}

export async function listReminders(productInstanceId: string): Promise<Result<ReminderMetadata[]>> {
  const { data, error } = await supabase
    .from("pfc_reminders")
    .select(SELECT_COLUMNS)
    .eq("product_instance_id", productInstanceId)
    .neq("status", "cancelled")
    .order("next_eligible_at", { ascending: true });

  if (error) return err({ kind: "network", message: error.message });
  return ok((data as ReminderRow[]).map(fromRow));
}

export async function createUserReminder(
  productInstanceId: string,
  input: { entityType?: FinancialArea; entityId?: string; note: string; schedule: ReminderSchedule; nextEligibleAt: string }
): Promise<Result<ReminderMetadata>> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) return err({ kind: "network", message: userError.message });
  if (!user) return err({ kind: "not-authenticated" });

  const dedupeKey = `userCreated:${crypto.randomUUID()}`;

  const { data, error } = await supabase
    .from("pfc_reminders")
    .insert({
      product_instance_id: productInstanceId,
      user_id: user.id,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      kind: "userCreated",
      source: "user",
      schedule: input.schedule,
      note: input.note,
      dedupe_key: dedupeKey,
      status: "scheduled",
      next_eligible_at: input.nextEligibleAt,
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error) return err({ kind: "network", message: error.message });
  return ok(fromRow(data));
}

export async function snoozeReminder(id: string, until: Date): Promise<Result<ReminderMetadata>> {
  const { data, error } = await supabase
    .from("pfc_reminders")
    .update({ status: "snoozed", snoozed_until: until.toISOString() })
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();

  if (error) return err({ kind: "network", message: error.message });
  return ok(fromRow(data));
}

export async function acknowledgeReminder(id: string): Promise<Result<ReminderMetadata>> {
  const { data, error } = await supabase
    .from("pfc_reminders")
    .update({ status: "acknowledged", acknowledged_at: new Date().toISOString() })
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();

  if (error) return err({ kind: "network", message: error.message });
  return ok(fromRow(data));
}

export async function cancelReminder(id: string): Promise<Result<ReminderMetadata>> {
  const { data, error } = await supabase
    .from("pfc_reminders")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();

  if (error) return err({ kind: "network", message: error.message });
  return ok(fromRow(data));
}
