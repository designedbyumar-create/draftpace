import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import PackingView from "./PackingView";
import PackingStarter from "./PackingStarter";
import { packingSections } from "../packingLists";
import type { Person, PreparationItem } from "../trip";

const item = (over: Partial<PreparationItem>): PreparationItem =>
  ({
    id: "i",
    tripId: "t",
    category: "packing",
    title: "Swimwear",
    completionStatus: "open",
    notes: null,
    status: "active",
    personId: "amir",
    group: "Clothing",
    starterList: "beach",
    ...over,
  }) as PreparationItem;

const person = (over: Partial<Person>): Person =>
  ({ id: "amir", tripId: "t", name: "Amir", isChild: false, relationshipNote: null, requirements: null, status: "active", ...over }) as Person;

const PEOPLE = [person({}), person({ id: "noor", name: "Noor", isChild: true })];
const ITEMS = [
  item({ id: "1", title: "Swimwear", personId: "amir" }),
  item({ id: "2", title: "Sun cream", personId: null, group: "Sun and sea" }),
  item({ id: "3", title: "Sun hat", personId: "noor" }),
  item({ id: "4", title: "Charger", personId: "amir", group: null, starterList: null }),
  item({ id: "5", title: "Passport", category: "documents", personId: "amir" }),
  item({ id: "6", title: "Old thing", status: "archived" }),
];

const visible = (html: string) => html.replace(/<[^>]*>/g, " ").toLowerCase();
const source = (name: string) => readFileSync(join(__dirname, name), "utf8");

describe("the packing list, set out", () => {
  const sections = packingSections(ITEMS, PEOPLE);

  it("puts what is shared first, then each traveller in the order recorded", () => {
    expect(sections.map((section) => section.heading)).toEqual(["Everyone", "Amir", "Noor"]);
  });

  it("groups under headings in the order they first appear, and puts a hand-typed item with no heading under Other", () => {
    const amir = sections.find((section) => section.key === "amir")!;
    expect(amir.groups.map((group) => group.group)).toEqual(["Clothing", "Other"]);
    expect(amir.groups[1].items.map((entry) => entry.title)).toEqual(["Charger"]);
  });

  it("leaves out anything removed and anything that is not packing", () => {
    const titles = sections.flatMap((section) => section.groups.flatMap((group) => group.items.map((entry) => entry.title)));
    expect(titles).not.toContain("Old thing");
    expect(titles).not.toContain("Passport");
  });

  it("gives an item for a traveller who is no longer on the trip to Everyone, rather than losing it", () => {
    const gone = packingSections([item({ personId: "ghost", title: "Sunglasses" })], PEOPLE);
    expect(gone[0].heading).toBe("Everyone");
    expect(gone[0].groups[0].items[0].title).toBe("Sunglasses");
  });
});

describe("the list view", () => {
  const html = renderToStaticMarkup(
    <PackingView sections={packingSections(ITEMS, PEOPLE)} onToggle={() => {}} onRemove={() => {}} actions={<button type="button">Save as PDF</button>} />,
  );

  it("shows a checkbox and a way to remove each item, and a section per traveller", () => {
    expect(html.match(/type="checkbox"/g)).toHaveLength(4);
    expect(html).toContain('aria-label="Remove Swimwear"');
    expect(html).toContain('aria-label="Packing for Noor"');
    expect(html).toContain("Save as PDF");
  });

  it("marks a ticked item as ticked, and counts nothing, scores nothing, and never nags", () => {
    const ticked = renderToStaticMarkup(
      <PackingView
        sections={packingSections([item({ completionStatus: "done" })], PEOPLE)}
        onToggle={() => {}}
        onRemove={() => {}}
        actions={null}
      />,
    );
    expect(ticked).toContain("checked");
    expect(visible(html)).not.toMatch(/\d+ of \d+|remaining|left to pack|% |overdue|don't forget|streak/);
  });
});

describe("starting a list", () => {
  const html = (people: Person[], existing: PreparationItem[] = []) =>
    renderToStaticMarkup(
      <PackingStarter instanceId="x" tripId="t" people={people} existing={existing} onAdded={() => {}} onCancel={() => {}} />,
    );

  it("says nothing is added until the button is pressed, and that any of it can be changed", () => {
    const out = html(PEOPLE);
    expect(out).toContain("Nothing is added until you press the button");
    expect(out).toContain("remove or");
  });

  it("says who the items are for, and how many will be added, before adding anything", () => {
    const out = html(PEOPLE);
    expect(out).toContain("For Amir, Noor (child).");
    expect(out).toMatch(/Add \d+ items to my list/);
  });

  it("starts with only the basics chosen, so no other list appears unasked", () => {
    const out = html(PEOPLE);
    expect(out.match(/checked=""/g)).toHaveLength(1);
  });

  it("says so plainly when there is nobody to give the items to, and when there is nothing new to add", () => {
    expect(html([])).toContain("For nobody in particular");
    const all = packingSections([], []);
    expect(all).toEqual([]);
  });

  it("offers every kind of trip and both ways of travelling with little ones", () => {
    const out = html(PEOPLE);
    for (const label of ["The basics", "Beach", "City break", "Cold weather", "Camping", "Road trip", "Cruise", "Business trip", "Carry-on only", "Children", "A baby"]) {
      expect(out, label).toContain(label);
    }
  });
});

describe("where it is wired", () => {
  it("the Trip screen offers to start a list, shows it, removes by archiving, and prints it", () => {
    const trip = source("TripModule.tsx");
    expect(trip).toContain("<PackingStarter");
    expect(trip).toContain("<PackingView");
    expect(trip).toContain("archivePreparationItem");
    expect(trip).toContain("downloadPackingList");
    expect(trip).toContain("Start a packing list");
  });

  it("never spends the accent on a card or a heading: it belongs to the buttons and the ticks", () => {
    for (const file of ["PackingView.tsx", "PackingStarter.tsx"]) {
      expect(source(file), file).not.toMatch(/(?:bg|text|border|ring)-\[var\(--primary(?:-[a-z]+)?\)\]/);
    }
  });

  it("never puts an /opacity on a var() colour, which Tailwind 3 silently drops", () => {
    for (const file of ["PackingView.tsx", "PackingStarter.tsx"]) {
      expect([...source(file).matchAll(/\[var\(--[a-z0-9-]+\)\]\/\d+/gi)].map((m) => m[0]), file).toEqual([]);
    }
  });
});
