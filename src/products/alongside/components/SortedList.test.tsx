import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import SortedList from "./SortedList";
import type { LifeItem } from "../life";

const NOW = new Date("2026-08-23T10:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

const item = (over: Partial<LifeItem>): LifeItem =>
  ({
    id: "x",
    kind: "commitment",
    title: "Call the clinic",
    note: null,
    status: "done",
    nextAt: null,
    everyMonths: null,
    waitingOn: null,
    lastTouchedAt: daysAgo(3),
    leftOffNote: null,
    nextStep: null,
    ...over,
  }) as unknown as LifeItem;

const html = (items: LifeItem[]) => renderToStaticMarkup(<SortedList items={items} now={NOW} />);

describe("the Sorted list", () => {
  it("renders nothing when nothing is sorted, so an empty box never appears", () => {
    expect(html([])).toBe("");
    expect(html([item({ status: "open" }), item({ id: "y", status: "archived" })])).toBe("");
  });

  it("lists only sorted items, newest first, each reachable", () => {
    const out = html([
      item({ id: "old", title: "Renew passport", lastTouchedAt: daysAgo(40) }),
      item({ id: "open", title: "Still open thing", status: "open" }),
      item({ id: "new", title: "Rebook the dentist", lastTouchedAt: daysAgo(1) }),
    ]);
    expect(out).not.toContain("Still open thing");
    expect(out.indexOf("Rebook the dentist")).toBeLessThan(out.indexOf("Renew passport"));
    expect(out).toContain("/app/products/alongside/item/new");
    expect(out).toContain("Sorted yesterday");
    expect(out).toContain("Sorted about 6 weeks ago");
  });

  it("is collapsed by default and carries no count", () => {
    const out = html([item({ id: "a" }), item({ id: "b" }), item({ id: "c" })]);
    expect(out).toContain("<details");
    expect(out).not.toMatch(/<details[^>]*\sopen/);
    const summary = out.match(/<summary[\s\S]*?<\/summary>/)![0];
    expect(summary.replace(/<[^>]*>/g, "")).not.toMatch(/\d/);
  });

  it("never uses shaming language", () => {
    expect(html([item({})]).toLowerCase()).not.toMatch(/overdue|late|missed|streak|completed/);
  });

  it("is mounted in Life, or closed items are unreachable again", () => {
    const life = readFileSync(join(__dirname, "LifeModule.tsx"), "utf8");
    expect(life).toContain("<SortedList");
  });
});
