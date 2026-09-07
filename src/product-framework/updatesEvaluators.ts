import type { SupabaseClient } from "@supabase/supabase-js";
import { deriveAttention } from "@/products/alongside/attention";
import { ITEM_COLUMNS as ALONGSIDE_ITEM_COLUMNS, toItem as toAlongsideItem } from "@/products/alongside/domain/alongsideData";

/**
 * Per-product "what's worth telling someone" evaluators for the four
 * products that don't yet have their own cron/push infrastructure
 * (Alongside, Homeschooling Companion, Travel Companion, Personal Life
 * Affairs Companion) — unlike Personal Finance Companion and Home
 * Management Companion, none of these send real push; this module's only
 * job is producing rows for the cross-product Updates feed
 * (`product_updates`), which is why each evaluator returns plain
 * {title, body, url, dedupeKey} payloads rather than anything push-shaped.
 *
 * Every signal here is derived from a field that already exists and is
 * already stored for its own reason — nothing here invents a new kind of
 * judgment a product doesn't already make. Where a product genuinely has
 * no usable signal yet (e.g. a due-date on a homeschooling check, a
 * document-expiry date on a travel document), that's deliberately left
 * unbuilt rather than faked — see the plan this shipped against.
 *
 * One dispatcher, one place that switches on productSlug — the same
 * adapter-boundary discipline attentionAdapter.ts already established, so
 * the cron route itself (and everything else downstream) never branches
 * on product family.
 */

export type UpdatePayload = {
  title: string;
  body: string;
  url: string;
  dedupeKey: string;
};

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Monday-anchored week start, so a "gone quiet" notice fires once per week past the threshold, not once per day. */
function isoWeekStart(now: Date): string {
  const day = now.getUTCDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diffToMonday));
  return isoDate(monday);
}

function daysBetween(fromIso: string, now: Date): number {
  const from = new Date(`${fromIso}T00:00:00Z`);
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return Math.round((from.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function describeDaysUntil(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

/**
 * Reuses Alongside's own `deriveAttention` directly — no new judgment,
 * same fixed phrasings the product already commits to. The "ready"
 * signal (something got unblocked) needs the cron to compare against a
 * previous poll to detect the transition safely; that extra state isn't
 * built yet, so it's excluded here rather than risking a wrong dedupe.
 */
async function evaluateAlongsideUpdates(supabase: SupabaseClient, instanceId: string, now: Date): Promise<UpdatePayload[]> {
  const { data } = await supabase
    .from("als_items")
    .select(ALONGSIDE_ITEM_COLUMNS)
    .eq("product_instance_id", instanceId)
    .neq("status", "archived");

  const items = ((data ?? []) as unknown as Record<string, unknown>[]).map(toAlongsideItem);
  const { signals } = deriveAttention({ items }, now);

  return signals
    .filter((signal) => signal.reason !== "ready")
    .map((signal) => ({
      title: "Worth a look",
      body: signal.line,
      url: `/app/products/alongside/item/${signal.itemId}`,
      dedupeKey: `${signal.itemId}:${signal.reason}`,
    }));
}

/**
 * The one honest signal this product's stored data supports today: a
 * child nothing has been logged for in a while. Never fires for a child
 * with zero logged events at all — that's every brand-new child on day
 * one, which would be a false-start nag, not a real "gone quiet" fact.
 */
const HOMESCHOOLING_QUIET_DAYS_THRESHOLD = 6;

async function evaluateHomeschoolingUpdates(supabase: SupabaseClient, instanceId: string, now: Date): Promise<UpdatePayload[]> {
  const [childrenRes, eventsRes] = await Promise.all([
    supabase.from("hsc_children").select("id, name").eq("product_instance_id", instanceId),
    supabase.from("hsc_task_events").select("child_id, on_date").eq("product_instance_id", instanceId),
  ]);

  const lastLoggedByChild = new Map<string, string>();
  for (const event of (eventsRes.data ?? []) as { child_id: string; on_date: string }[]) {
    const current = lastLoggedByChild.get(event.child_id);
    if (!current || event.on_date > current) lastLoggedByChild.set(event.child_id, event.on_date);
  }

  const weekStart = isoWeekStart(now);
  const payloads: UpdatePayload[] = [];
  for (const child of (childrenRes.data ?? []) as { id: string; name: string }[]) {
    const lastLogged = lastLoggedByChild.get(child.id);
    if (!lastLogged) continue;
    const daysSince = -daysBetween(lastLogged, now);
    if (daysSince < HOMESCHOOLING_QUIET_DAYS_THRESHOLD) continue;
    payloads.push({
      title: `Haven't logged anything for ${child.name} in a while`,
      body: `Last logged ${lastLogged}.`,
      url: `/app/products/homeschooling-companion/kids/${child.id}`,
      dedupeKey: `homeschoolingQuiet:${child.id}:${weekStart}`,
    });
  }
  return payloads;
}

/** A trip's own start date is real, stored, and already used for day-relative windowing elsewhere in this product — nothing invented. */
const TRAVEL_UPCOMING_WINDOW_DAYS = 14;

async function evaluateTravelUpdates(supabase: SupabaseClient, instanceId: string, now: Date): Promise<UpdatePayload[]> {
  const { data } = await supabase
    .from("trv_trips")
    .select("id, title, destination_summary, starts_at")
    .eq("product_instance_id", instanceId)
    .in("status", ["planning", "active"]);

  const payloads: UpdatePayload[] = [];
  for (const trip of (data ?? []) as { id: string; title: string; destination_summary: string | null; starts_at: string | null }[]) {
    if (!trip.starts_at) continue;
    const days = daysBetween(trip.starts_at, now);
    if (days < 0 || days > TRAVEL_UPCOMING_WINDOW_DAYS) continue;
    const label = trip.destination_summary || trip.title;
    payloads.push({
      title: `Your trip to ${label} starts ${describeDaysUntil(days)}`,
      body: `Starts ${trip.starts_at}.`,
      url: `/app/products/travel-companion/trip`,
      dedupeKey: `travelTripUpcoming:${trip.id}`,
    });
  }
  return payloads;
}

/**
 * pla_items.next_review_at is computed and stored specifically for this
 * purpose (see migration 202608220001's own comment) — the strongest,
 * most natural of the four signals, and the dedupe key advances on its
 * own the moment an item is reconfirmed and next_review_at moves forward.
 *
 * The status filter mirrors needsReview() in lifeAffairs.ts exactly:
 * only an "established" record is ever due for review. Migration
 * 202608220001 renamed "active" to "established" (and split off
 * "incomplete" as a distinct standing); this query used to filter on
 * "active", a value the column has not accepted since that migration
 * ran, so it silently matched zero rows from the day it shipped.
 */
async function evaluatePersonalLifeAffairsUpdates(supabase: SupabaseClient, instanceId: string, now: Date): Promise<UpdatePayload[]> {
  const { data } = await supabase
    .from("pla_items")
    .select("id, label, next_review_at")
    .eq("product_instance_id", instanceId)
    .eq("status", "established")
    .not("next_review_at", "is", null)
    .lte("next_review_at", now.toISOString());

  return ((data ?? []) as { id: string; label: string; next_review_at: string }[]).map((item) => ({
    title: `It's time to review ${item.label}`,
    body: `Was due for review by ${item.next_review_at.slice(0, 10)}.`,
    url: `/app/products/personal-life-affairs-companion/affairs`,
    dedupeKey: `pla_reviewDue:${item.id}:${item.next_review_at.slice(0, 10)}`,
  }));
}

const EVALUATED_PRODUCT_SLUGS = [
  "alongside",
  "homeschooling-companion",
  "travel-companion",
  "personal-life-affairs-companion",
] as const;

export type EvaluatedProductSlug = (typeof EVALUATED_PRODUCT_SLUGS)[number];

export function isEvaluatedProductSlug(slug: string): slug is EvaluatedProductSlug {
  return (EVALUATED_PRODUCT_SLUGS as readonly string[]).includes(slug);
}

/** The one place that switches on productSlug — never in the cron route itself. */
export async function evaluateProductUpdates(
  supabase: SupabaseClient,
  productSlug: EvaluatedProductSlug,
  instanceId: string,
  now: Date
): Promise<UpdatePayload[]> {
  switch (productSlug) {
    case "alongside":
      return evaluateAlongsideUpdates(supabase, instanceId, now);
    case "homeschooling-companion":
      return evaluateHomeschoolingUpdates(supabase, instanceId, now);
    case "travel-companion":
      return evaluateTravelUpdates(supabase, instanceId, now);
    case "personal-life-affairs-companion":
      return evaluatePersonalLifeAffairsUpdates(supabase, instanceId, now);
  }
}
