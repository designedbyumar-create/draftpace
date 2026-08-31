import { describe, expect, it } from "vitest";
import {
  getHomeschoolStateRequirement,
  HOMESCHOOL_LEVEL_DESCRIPTION,
  HOMESCHOOL_STATE_NAMES,
  HOMESCHOOL_STATE_REQUIREMENTS,
  type HomeschoolRegulationLevel,
} from "./homeschoolStateRequirements";

/**
 * This array is now the single source of truth for two consumers: the
 * public guide's state-by-state table (src/content/guides.ts) and
 * Homeschooling Companion's household state picker. Both are proven
 * elsewhere to derive from it rather than carry their own copy
 * (guides.test.ts's "covers every US jurisdiction" test, and the
 * product's picker reading HOMESCHOOL_STATE_NAMES directly); this file
 * is what proves the source itself is complete and internally
 * consistent.
 */

const US_JURISDICTIONS = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
  "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

const LEVELS: HomeschoolRegulationLevel[] = ["None", "Low", "Moderate", "High"];

describe("HOMESCHOOL_STATE_REQUIREMENTS", () => {
  it("covers all 50 states plus DC, no more and no fewer", () => {
    const names = HOMESCHOOL_STATE_REQUIREMENTS.map((entry) => entry.state).sort();
    expect(names).toEqual([...US_JURISDICTIONS].sort());
  });

  it("has no duplicate state", () => {
    const names = HOMESCHOOL_STATE_REQUIREMENTS.map((entry) => entry.state);
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives every entry a real note and a valid level", () => {
    for (const entry of HOMESCHOOL_STATE_REQUIREMENTS) {
      expect(entry.note.length, entry.state).toBeGreaterThan(0);
      expect(LEVELS, entry.state).toContain(entry.level);
    }
  });

  it("uses American spelling throughout, since this product is US-first", () => {
    const text = HOMESCHOOL_STATE_REQUIREMENTS.map((entry) => entry.note).join(" ");
    expect(text).not.toMatch(/immunisation|enrolment/i);
  });
});

describe("getHomeschoolStateRequirement", () => {
  it("finds a real state case-insensitively", () => {
    expect(getHomeschoolStateRequirement("texas")?.level).toBe("None");
    expect(getHomeschoolStateRequirement("PENNSYLVANIA")?.level).toBe("High");
  });

  it("returns undefined for anything that isn't one of the 51", () => {
    expect(getHomeschoolStateRequirement("Puerto Rico")).toBeUndefined();
    expect(getHomeschoolStateRequirement("")).toBeUndefined();
  });
});

describe("HOMESCHOOL_STATE_NAMES", () => {
  it("has one name per requirement entry, in the same order", () => {
    expect(HOMESCHOOL_STATE_NAMES).toEqual(HOMESCHOOL_STATE_REQUIREMENTS.map((entry) => entry.state));
  });
});

describe("HOMESCHOOL_LEVEL_DESCRIPTION", () => {
  it("has a real description for every level the data actually uses", () => {
    for (const level of LEVELS) {
      expect(HOMESCHOOL_LEVEL_DESCRIPTION[level].length).toBeGreaterThan(0);
    }
  });
});
