import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { checkDocuments, formatDate, SHORTLY_AFTER_DAYS } from "./documentChecks";

const TRIP = { startsAt: "2026-10-12", endsAt: "2026-10-20" };
const doc = (id: string, expiresOn: string | null, over: Record<string, unknown> = {}) => ({
  id,
  label: `Passport ${id}`,
  personId: null as string | null,
  expiresOn,
  status: "active" as const,
  ...over,
});
const PEOPLE = [{ id: "amir", name: "Amir" }];
const check = (documents: ReturnType<typeof doc>[], trip = TRIP) => checkDocuments({ documents, people: PEOPLE, trip });

describe("where an expiry falls against the trip", () => {
  it("says so when it is before the trip starts, during it, or shortly after it ends, and nothing otherwise", () => {
    const result = check([
      doc("before", "2026-10-01"),
      doc("during", "2026-10-15"),
      doc("after", "2026-12-01"),
      doc("far", "2030-01-01"),
      doc("none", null),
    ]);
    expect(result.map((entry) => [entry.documentId, entry.flag])).toEqual([
      ["before", "before-trip"],
      ["during", "during-trip"],
      ["after", "shortly-after"],
    ]);
  });

  it("treats the first and last day of the trip as during it, and the day before as before", () => {
    expect(check([doc("a", "2026-10-12")])[0].flag).toBe("during-trip");
    expect(check([doc("b", "2026-10-20")])[0].flag).toBe("during-trip");
    expect(check([doc("c", "2026-10-11")])[0].flag).toBe("before-trip");
    expect(check([doc("d", "2026-10-21")])[0].flag).toBe("shortly-after");
  });

  it("stops mentioning it once it is comfortably past the trip", () => {
    const edge = new Date(Date.parse("2026-10-20T00:00:00Z") + SHORTLY_AFTER_DAYS * 86_400_000).toISOString().slice(0, 10);
    const past = new Date(Date.parse("2026-10-20T00:00:00Z") + (SHORTLY_AFTER_DAYS + 1) * 86_400_000).toISOString().slice(0, 10);
    expect(check([doc("edge", edge)])).toHaveLength(1);
    expect(check([doc("past", past)])).toHaveLength(0);
  });

  it("uses the one date there is when the trip has only a start or only an end, and says nothing with no dates at all", () => {
    expect(checkDocuments({ documents: [doc("a", "2026-10-01")], people: PEOPLE, trip: { startsAt: "2026-10-12", endsAt: null } })).toHaveLength(1);
    expect(checkDocuments({ documents: [doc("a", "2026-10-01")], people: PEOPLE, trip: { startsAt: null, endsAt: "2026-10-20" } })).toHaveLength(1);
    expect(checkDocuments({ documents: [doc("a", "2026-10-01")], people: PEOPLE, trip: { startsAt: null, endsAt: null } })).toEqual([]);
  });

  it("ignores an archived entry and names whose it is", () => {
    expect(check([doc("gone", "2026-10-01", { status: "archived" })])).toEqual([]);
    expect(check([doc("mine", "2026-10-01", { personId: "amir" })])[0].personName).toBe("Amir");
    expect(check([doc("nobody", "2026-10-01")])[0].personName).toBeNull();
  });

  it("puts what is before the trip first, then during, then after, and the earliest date first within each", () => {
    const result = check([doc("z", "2026-12-01"), doc("y", "2026-10-15"), doc("x", "2026-10-05"), doc("w", "2026-09-01")]);
    expect(result.map((entry) => entry.documentId)).toEqual(["w", "x", "y", "z"]);
  });
});

describe("what it says", () => {
  it("states each date in plain words, and how long after the trip in days, weeks or months", () => {
    expect(check([doc("a", "2026-10-01")])[0].line).toBe("Expires 1 October 2026, before the trip starts.");
    expect(check([doc("b", "2026-10-15")])[0].line).toBe("Expires 15 October 2026, during the trip.");
    expect(check([doc("c", "2026-10-25")])[0].line).toBe("Expires 25 October 2026, 5 days after the trip ends.");
    expect(check([doc("d", "2026-11-17")])[0].line).toBe("Expires 17 November 2026, 4 weeks after the trip ends.");
    expect(check([doc("e", "2027-03-01")])[0].line).toBe("Expires 1 March 2027, 4 months after the trip ends.");
    expect(formatDate("2027-03-05")).toBe("5 March 2027");
  });

  it("never says what any country requires, and never sounds urgent", () => {
    const lines = check([doc("a", "2026-10-01"), doc("b", "2026-10-15"), doc("c", "2026-12-01")]).map((entry) => entry.line);
    for (const line of lines) {
      expect(line).not.toMatch(/must|require|need|valid for|six months|too late|urgent|expired|overdue|renew|deadline|reject|refus|denied/i);
    }
    const source = readFileSync(join(__dirname, "documentChecks.ts"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(source).not.toMatch(/six months|6 months|\brequire/i);
  });
});

describe("how it is stored", () => {
  const migration = readFileSync(join(process.cwd(), "supabase/migrations/202609200003_travel_companion_document_expiry.sql"), "utf8");
  const domain = readFileSync(join(__dirname, "domain/travelData.ts"), "utf8");

  it("is one additive column, nothing dropped, and no file is stored", () => {
    expect(migration).toContain("add column if not exists expires_on date");
    expect(migration).not.toMatch(/drop |delete from|truncate|bytea|storage/i);
  });

  it("is set or cleared by an update, never by deleting the entry", () => {
    const setter = domain.slice(domain.indexOf("export async function setDocumentExpiry"));
    expect(setter).toContain(".update(");
    expect(domain).not.toMatch(/\.delete\(/);
  });
});
