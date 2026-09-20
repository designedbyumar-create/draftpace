import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import HomeView, { type HomeViewProps } from "./HomeView";
import type { AttentionItem, HomeState } from "../attention";
import type { HomeItem } from "../state";

const attention = (kind: AttentionItem["kind"], id: string, title: string, detail: string): AttentionItem => ({
  id: `${kind}:${id}`,
  kind,
  urgency: "soon",
  entityId: id,
  title,
  detail,
  href: null,
});

const home = (over: Partial<HomeState> = {}): HomeState => ({
  somethingWrong: [],
  worthTakingCareOf: [],
  comingUp: [],
  recentlyHandled: [],
  restUnderControl: 0,
  nothingTracked: false,
  ...over,
});

const thing = (id: string, name: string): HomeItem =>
  ({ id, name, type: "furnace", brand: "Acme", location: "Basement", status: "active" }) as unknown as HomeItem;

function render(state: HomeState, over: Partial<HomeViewProps> = {}) {
  return renderToStaticMarkup(
    <HomeView
      home={state}
      headline="Something needs a look"
      headlineSize="text-[30px]"
      gap="gap-8"
      care={state.worthTakingCareOf}
      hiddenCare={0}
      closingLine={null}
      activeItems={[thing("1", "Furnace")]}
      justHandledId={null}
      tour={{ steps: [] }}
      actionsFor={(item, tone) => <button>{tone === "warning" ? "Take a look" : `Action ${item.title}`}</button>}
      onOpenCare={() => undefined}
      onShowAllCare={() => {}}
      onReport={() => {}}
      onAdd={() => {}}
      addRef={{ current: null }}
      bandLimit={4}
      {...over}
    />
  );
}

const busy = home({
  somethingWrong: [attention("problem", "p1", "Garage door", "Grinding when it closes.")],
  worthTakingCareOf: [
    attention("maintenanceDue", "t1", "Flush the water heater", "Last done 14 months ago, usually every 12 months."),
    attention("maintenanceDue", "t2", "Test the smoke detectors", "Last done 5 months ago, usually every 6 months."),
  ],
  comingUp: [{ id: "c1", title: "Clean the gutters", detail: "Due in November", href: null }],
  recentlyHandled: [{ id: "h1", title: "Replaced the tap washer", when: "3 days ago" }],
  restUnderControl: 6,
});

describe("The Home Line", () => {
  it("never puts a number on the state strip: the product says a couple or several, never a count", () => {
    const html = render(busy);
    const strip = html.match(/<nav aria-label="Jump to a part of your home"[\s\S]*?<\/nav>/)?.[0] ?? "";
    expect(strip).not.toBe("");
    const text = strip.replace(/<[^>]+>/g, " ").replace(/&#?\w+;/g, " ");
    expect(text).not.toMatch(/\d/);
  });

  it("lights only the parts of the home that have something to say", () => {
    const html = render(home({ comingUp: busy.comingUp, recentlyHandled: busy.recentlyHandled }));
    expect(html).toContain('href="#band-coming"');
    expect(html).toContain('href="#band-handled"');
    expect(html).not.toContain('href="#band-wrong"');
    expect(html).not.toContain('href="#band-care"');
  });

  it("gives every strip link a section to land on", () => {
    const html = render(busy);
    for (const [, id] of html.matchAll(/href="#(band-[a-z]+)"/g)) {
      expect(html, `no section with id ${id}`).toContain(`id="${id}"`);
    }
  });

  it("marks a problem as needing a look and gives it its own actions", () => {
    const html = render(busy);
    expect(html).toContain("Needs a look");
    expect(html).toContain("Take a look");
    expect(html).toContain("Garage door");
  });

  it("states the fact behind every care row and offers its actions", () => {
    const html = render(busy);
    expect(html).toContain("Last done 14 months ago, usually every 12 months.");
    expect(html).toContain("Action Flush the water heater");
    expect(html).toContain("Action Test the smoke detectors");
  });

  it("says how many care rows are held back, in the product's own words", () => {
    expect(render(busy, { hiddenCare: 1 })).toContain("1 more, when you get to it");
    expect(render(busy, { hiddenCare: 3 })).toContain("3 more, when you get to them");
    expect(render(busy, { hiddenCare: 0 })).not.toContain("when you get to");
  });

  it("renders the closing line only when there is something true to say", () => {
    expect(render(busy, { closingLine: "Everything else is under control." })).toContain("Everything else is under control.");
    expect(render(busy, { closingLine: null })).not.toContain("under control");
  });

  it("lists what is in the home and always offers a way to add", () => {
    const html = render(busy);
    expect(html).toContain("In your home");
    expect(html).toContain("Furnace");
    expect(html).toContain("Add something");
  });

  it("says so when nothing is recorded", () => {
    expect(render(busy, { activeItems: [] })).toContain("Nothing in your home yet.");
  });

  // Tailwind 3 silently drops `/NN` on a var() colour.
  it("never puts an /opacity on a var() colour", () => {
    const source = readFileSync(join(__dirname, "HomeView.tsx"), "utf8");
    expect([...source.matchAll(/\[var\(--[a-z0-9-]+\)\]\/\d+/gi)].map((m) => m[0])).toEqual([]);
  });
});
