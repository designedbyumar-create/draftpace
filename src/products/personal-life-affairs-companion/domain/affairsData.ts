"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import type { AffairArea, AffairGate } from "../affairsKnowledge";
import { computeNextReview, type AffairItem, type AffairItemRevision, type AffairItemStatus } from "../lifeAffairs";
import type { AffairItemDraft } from "../capture";
import { describeChange } from "../changeSummary";
import type { AffairProfile, StepRecord, StepState } from "../sequencer";

/**
 * Everything this product reads from and writes to the database.
 *
 * Deliberately one file rather than a repository per table. Home Base
 * has six domain modules because it has six independent record types
 * that a person browses separately. This product has one surface and one
 * loop, so splitting it would create files that only ever get called
 * together.
 *
 * WHAT THE WRITES GUARANTEE
 *
 * Every change to a record writes a revision in the same call. History
 * that is optional is history that goes missing exactly when somebody
 * needs to know what a beneficiary used to be. Nothing here deletes: a
 * record leaves by being archived, which is itself a revision, and the
 * row level security has no delete policy to make that a guarantee
 * rather than a convention.
 *
 * Nothing here writes a credential or a document. pla_items records
 * where a thing is and who it concerns, which is the product boundary.
 */

const ITEM_COLUMNS =
  "id, kind, area, origin_step_key, label, whereabouts, person_name, person_contact, notes, fields, status, established_at, last_confirmed_at, review_interval_months, next_review_at";

/** Maps the profile's snake_case columns to the gate names the knowledge base uses. */
const GATE_COLUMN: Record<AffairGate, string> = {
  hasChildren: "has_children",
  hasDependantsWithExtraNeeds: "has_dependants_with_extra_needs",
  partnered: "partnered",
  ownsHome: "owns_home",
  hasEmployerRetirement: "has_employer_retirement",
  hasBusiness: "has_business",
  hasPets: "has_pets",
  hasLifeInsurance: "has_life_insurance",
};

async function currentUserId(): Promise<Result<string>> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) return err({ kind: "network", message: error.message });
  if (!session) return err({ kind: "not-authenticated" });
  return ok(session.user.id);
}

// ---------------------------------------------------------------- profile

export async function loadProfile(productInstanceId: string): Promise<Result<AffairProfile>> {
  const { data, error } = await supabase
    .from("pla_profile")
    .select(Object.values(GATE_COLUMN).join(", "))
    .eq("product_instance_id", productInstanceId)
    .maybeSingle();

  // No row means nothing has been asked yet, which is a valid state and
  // never an error a person should see.
  if (error || !data) return ok({});

  const row = data as unknown as Record<string, boolean | null>;
  const profile: AffairProfile = {};
  for (const [gate, column] of Object.entries(GATE_COLUMN) as [AffairGate, string][]) {
    const value = row[column];
    if (typeof value === "boolean") profile[gate] = value;
  }
  return ok(profile);
}

export async function saveProfileAnswer(
  productInstanceId: string,
  gate: AffairGate,
  value: boolean
): Promise<Result<AffairProfile>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { error } = await supabase.from("pla_profile").upsert(
    {
      product_instance_id: productInstanceId,
      user_id: user.data,
      [GATE_COLUMN[gate]]: value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_instance_id" }
  );
  if (error) return err({ kind: "network", message: error.message });
  return loadProfile(productInstanceId);
}

// ------------------------------------------------------------------ steps

function toStepRecord(row: Record<string, unknown>): StepRecord {
  return {
    stepKey: row.step_key as string,
    state: row.state as StepState,
    confirmedAt: (row.confirmed_at as string | null) ?? null,
    snoozedUntil: (row.snoozed_until as string | null) ?? null,
    legacyConfirmation: Boolean(row.legacy_confirmation),
  };
}

export async function loadSteps(productInstanceId: string): Promise<Result<StepRecord[]>> {
  const { data, error } = await supabase
    .from("pla_steps")
    .select("step_key, state, confirmed_at, snoozed_until, legacy_confirmation")
    .eq("product_instance_id", productInstanceId);

  if (error) return err({ kind: "network", message: error.message });
  return ok(((data ?? []) as unknown as Record<string, unknown>[]).map(toStepRecord));
}

/**
 * Records what a person decided about one step.
 *
 * confirmed_at is written only when the state is "confirmed", and it is
 * the moment a human asserted the fact is still true. Every other state
 * clears it, because a step that is open or not relevant has no currency
 * to claim.
 *
 * legacy_confirmation is written false on every path here. Anything this
 * function touches has been dealt with by the current product, so it is
 * no longer one of the dateless confirmations the map migration flagged.
 */
export async function recordStep(
  productInstanceId: string,
  stepKey: string,
  state: StepState,
  options: { notes?: string | null; snoozedUntil?: string | null } = {}
): Promise<Result<StepRecord[]>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { error } = await supabase.from("pla_steps").upsert(
    {
      product_instance_id: productInstanceId,
      user_id: user.data,
      step_key: stepKey,
      state,
      confirmed_at: state === "confirmed" ? new Date().toISOString() : null,
      needs_recheck_reason: null,
      legacy_confirmation: false,
      notes: options.notes ?? null,
      snoozed_until: options.snoozedUntil ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_instance_id,step_key" }
  );
  if (error) return err({ kind: "network", message: error.message });
  return loadSteps(productInstanceId);
}

// ------------------------------------------------------- the affairs map

function toItem(row: Record<string, unknown>): AffairItem {
  return {
    id: row.id as string,
    kind: row.kind as string,
    area: (row.area as AffairArea) ?? "paperwork",
    originStepKey: (row.origin_step_key as string | null) ?? null,
    label: row.label as string,
    whereabouts: (row.whereabouts as string | null) ?? null,
    personName: (row.person_name as string | null) ?? null,
    personContact: (row.person_contact as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    fields: (row.fields as Record<string, string> | null) ?? {},
    status: row.status as AffairItemStatus,
    establishedAt: (row.established_at as string | null) ?? null,
    lastConfirmedAt: (row.last_confirmed_at as string | null) ?? null,
    reviewIntervalMonths: (row.review_interval_months as number | null) ?? null,
    nextReviewAt: (row.next_review_at as string | null) ?? null,
  };
}

export async function loadItems(productInstanceId: string): Promise<Result<AffairItem[]>> {
  const { data, error } = await supabase
    .from("pla_items")
    .select(ITEM_COLUMNS)
    .eq("product_instance_id", productInstanceId)
    .neq("status", "archived")
    .order("created_at", { ascending: true });

  if (error) return err({ kind: "network", message: error.message });
  return ok(((data ?? []) as unknown as Record<string, unknown>[]).map(toItem));
}

async function writeRevision(
  productInstanceId: string,
  userId: string,
  item: AffairItem,
  changeKind: AffairItemRevision["changeKind"],
  summary: string
): Promise<void> {
  // A failed revision must never roll back the change the person just
  // made, so this does not surface an error. The record is the thing
  // they care about; the revision is how we describe it later.
  await supabase.from("pla_item_revisions").insert({
    product_instance_id: productInstanceId,
    user_id: userId,
    item_id: item.id,
    change_kind: changeKind,
    summary,
    snapshot: {
      label: item.label,
      whereabouts: item.whereabouts,
      personName: item.personName,
      personContact: item.personContact,
      notes: item.notes,
      fields: item.fields,
      status: item.status,
    },
  });
}

/**
 * Write a new piece of knowledge into the map.
 *
 * reviewEveryMonths comes from the knowledge base's own interval for the
 * step, so the review clock is set once, at the moment the fact is
 * established, from a rule that lives in a reviewable file rather than
 * from anything the person has to configure.
 */
export async function establishItem(
  productInstanceId: string,
  draft: AffairItemDraft,
  reviewEveryMonths: number | null
): Promise<Result<AffairItem[]>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const now = new Date();
  const nowIso = now.toISOString();

  const { data, error } = await supabase
    .from("pla_items")
    .insert({
      product_instance_id: productInstanceId,
      user_id: user.data,
      kind: draft.kind,
      area: draft.area,
      origin_step_key: draft.originStepKey,
      label: draft.label,
      whereabouts: draft.whereabouts,
      person_name: draft.personName,
      person_contact: draft.personContact,
      notes: draft.notes,
      fields: draft.fields,
      status: draft.status,
      established_at: nowIso,
      last_confirmed_at: nowIso,
      review_interval_months: reviewEveryMonths,
      next_review_at: computeNextReview(reviewEveryMonths, now),
    })
    .select(ITEM_COLUMNS)
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not save that." });

  const item = toItem(data as unknown as Record<string, unknown>);
  await writeRevision(productInstanceId, user.data, item, "established", `Recorded ${item.label}.`);
  return loadItems(productInstanceId);
}

/**
 * Change what a record says.
 *
 * The summary is built from what actually differs, so the history reads
 * as "Changed who to contact first from Tom to Jane" rather than
 * "Updated". A person coming back after two years needs the first one.
 */
export async function updateItem(
  productInstanceId: string,
  existing: AffairItem,
  draft: AffairItemDraft
): Promise<Result<AffairItem[]>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const now = new Date();
  const nowIso = now.toISOString();

  const { data, error } = await supabase
    .from("pla_items")
    .update({
      label: draft.label,
      whereabouts: draft.whereabouts,
      person_name: draft.personName,
      person_contact: draft.personContact,
      notes: draft.notes,
      fields: draft.fields,
      status: draft.status,
      last_confirmed_at: nowIso,
      next_review_at: computeNextReview(existing.reviewIntervalMonths, now),
      updated_at: nowIso,
    })
    .eq("id", existing.id)
    .select(ITEM_COLUMNS)
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not save that." });

  const item = toItem(data as unknown as Record<string, unknown>);
  await writeRevision(productInstanceId, user.data, item, "updated", describeChange(existing, item));
  return loadItems(productInstanceId);
}

/**
 * The person looked at a record and said it is still true.
 *
 * Nothing about the record changes except the two dates, which is the
 * entire point: the value of this product after year one is being able
 * to say when a human last looked at something and agreed with it.
 */
export async function confirmItem(productInstanceId: string, existing: AffairItem): Promise<Result<AffairItem[]>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const now = new Date();
  const { data, error } = await supabase
    .from("pla_items")
    .update({
      last_confirmed_at: now.toISOString(),
      next_review_at: computeNextReview(existing.reviewIntervalMonths, now),
      updated_at: now.toISOString(),
    })
    .eq("id", existing.id)
    .select(ITEM_COLUMNS)
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not save that." });

  const item = toItem(data as unknown as Record<string, unknown>);
  await writeRevision(productInstanceId, user.data, item, "confirmed", `Confirmed ${item.label} is still true.`);
  return loadItems(productInstanceId);
}

/**
 * How a record leaves. Archived, never deleted, and the archiving is
 * itself history.
 *
 * The second write is the important one. Saying "this no longer applies"
 * means stop asking, but the sequencer decides an establish step is
 * settled by the presence of a record, so removing the last record for a
 * step made the companion offer it again as though it had never been
 * answered. A person who had just said a thing did not apply to them was
 * asked about it on the next screen.
 *
 * Only when it is the LAST one. Rehoming one of three cats must not
 * silence the question about the other two.
 */
export async function archiveItem(productInstanceId: string, existing: AffairItem): Promise<Result<AffairItem[]>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { error } = await supabase
    .from("pla_items")
    .update({ status: "archived", next_review_at: null, updated_at: new Date().toISOString() })
    .eq("id", existing.id);

  if (error) return err({ kind: "network", message: error.message });
  await writeRevision(productInstanceId, user.data, existing, "archived", `Removed ${existing.label}.`);

  const remaining = await loadItems(productInstanceId);
  if (remaining.ok && existing.originStepKey) {
    const stillThere = remaining.data.some((i) => i.originStepKey === existing.originStepKey);
    if (!stillThere) {
      const silenced = await recordStep(productInstanceId, existing.originStepKey, "notRelevant");
      if (!silenced.ok) return silenced;
    }
  }
  return remaining;
}

// -------------------------------------------------------------- history

export async function loadRevisions(
  productInstanceId: string,
  limit = 60
): Promise<Result<(AffairItemRevision & { label: string; area: AffairArea })[]>> {
  const { data, error } = await supabase
    .from("pla_item_revisions")
    .select("id, item_id, change_kind, summary, created_at, pla_items!inner(label, area)")
    .eq("product_instance_id", productInstanceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return err({ kind: "network", message: error.message });

  const rows = (data ?? []) as unknown as {
    id: string;
    item_id: string;
    change_kind: AffairItemRevision["changeKind"];
    summary: string | null;
    created_at: string;
    pla_items: { label: string; area: AffairArea } | { label: string; area: AffairArea }[];
  }[];

  return ok(
    rows.map((row) => {
      const joined = Array.isArray(row.pla_items) ? row.pla_items[0] : row.pla_items;
      return {
        id: row.id,
        itemId: row.item_id,
        changeKind: row.change_kind,
        summary: row.summary,
        createdAt: row.created_at,
        label: joined?.label ?? "A record",
        area: joined?.area ?? "paperwork",
      };
    })
  );
}

// ---------------------------------------------------------- life events

export interface LifeEventRow {
  id: string;
  kind: string;
  occurredOn: string | null;
  createdAt: string;
}

export async function loadLifeEvents(productInstanceId: string): Promise<Result<LifeEventRow[]>> {
  const { data, error } = await supabase
    .from("pla_events")
    .select("id, kind, occurred_on, created_at")
    .eq("product_instance_id", productInstanceId)
    .order("created_at", { ascending: false });

  if (error) return err({ kind: "network", message: error.message });
  const rows = (data ?? []) as unknown as { id: string; kind: string; occurred_on: string | null; created_at: string }[];
  return ok(rows.map((r) => ({ id: r.id, kind: r.kind, occurredOn: r.occurred_on, createdAt: r.created_at })));
}

/**
 * Record that something in the person's life changed, and bring forward
 * the review on everything that change could have made untrue.
 *
 * The affected records are not marked wrong, because the product does
 * not know that they are. Their next review is simply moved to now, so
 * they surface as "worth checking again" through the same one-step-at-a-
 * time path as everything else. A move does not produce a list of four
 * tasks; it produces one question, then the next.
 */
export async function recordLifeEvent(
  productInstanceId: string,
  kind: string,
  affectedItemIds: string[]
): Promise<Result<AffairItem[]>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { error } = await supabase.from("pla_events").insert({
    product_instance_id: productInstanceId,
    user_id: user.data,
    kind,
  });
  if (error) return err({ kind: "network", message: error.message });

  if (affectedItemIds.length > 0) {
    const { error: touchError } = await supabase
      .from("pla_items")
      .update({ next_review_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .in("id", affectedItemIds);
    if (touchError) return err({ kind: "network", message: touchError.message });
  }

  return loadItems(productInstanceId);
}
