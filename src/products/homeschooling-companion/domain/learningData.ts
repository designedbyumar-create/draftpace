"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
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
    .select("id, child_id, subject, days_per_week, active")
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
    }))
  );
}

export async function setSubjects(
  productInstanceId: string,
  childId: string,
  subjects: string[]
): Promise<Result<null>> {
  const user = await currentUserId();
  if (!user.ok) return user;
  if (subjects.length === 0) return ok(null);

  const { error } = await supabase.from("hsc_plan").upsert(
    subjects.map((subject) => ({
      product_instance_id: productInstanceId,
      user_id: user.data,
      child_id: childId,
      subject: subject.trim(),
      active: true,
    })),
    { onConflict: "child_id,subject" }
  );
  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}
