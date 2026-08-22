import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { DEFAULT_VISIBILITY, shareableChildFields, type Child } from "./learning";

/**
 * The founder decided these defaults, and they are expressed twice: once
 * as a column DEFAULT so a row is correct the moment it is created, and
 * once in TypeScript so the app can reason about them. Two expressions
 * of one rule is two chances to disagree, so they are checked against
 * each other here.
 *
 * The schema is the authority. If these ever diverge, the migration is
 * right and the constant is wrong, because the migration is what
 * actually decides what a child's record says.
 */
const migration = readFileSync(
  new URL("../../../supabase/migrations/202608220003_homeschooling_companion_records.sql", import.meta.url),
  "utf8"
);

function columnDefault(column: string): string | null {
  const match = migration.match(new RegExp(`${column} text not null default '([a-z]+)'`));
  return match ? match[1] : null;
}

describe("visibility defaults are established at creation", () => {
  it("makes a child's name shareable in the schema itself", () => {
    expect(columnDefault("name_visibility")).toBe("shareable");
    expect(columnDefault("name_visibility")).toBe(DEFAULT_VISIBILITY.childName);
  });

  it("keeps a child's age private in the schema itself", () => {
    expect(columnDefault("age_visibility")).toBe("private");
    expect(columnDefault("age_visibility")).toBe(DEFAULT_VISIBILITY.childAge);
  });

  it("keeps parent notes private in the schema itself", () => {
    expect(columnDefault("notes_visibility")).toBe("private");
    expect(columnDefault("notes_visibility")).toBe(DEFAULT_VISIBILITY.childNotes);
  });

  it("keeps a curriculum private in the schema itself", () => {
    expect(migration).toMatch(/visibility text not null default 'private'/);
    expect(DEFAULT_VISIBILITY.curriculum).toBe("private");
  });

  it("stores no date of birth anywhere", () => {
    expect(migration.toLowerCase()).not.toContain("date_of_birth");
    expect(migration.toLowerCase()).not.toContain("birth_date");
    expect(migration.toLowerCase()).not.toContain(" dob ");
  });

  /**
   * The absence of a delete policy is what turns "records are archived,
   * never destroyed" from a habit into a guarantee. Same posture as all
   * three siblings.
   */
  it("gives no table a delete policy", () => {
    const rls = readFileSync(
      new URL("../../../supabase/migrations/202608220004_homeschooling_companion_rls.sql", import.meta.url),
      "utf8"
    );
    expect(rls.toLowerCase()).not.toContain("for delete");
  });

  it("proves instance ownership on every insert", () => {
    const rls = readFileSync(
      new URL("../../../supabase/migrations/202608220004_homeschooling_companion_rls.sql", import.meta.url),
      "utf8"
    );
    const inserts = rls.match(/for insert to authenticated/g) ?? [];
    const guarded = rls.match(/public\._hsc_owns_instance\(product_instance_id\)/g) ?? [];
    expect(inserts.length).toBeGreaterThan(0);
    expect(guarded.length).toBe(inserts.length);
  });
});

describe("what reaches the printed record", () => {
  const child: Child = {
    id: "c1",
    name: "Emma",
    age: 9,
    schoolingType: "homeschool",
    notes: "Struggles when tired.",
    nameVisibility: "shareable",
    ageVisibility: "private",
    notesVisibility: "private",
    status: "active",
    createdAt: "2026-08-22T00:00:00Z",
  };

  it("carries the name, so a record says whose it is", () => {
    expect(shareableChildFields(child).name).toBe("Emma");
  });

  it("leaves out everything the parent has not opted in", () => {
    const fields = shareableChildFields(child);
    expect(fields.age).toBeNull();
    expect(fields.notes).toBeNull();
  });

  it("honours a parent who opts something in", () => {
    const opted = { ...child, ageVisibility: "shareable" as const };
    expect(shareableChildFields(opted).age).toBe(9);
  });

  it("honours a parent who opts the name out, even though it is the default", () => {
    const withheld = { ...child, nameVisibility: "private" as const };
    expect(shareableChildFields(withheld).name).toBeNull();
  });
});
