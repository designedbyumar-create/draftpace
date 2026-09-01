"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import type { TaskEvent } from "../today";
import type { Observation, WorkEntry } from "../record";
import type {
  Child,
  Curriculum,
  CurriculumSource,
  PlanEntry,
  Position,
  SchoolingType,
  Visibility,
} from "../learning";

/**
 * Everything this product reads from and writes to the database.
 *
 * One file, like Personal Life Affairs Companion's, because this product
 * has one loop rather than six independently browsed record types.
 *
 * WHAT THE WRITES GUARANTEE
 *
 * Nothing is deleted. A child, a curriculum or a plan entry leaves by
 * being archived or deactivated, and the row level security has no
 * delete policy, which makes that a guarantee rather than a convention.
 * For a product holding a child's educational history that is not a
 * nicety: a record somebody spent three years building must not be one
 * mis-tap from gone.
 *
 * VISIBILITY IS NEVER SET HERE ON INSERT. The column defaults in
 * 202608220003 decide it, so a row is correct the moment it exists and
 * no code path can create one that is not. Changing it later is an
 * explicit update, below.
 */

const CHILD_COLUMNS =
  "id, name, age, schooling_type, notes, name_visibility, age_visibility, notes_visibility, status, created_at";

async function currentUserId(): Promise<Result<string>> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) return err({ kind: "network", message: error.message });
  if (!session) return err({ kind: "not-authenticated" });
  return ok(session.user.id);
}

function toChild(row: Record<string, unknown>): Child {
  return {
    id: row.id as string,
    name: row.name as string,
    age: (row.age as number | null) ?? null,
    schoolingType: (row.schooling_type as SchoolingType | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    nameVisibility: row.name_visibility as Visibility,
    ageVisibility: row.age_visibility as Visibility,
    notesVisibility: row.notes_visibility as Visibility,
    status: row.status as "active" | "archived",
    createdAt: row.created_at as string,
  };
}

// ------------------------------------------------------------- children

export async function loadChildren(productInstanceId: string): Promise<Result<Child[]>> {
  const { data, error } = await supabase
    .from("hsc_children")
    .select(CHILD_COLUMNS)
    .eq("product_instance_id", productInstanceId)
    .neq("status", "archived")
    .order("created_at", { ascending: true });

  if (error) return err({ kind: "network", message: error.message });
  return ok(((data ?? []) as unknown as Record<string, unknown>[]).map(toChild));
}

export interface NewChild {
  name: string;
  age: number | null;
  schoolingType: SchoolingType | null;
}

export async function createChild(productInstanceId: string, child: NewChild): Promise<Result<Child>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { data, error } = await supabase
    .from("hsc_children")
    .insert({
      product_instance_id: productInstanceId,
      user_id: user.data,
      name: child.name.trim(),
      age: child.age,
      schooling_type: child.schoolingType,
      // Visibility deliberately omitted: the schema decides it.
    })
    .select(CHILD_COLUMNS)
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not add this child." });
  return ok(toChild(data as unknown as Record<string, unknown>));
}

/** The parent changing what appears in the printed record. */
export async function setChildVisibility(
  childId: string,
  field: "name" | "age" | "notes",
  value: Visibility
): Promise<Result<Child>> {
  const column = `${field}_visibility`;
  const { data, error } = await supabase
    .from("hsc_children")
    .update({ [column]: value, updated_at: new Date().toISOString() })
    .eq("id", childId)
    .select(CHILD_COLUMNS)
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not save that." });
  return ok(toChild(data as unknown as Record<string, unknown>));
}

// ------------------------------------------------------------ curricula

export async function loadCurricula(productInstanceId: string): Promise<Result<Curriculum[]>> {
  const { data, error } = await supabase
    .from("hsc_curricula")
    .select("id, child_id, source, title, publisher, subject, visibility, status")
    .eq("product_instance_id", productInstanceId)
    .neq("status", "archived");

  if (error) return err({ kind: "network", message: error.message });
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return ok(
    rows.map((row) => ({
      id: row.id as string,
      childId: row.child_id as string,
      source: row.source as CurriculumSource,
      title: row.title as string,
      publisher: (row.publisher as string | null) ?? null,
      subject: row.subject as string,
      visibility: row.visibility as Visibility,
      status: row.status as "active" | "archived",
    }))
  );
}

export async function createCurriculum(
  productInstanceId: string,
  input: { childId: string; source: CurriculumSource; title: string; subject: string }
): Promise<Result<null>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { error } = await supabase.from("hsc_curricula").insert({
    product_instance_id: productInstanceId,
    user_id: user.data,
    child_id: input.childId,
    source: input.source,
    title: input.title.trim(),
    subject: input.subject.trim(),
  });
  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

// ------------------------------------------------------------ positions

export async function loadPositions(productInstanceId: string): Promise<Result<Position[]>> {
  const { data, error } = await supabase
    .from("hsc_positions")
    .select("id, child_id, curriculum_id, node_id, label, moved_at")
    .eq("product_instance_id", productInstanceId);

  if (error) return err({ kind: "network", message: error.message });
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return ok(
    rows.map((row) => ({
      id: row.id as string,
      childId: row.child_id as string,
      curriculumId: row.curriculum_id as string,
      nodeId: (row.node_id as string | null) ?? null,
      label: (row.label as string | null) ?? null,
      movedAt: row.moved_at as string,
    }))
  );
}

/**
 * Where a child is. Written as a label rather than resolved against a
 * tree, because "Unit 3, Lesson 12" typed by a parent is a complete
 * working model and no document is being parsed to improve on it.
 */
export async function setPosition(
  productInstanceId: string,
  input: { childId: string; curriculumId: string; label: string }
): Promise<Result<null>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { error } = await supabase.from("hsc_positions").upsert(
    {
      product_instance_id: productInstanceId,
      user_id: user.data,
      child_id: input.childId,
      curriculum_id: input.curriculumId,
      label: input.label.trim() || null,
      moved_at: new Date().toISOString(),
    },
    { onConflict: "child_id,curriculum_id" }
  );
  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

// ----------------------------------------------------------------- plan

export async function loadPlan(productInstanceId: string): Promise<Result<PlanEntry[]>> {
  const { data, error } = await supabase
    .from("hsc_plan")
    .select("id, child_id, subject, days_per_week, active, minutes_per_session, origin")
    .eq("product_instance_id", productInstanceId);

  if (error) return err({ kind: "network", message: error.message });
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return ok(
    rows.map((row) => ({
      id: row.id as string,
      childId: row.child_id as string,
      subject: row.subject as string,
      daysPerWeek: row.days_per_week as number,
      active: row.active as boolean,
      minutesPerSession: (row.minutes_per_session as number | null) ?? null,
      origin: (row.origin as PlanEntry["origin"]) ?? "parent",
    }))
  );
}

/**
 * How often a subject runs.
 *
 * The plan has carried days_per_week since phase 1 and nothing could
 * change it, so every subject sat on the default of five. A family that
 * does science twice a week had no way to say so, and Today would have
 * put it in front of them every weekday until they stopped believing it.
 */
export async function setSubjectFrequency(planId: string, daysPerWeek: number): Promise<Result<null>> {
  const { error } = await supabase
    .from("hsc_plan")
    .update({ days_per_week: daysPerWeek, updated_at: new Date().toISOString() })
    .eq("id", planId);
  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

/** Turning a subject off without losing what was recorded against it. */
export async function setSubjectActive(planId: string, active: boolean): Promise<Result<null>> {
  const { error } = await supabase
    .from("hsc_plan")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", planId);
  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

export interface SubjectPlan {
  subject: string;
  daysPerWeek?: number;
  minutesPerSession?: number | null;
  origin?: "parent" | "draftpace-outline";
}

export async function setSubjects(
  productInstanceId: string,
  childId: string,
  subjects: (string | SubjectPlan)[]
): Promise<Result<null>> {
  const user = await currentUserId();
  if (!user.ok) return user;
  if (subjects.length === 0) return ok(null);

  const rows = subjects.map((entry) => {
    const plan: SubjectPlan = typeof entry === "string" ? { subject: entry } : entry;
    return {
      product_instance_id: productInstanceId,
      user_id: user.data,
      child_id: childId,
      subject: plan.subject.trim(),
      active: true,
      // Only written when there is something to write. A parent who
      // never wanted an outline keeps the schema default rather than
      // inheriting somebody else's idea of a school day.
      ...(plan.daysPerWeek !== undefined ? { days_per_week: plan.daysPerWeek } : {}),
      ...(plan.minutesPerSession !== undefined ? { minutes_per_session: plan.minutesPerSession } : {}),
      ...(plan.origin !== undefined ? { origin: plan.origin } : {}),
    };
  });

  const { error } = await supabase.from("hsc_plan").upsert(rows, { onConflict: "child_id,subject" });
  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

// ---------------------------------------------------------- task events

export async function loadTaskEvents(productInstanceId: string, limit = 400): Promise<Result<WorkEntry[]>> {
  const { data, error } = await supabase
    .from("hsc_task_events")
    .select("child_id, subject, on_date, state, difficulty, help_needed, position_label")
    .eq("product_instance_id", productInstanceId)
    .order("on_date", { ascending: false })
    .limit(limit);

  if (error) return err({ kind: "network", message: error.message });
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return ok(
    rows.map((row) => ({
      childId: row.child_id as string,
      subject: row.subject as string,
      onDate: row.on_date as string,
      state: row.state as TaskEvent["state"],
      difficulty: (row.difficulty as TaskEvent["difficulty"]) ?? null,
      helpNeeded: (row.help_needed as TaskEvent["helpNeeded"]) ?? null,
      // Carried so the record can say where they were on the day, rather
      // than where they are now. See the migration's note.
      positionLabel: (row.position_label as string | null) ?? null,
    }))
  );
}

export interface RecordedWork {
  childId: string;
  subject: string;
  onDate: string;
  state: "done" | "not-completed";
  /** Both optional, always. A parent who only ever taps Done gets a complete product. */
  difficulty?: TaskEvent["difficulty"];
  helpNeeded?: TaskEvent["helpNeeded"];
  /** Snapshotted, never resolved later. See the migration's note on why. */
  curriculumId: string | null;
  positionLabel: string | null;
  source: CurriculumSource;
}

/**
 * What happened, recorded.
 *
 * Upserted on (child, subject, day), so tapping Done twice is one
 * session and a correction replaces rather than duplicates. The
 * snapshots go in here and are never read back through a join: a record
 * of March must not rewrite itself in June because somebody moved on.
 */
export async function recordWork(productInstanceId: string, work: RecordedWork): Promise<Result<null>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { error } = await supabase.from("hsc_task_events").upsert(
    {
      product_instance_id: productInstanceId,
      user_id: user.data,
      child_id: work.childId,
      subject: work.subject,
      curriculum_id: work.curriculumId,
      position_label: work.positionLabel,
      source: work.source,
      on_date: work.onDate,
      state: work.state,
      difficulty: work.difficulty ?? null,
      help_needed: work.helpNeeded ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "child_id,subject,on_date" }
  );
  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

// ---------------------------------------------------------- observations

export async function loadObservations(productInstanceId: string, limit = 400): Promise<Result<Observation[]>> {
  const { data, error } = await supabase
    .from("hsc_observations")
    .select("id, child_id, on_date, note, visibility")
    .eq("product_instance_id", productInstanceId)
    .neq("status", "archived")
    .order("on_date", { ascending: false })
    .limit(limit);

  if (error) return err({ kind: "network", message: error.message });
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return ok(
    rows.map((row) => ({
      id: row.id as string,
      childId: row.child_id as string,
      onDate: row.on_date as string,
      note: row.note as string,
      visibility: row.visibility as Visibility,
    }))
  );
}

/**
 * A parent noticing something.
 *
 * Visibility is deliberately not a parameter: the column default keeps
 * it private, and opting one into a printed record is a separate,
 * deliberate act. A note written in a hurry must never end up on paper
 * because of a setting made months earlier about something else.
 */
export async function createObservation(
  productInstanceId: string,
  input: { childId: string; onDate: string; note: string }
): Promise<Result<null>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { error } = await supabase.from("hsc_observations").insert({
    product_instance_id: productInstanceId,
    user_id: user.data,
    child_id: input.childId,
    on_date: input.onDate,
    note: input.note.trim(),
  });
  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

export async function setObservationVisibility(
  observationId: string,
  visibility: Visibility
): Promise<Result<null>> {
  const { error } = await supabase
    .from("hsc_observations")
    .update({ visibility, updated_at: new Date().toISOString() })
    .eq("id", observationId);
  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

// ---------------------------------------------------------- child topics

export interface ChildTopic {
  id: string;
  childId: string;
  subject: string;
  topicKey: string;
  state: "current" | "covered" | "removed";
}

export async function loadChildTopics(productInstanceId: string): Promise<Result<ChildTopic[]>> {
  const { data, error } = await supabase
    .from("hsc_child_topics")
    .select("id, child_id, subject, topic_key, state")
    .eq("product_instance_id", productInstanceId)
    // A tick taken back is not read anywhere. The row survives because
    // this product deletes nothing.
    .neq("state", "removed");

  if (error) return err({ kind: "network", message: error.message });
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return ok(
    rows.map((row) => ({
      id: row.id as string,
      childId: row.child_id as string,
      subject: row.subject as string,
      topicKey: row.topic_key as string,
      state: row.state as ChildTopic["state"],
    }))
  );
}

/**
 * What a child is covering, ticked by the parent.
 *
 * The five second interaction that replaces a document parsing
 * pipeline. Upserted per topic so ticking the same one twice is not two
 * rows, and so moving a topic from current to covered is one write.
 */
export async function setChildTopic(
  productInstanceId: string,
  input: { childId: string; subject: string; topicKey: string; state: "current" | "covered" }
): Promise<Result<null>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { error } = await supabase.from("hsc_child_topics").upsert(
    {
      product_instance_id: productInstanceId,
      user_id: user.data,
      child_id: input.childId,
      subject: input.subject,
      topic_key: input.topicKey,
      state: input.state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "child_id,topic_key" }
  );
  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

/**
 * Unticking.
 *
 * Sets a state rather than deleting the row. This product has no delete
 * policy on any table, so a delete here would not have failed loudly, it
 * would have silently done nothing and left the parent looking at a
 * topic they had just removed.
 */
export async function clearChildTopic(childId: string, topicKey: string): Promise<Result<null>> {
  const { error } = await supabase
    .from("hsc_child_topics")
    .update({ state: "removed", updated_at: new Date().toISOString() })
    .eq("child_id", childId)
    .eq("topic_key", topicKey);
  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}
