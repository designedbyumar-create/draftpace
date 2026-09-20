import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import DocumentChecks from "./DocumentChecks";
import { checkDocuments } from "../documentChecks";

const checks = checkDocuments({
  documents: [
    { id: "a", label: "Passport", personId: "amir", expiresOn: "2026-10-01", status: "active" },
    { id: "b", label: "Travel visa", personId: null, expiresOn: "2026-10-15", status: "active" },
  ],
  people: [{ id: "amir", name: "Amir" }],
  trip: { startsAt: "2026-10-12", endsAt: "2026-10-20" },
});
const visible = (html: string) => html.replace(/<[^>]*>/g, " ");
const source = (name: string) => readFileSync(join(__dirname, name), "utf8");

describe("dates worth a look", () => {
  const html = renderToStaticMarkup(<DocumentChecks checks={checks} />);

  it("names whose document it is and states the date against the trip", () => {
    expect(html).toContain("Dates worth a look");
    expect(html).toContain("Amir: Passport.");
    expect(html).toContain("Expires 1 October 2026, before the trip starts.");
    expect(html).toContain("Expires 15 October 2026, during the trip.");
  });

  it("says it only compares dates, that what a country asks for differs and changes, and points at the guide", () => {
    expect(html).toContain("This only compares the dates you recorded");
    expect(html).toContain("differs and changes");
    expect(html).toContain("/guides/travel-document-checklist");
  });

  it("does not repeat a name the label already carries", () => {
    const out = renderToStaticMarkup(
      <DocumentChecks
        checks={checkDocuments({
          documents: [{ id: "a", label: "Amir's passport", personId: "amir", expiresOn: "2026-10-01", status: "active" }],
          people: [{ id: "amir", name: "Amir" }],
          trip: { startsAt: "2026-10-12", endsAt: "2026-10-20" },
        })}
      />,
    );
    expect(visible(out)).not.toContain("Amir: Amir");
    expect(visible(out)).toContain("Amir&#x27;s passport");
  });

  it("renders nothing at all when there is nothing to say, so no empty heading appears", () => {
    expect(renderToStaticMarkup(<DocumentChecks checks={[]} />)).toBe("");
  });

  it("does not sound like an alarm, and states no requirement", () => {
    expect(visible(html)).not.toMatch(/urgent|expired|overdue|must|required|refus|denied|warning|danger/i);
  });
});

describe("where it is wired", () => {
  it("the Trip screen shows the panel, an expiry editor per document, and the form takes an optional date", () => {
    const trip = source("TripModule.tsx");
    expect(trip).toContain("<DocumentChecks");
    expect(trip).toContain("<DocumentExpiry");
    expect(trip).toContain("checkDocuments(");
    expect(source("DocumentForm.tsx")).toContain('label="Expires (optional)"');
  });

  it("never spends the accent on a card, and never puts an /opacity on a var() colour", () => {
    for (const file of ["DocumentChecks.tsx", "DocumentExpiry.tsx"]) {
      expect(source(file), file).not.toMatch(/(?:bg|text|border|ring)-\[var\(--primary(?:-[a-z]+)?\)\]/);
      expect([...source(file).matchAll(/\[var\(--[a-z0-9-]+\)\]\/\d+/gi)].map((m) => m[0]), file).toEqual([]);
    }
  });
});
