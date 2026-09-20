import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import SeasonsView from "./SeasonsView";
import type { SeasonJob, SeasonSummary } from "../seasons";

const job = (over: Partial<SeasonJob> & { taskId: string; title: string }): SeasonJob => ({
  about: "Furnace, Basement",
  monthLabel: "October",
  monthKey: "2026-10",
  dueIso: "2026-10-01",
  dueNow: false,
  ...over,
});

const seasons: SeasonSummary[] = [
  { id: "spring", label: "Spring", span: "March to May", jobs: [] },
  { id: "summer", label: "Summer", span: "June to August", jobs: [] },
  {
    id: "autumn",
    label: "Autumn",
    span: "September to November",
    jobs: [
      job({ taskId: "a", title: "Annual service", monthLabel: "September", monthKey: "2026-09", dueNow: true }),
      job({ taskId: "b", title: "Bleed the radiators" }),
      job({ taskId: "c", title: "Clean the gutters", monthLabel: "November", monthKey: "2026-11", dueIso: "2026-11-01" }),
    ],
  },
  { id: "winter", label: "Winter", span: "December to February", jobs: [] },
];

function render(selectedId: "spring" | "autumn" = "autumn", currentId: "autumn" | "spring" = "autumn") {
  return renderToStaticMarkup(
    <SeasonsView seasons={seasons} currentId={currentId} selectedId={selectedId} onSelect={() => {}} onRecord={() => {}} />
  );
}

describe("Seasons view", () => {
  it("is titled the way people search for it, and says which months it covers", () => {
    const html = render();
    expect(html).toContain("Autumn home maintenance checklist");
    expect(html).toContain("This season");
    expect(html).toContain("September to November");
  });

  it("talks about a season that is not here yet as one to look ahead to", () => {
    const html = render("spring");
    expect(html).toContain("Spring home maintenance checklist");
    expect(html).toContain("Looking ahead");
    expect(html).not.toContain("This season");
  });

  it("offers all four seasons and marks the current one", () => {
    const html = render();
    for (const label of ["Spring", "Summer", "Autumn", "Winter"]) expect(html).toContain(label);
    expect(html.match(/aria-label="now"/g)).toHaveLength(1);
    expect(html).toContain('aria-selected="true"');
  });

  it("groups jobs under their months, in order, and gives each a way to record it", () => {
    const html = render();
    const at = (month: string) => html.indexOf(`<section aria-label="${month}"`);
    expect(at("September")).toBeGreaterThan(-1);
    expect(at("September")).toBeLessThan(at("October"));
    expect(at("October")).toBeLessThan(at("November"));
    for (const title of ["Annual service", "Bleed the radiators", "Clean the gutters"]) {
      expect(html).toContain(`aria-label="Record ${title}"`);
    }
  });

  it("marks only a job whose month has come as due now", () => {
    const html = render();
    expect(html.match(/Due now/g)).toHaveLength(1);
  });

  it("says so, and how it fills up, when a season has nothing in it", () => {
    const html = render("spring");
    expect(html).toContain("Nothing in your home is tied to this season yet.");
  });

  // Tailwind 3 silently drops `/NN` on a var() colour.
  it("never puts an /opacity on a var() colour", () => {
    const source = readFileSync(join(__dirname, "SeasonsView.tsx"), "utf8");
    expect([...source.matchAll(/\[var\(--[a-z0-9-]+\)\]\/\d+/gi)].map((m) => m[0])).toEqual([]);
  });
});
