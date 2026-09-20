import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expandStarterLists, STARTER_LISTS, STARTER_LIST_BY_ID } from "./packingLists";

const person = (id: string, isChild = false, status: "active" | "archived" = "active") => ({ id, isChild, status });
const ADULTS = [person("amir"), person("sara")];
const FAMILY = [person("amir"), person("sara"), person("noor", true)];

const allTitles = STARTER_LISTS.flatMap((list) =>
  list.groups.flatMap((group) => [...(group.each ?? []), ...(group.shared ?? [])].map((title) => ({ list: list.id, title }))),
);

describe("the starter lists", () => {
  it("have unique ids, real content, and a heading on every group", () => {
    expect(new Set(STARTER_LISTS.map((list) => list.id)).size).toBe(STARTER_LISTS.length);
    for (const list of STARTER_LISTS) {
      expect(list.groups.length, list.id).toBeGreaterThan(0);
      for (const group of list.groups) {
        expect(group.group.trim(), `${list.id} has a group with no heading`).not.toBe("");
        expect((group.each?.length ?? 0) + (group.shared?.length ?? 0), `${list.id}/${group.group} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it("never repeat an item inside one list, so a choice cannot add the same thing twice", () => {
    for (const list of STARTER_LISTS) {
      const titles = allTitles.filter((entry) => entry.list === list.id).map((entry) => entry.title.toLowerCase());
      expect(new Set(titles).size, `${list.id} repeats an item`).toBe(titles.length);
    }
  });

  it("say only what people pack: nothing about visas, vaccinations, entry rules, insurance or what a country requires", () => {
    for (const { list, title } of allTitles) {
      expect(title, `${list}: "${title}"`).not.toMatch(/visa|vaccin|immunis|requirement|regulation|customs|insurance|entry|permit/i);
    }
    for (const list of STARTER_LISTS) {
      expect(`${list.label} ${list.blurb}`, list.id).not.toMatch(/visa|vaccin|requirement|regulation|insurance|permit/i);
    }
  });

  it("keep the product's voice: no urgency, no scoring, no dashes, no calm", () => {
    for (const { title } of allTitles) {
      expect(title).not.toMatch(/don't forget|must|essential|urgent|overdue|—|\bcalm\b/i);
      expect(title.length).toBeLessThan(60);
    }
    for (const list of STARTER_LISTS) expect(`${list.label} ${list.blurb}`).not.toMatch(/—|\bcalm\b|overdue|must/i);
  });

  it("offer the trip kinds people actually search for, and the two ways of travelling with little ones", () => {
    for (const id of ["beach", "city", "cold", "camping", "road-trip", "cruise", "business", "carry-on", "children", "baby"]) {
      expect(STARTER_LIST_BY_ID[id], id).toBeDefined();
    }
    expect(STARTER_LIST_BY_ID.children.audience).toBe("children");
    expect(STARTER_LIST_BY_ID.baby.audience).toBe("children");
    expect(STARTER_LIST_BY_ID.beach.audience).toBe("everyone");
  });
});

describe("what a choice adds", () => {
  it("gives every traveller their own items and adds shared ones once", () => {
    const rows = expandStarterLists(["beach"], ADULTS);
    expect(rows.filter((row) => row.title === "Swimwear").map((row) => row.personId).sort()).toEqual(["amir", "sara"]);
    expect(rows.filter((row) => row.title === "Sun cream")).toHaveLength(1);
    expect(rows.find((row) => row.title === "Sun cream")?.personId).toBeNull();
  });

  it("adds a list about children only for the children recorded", () => {
    const rows = expandStarterLists(["children"], FAMILY);
    const owners = new Set(rows.filter((row) => row.title === "Spare clothes").map((row) => row.personId));
    expect(owners).toEqual(new Set(["noor"]));
    expect(rows.filter((row) => row.title === "Wet wipes")).toHaveLength(1);
  });

  it("still adds each item, once, for nobody in particular when no traveller is recorded, rather than dropping or inventing one", () => {
    const rows = expandStarterLists(["beach"], []);
    expect(rows.filter((row) => row.title === "Swimwear")).toHaveLength(1);
    expect(rows.find((row) => row.title === "Swimwear")?.personId).toBeNull();
    expect(expandStarterLists(["children"], ADULTS).find((row) => row.title === "Spare clothes")?.personId).toBeNull();
  });

  it("ignores an archived traveller", () => {
    const rows = expandStarterLists(["beach"], [person("amir"), person("gone", false, "archived")]);
    expect(rows.some((row) => row.personId === "gone")).toBe(false);
  });

  it("never adds something already on the list, or the same thing twice when two lists overlap", () => {
    const first = expandStarterLists(["essentials", "city"], ADULTS);
    const keys = first.map((row) => `${row.personId}|${row.title.toLowerCase()}`);
    expect(new Set(keys).size).toBe(keys.length);
    const again = expandStarterLists(
      ["essentials"],
      ADULTS,
      first.map((row) => ({ personId: row.personId ?? null, title: row.title, status: "active" as const })),
    );
    expect(again).toEqual([]);
  });

  it("adds an item again if the person had removed it", () => {
    const rows = expandStarterLists(["beach"], [person("amir")], [{ personId: "amir", title: "Swimwear", status: "archived" }]);
    expect(rows.some((row) => row.personId === "amir" && row.title === "Swimwear")).toBe(true);
  });

  it("marks every row as packing, records where it came from and which heading it sits under, in the lists' own order", () => {
    const rows = expandStarterLists(["cold"], [person("amir")]);
    expect(rows.every((row) => row.category === "packing" && row.starterList === "cold")).toBe(true);
    expect(rows.map((row) => row.group)).toEqual(["Clothing", "Clothing", "Clothing", "Clothing", "Clothing", "Skin", "Skin"]);
    expect(rows[0].title).toBe("Warm coat");
  });

  it("does nothing for a list that does not exist", () => {
    expect(expandStarterLists(["nope"], ADULTS)).toEqual([]);
  });
});

describe("how it is stored", () => {
  const migration = readFileSync(join(process.cwd(), "supabase/migrations/202609200002_travel_companion_packing.sql"), "utf8");
  const domain = readFileSync(join(__dirname, "domain/travelData.ts"), "utf8");

  it("is additive: three new columns on trv_preparation, and nothing dropped or deleted", () => {
    for (const column of ["person_id", "list_group", "starter_list"]) expect(migration).toContain(`add column if not exists ${column}`);
    expect(migration).not.toMatch(/drop (table|column|policy)|delete from|truncate/i);
  });

  it("removes an item by archiving it, never by deleting it", () => {
    const archive = domain.slice(domain.indexOf("export async function archivePreparationItem"));
    expect(archive).toContain('status: "archived"');
    expect(domain).not.toMatch(/\.delete\(/);
  });
});
