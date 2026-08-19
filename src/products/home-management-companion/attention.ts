import type { Appliance, MaintenanceTask } from "./state";

/**
 * The shared Attention domain: one deterministic derivation of "what needs
 * a look", built from the same stored dates the Records sections
 * themselves show, never a second opinion or an inferred guess. Powers
 * both the Attention inbox and the Today workspace snapshot from a single
 * source, matching PFC's own attention.ts discipline.
 */

export type AttentionKind = "maintenanceDue" | "warrantyExpiring";
export type AttentionUrgency = "needsResolution" | "worthAWhile";

export interface AttentionItem {
  /** Stable across renders/sessions, `${kind}:${entityId}`. */
  id: string;
  kind: AttentionKind;
  urgency: AttentionUrgency;
  entityId: string;
  message: string;
  href: string;
}

/** How far ahead a warranty expiry surfaces as worth a look before it lapses. */
const WARRANTY_EXPIRING_SOON_DAYS = 30;

function addDays(dateIso: string, days: number): string {
  const date = new Date(`${dateIso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysUntil(dateIso: string, now: Date): number {
  const target = new Date(`${dateIso}T00:00:00Z`);
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export interface AttentionInputs {
  appliances: Appliance[];
  maintenanceTasks: MaintenanceTask[];
}

/**
 * Deterministic: every item traces to a stored date on a real record, and
 * a task that has never been logged is treated as due right away (its
 * "last done" is unknown, not assumed) rather than given a free pass
 * until some arbitrary first deadline.
 */
export function deriveAttentionItems(inputs: AttentionInputs, now: Date = new Date()): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const task of inputs.maintenanceTasks) {
    if (task.status === "archived") continue;
    const nextDueIso = task.lastDoneAt ? addDays(task.lastDoneAt, task.cadenceDays) : task.createdAt.slice(0, 10);
    const days = daysUntil(nextDueIso, now);
    if (days > 0) continue;

    const overdueDays = -days;
    const message = !task.lastDoneAt
      ? `${task.name} has never been logged.`
      : overdueDays === 0
        ? `${task.name} is due today.`
        : `${task.name} is ${overdueDays} ${overdueDays === 1 ? "day" : "days"} overdue.`;

    items.push({
      id: `maintenanceDue:${task.id}`,
      kind: "maintenanceDue",
      urgency: "needsResolution",
      entityId: task.id,
      message,
      href: "/app/products/home-management-companion/maintenance",
    });
  }

  for (const appliance of inputs.appliances) {
    if (appliance.status === "archived") continue;
    if (!appliance.warrantyExpiresAt) continue;
    const days = daysUntil(appliance.warrantyExpiresAt, now);
    if (days > WARRANTY_EXPIRING_SOON_DAYS) continue;

    const message =
      days < 0
        ? `${appliance.name}'s warranty expired ${-days} ${-days === 1 ? "day" : "days"} ago.`
        : days === 0
          ? `${appliance.name}'s warranty expires today.`
          : `${appliance.name}'s warranty expires in ${days} ${days === 1 ? "day" : "days"}.`;

    items.push({
      id: `warrantyExpiring:${appliance.id}`,
      kind: "warrantyExpiring",
      urgency: "worthAWhile",
      entityId: appliance.id,
      message,
      href: "/app/products/home-management-companion/appliances",
    });
  }

  return items;
}
