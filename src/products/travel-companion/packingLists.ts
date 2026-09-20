import type { NewPreparationItem } from "./domain/travelData";
import type { Person, PreparationItem } from "./trip";

/**
 * Starter packing lists: a starting point somebody chooses, never a list
 * that appears on its own.
 *
 * WHAT THIS IS, AND IS NOT
 *
 * A packing list is the most searched thing in travel planning and the one
 * thing this product used to leave entirely blank. These lists are plain,
 * ordinary things people pack. They are not advice about what a destination
 * requires: there is nothing here about visas, vaccinations, entry rules or
 * insurance, because a requirement that changed last year must never sit in
 * somebody's trip looking current. That kind of information belongs in the
 * guides, where it can be kept up to date and dated.
 *
 * Deterministic. No model, no lookup, no destination data: the same choice
 * always adds the same items, and every one becomes an ordinary checklist
 * row the person can tick, or remove. Nothing is added until they choose.
 */

export type ListKind = "trip" | "with";

export interface StarterGroup {
  group: string;
  /** Things each traveller packs for themselves. */
  each?: string[];
  /** Things the whole party needs one of. */
  shared?: string[];
}

export interface StarterList {
  id: string;
  kind: ListKind;
  label: string;
  blurb: string;
  /** Who the "each" items are for. "everyone" is every traveller; "children" only those recorded as children. */
  audience: "everyone" | "children";
  groups: StarterGroup[];
}

export const STARTER_LISTS: StarterList[] = [
  {
    id: "essentials",
    kind: "trip",
    label: "The basics",
    blurb: "What almost every trip needs, whatever the weather.",
    audience: "everyone",
    groups: [
      { group: "Documents and money", each: ["Passport or photo ID", "Bank card"], shared: ["Copies of your bookings", "Some cash"] },
      { group: "Phone and power", each: ["Phone and charger"], shared: ["Power adaptor", "Portable battery"] },
      { group: "Clothing", each: ["Underwear", "Socks", "Sleepwear", "Comfortable shoes"] },
      { group: "Toiletries", each: ["Toothbrush and toothpaste", "Any medication you take"], shared: ["Travel-size toiletries", "First aid basics"] },
    ],
  },
  {
    id: "beach",
    kind: "trip",
    label: "Beach",
    blurb: "Sun, sea and not much else.",
    audience: "everyone",
    groups: [
      { group: "Clothing", each: ["Swimwear", "Light cover-up", "Flip-flops", "Sun hat"] },
      { group: "Sun and sea", each: ["Sunglasses", "Beach towel"], shared: ["Sun cream", "After-sun", "Beach bag", "Bag for wet things"] },
    ],
  },
  {
    id: "city",
    label: "City break",
    kind: "trip",
    blurb: "Lots of walking, a bit of everything.",
    audience: "everyone",
    groups: [
      { group: "Clothing", each: ["Light jacket", "One smarter outfit", "Comfortable walking shoes"] },
      { group: "Out and about", each: ["Day bag"], shared: ["Umbrella", "Reusable water bottle"] },
    ],
  },
  {
    id: "cold",
    label: "Cold weather",
    kind: "trip",
    blurb: "Layers, and something waterproof.",
    audience: "everyone",
    groups: [
      { group: "Clothing", each: ["Warm coat", "Hat, gloves and scarf", "Thermal layers", "Warm socks", "Waterproof boots"] },
      { group: "Skin", each: ["Lip balm", "Moisturiser"] },
    ],
  },
  {
    id: "camping",
    label: "Camping",
    kind: "trip",
    blurb: "Everything that is not a hotel room.",
    audience: "everyone",
    groups: [
      { group: "Sleeping", each: ["Sleeping bag", "Sleeping mat", "Pillow"], shared: ["Tent"] },
      { group: "Cooking", shared: ["Stove and fuel", "Cooking pot", "Plates and cutlery", "Matches or lighter", "Water carrier", "Bin bags"] },
      { group: "Clothing", each: ["Rain jacket", "Warm layer", "Torch or headlamp", "Towel"] },
    ],
  },
  {
    id: "road-trip",
    label: "Road trip",
    kind: "trip",
    blurb: "Long drives and short stops.",
    audience: "everyone",
    groups: [
      { group: "Driving", each: ["Driving licence"], shared: ["Phone holder", "Car charger", "Spare change for parking and tolls", "Torch"] },
      { group: "In the car", shared: ["Snacks and water", "Tissues", "Rubbish bag", "Blanket"] },
    ],
  },
  {
    id: "cruise",
    label: "Cruise",
    kind: "trip",
    blurb: "Dressing for dinner, and for ports.",
    audience: "everyone",
    groups: [
      { group: "Clothing", each: ["Swimwear", "One dressier outfit", "Light day bag for ports"] },
      { group: "On board", each: ["Travel sickness tablets, if you use them"], shared: ["Lanyard or card holder"] },
    ],
  },
  {
    id: "business",
    label: "Business trip",
    kind: "trip",
    blurb: "Work clothes and work things.",
    audience: "everyone",
    groups: [
      { group: "Clothing", each: ["Work outfits", "Formal shoes"] },
      { group: "Work", each: ["Laptop and charger", "Notebook and pen", "Business cards"] },
    ],
  },
  {
    id: "carry-on",
    label: "Carry-on only",
    kind: "trip",
    blurb: "One bag, nothing checked.",
    audience: "everyone",
    groups: [
      { group: "Packing light", each: ["Liquids in a clear bag", "Clothes that mix and match", "Only one spare pair of shoes"] },
    ],
  },
  {
    id: "children",
    kind: "with",
    label: "Children",
    blurb: "Added for each child you have recorded.",
    audience: "children",
    groups: [
      { group: "For the journey", each: ["Snacks", "Something to do", "Favourite comfort toy", "Water bottle"] },
      { group: "Clothing", each: ["Spare clothes", "Sun hat"] },
      { group: "Care", each: ["Any medicine they take"], shared: ["Wet wipes", "Car seat or booster, if you need one"] },
    ],
  },
  {
    id: "baby",
    kind: "with",
    label: "A baby",
    blurb: "Added for each child you have recorded.",
    audience: "children",
    groups: [
      { group: "Feeding", each: ["Bottles and feeding supplies", "Muslin cloths"] },
      { group: "Changing", each: ["Nappies", "Wipes", "Nappy cream"], shared: ["Changing mat"] },
      { group: "Sleeping", each: ["Comforter", "Baby sleeping bag or blanket"], shared: ["Pram or buggy", "Baby carrier"] },
    ],
  },
];

export const STARTER_LIST_BY_ID: Record<string, StarterList> = Object.fromEntries(STARTER_LISTS.map((list) => [list.id, list]));

const norm = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * The checklist rows a choice adds, for the people recorded on the trip.
 *
 * "Each" items go to every traveller, or only the children for a list about
 * children, and "shared" items are added once. With nobody recorded the
 * items still go in, once, for nobody in particular, rather than being
 * dropped or invented for a person who does not exist. Nothing already on
 * the list is added twice, and the order is always the lists' own.
 */
export function expandStarterLists(
  listIds: string[],
  travellers: Pick<Person, "id" | "isChild" | "status">[],
  existing: Pick<PreparationItem, "personId" | "title" | "status">[] = [],
): NewPreparationItem[] {
  const people = travellers.filter((person) => person.status === "active");
  const children = people.filter((person) => person.isChild);
  const seen = new Set(existing.filter((item) => item.status === "active").map((item) => `${item.personId ?? ""}|${norm(item.title)}`));
  const out: NewPreparationItem[] = [];

  const add = (listId: string, group: string, title: string, personId: string | null) => {
    const key = `${personId ?? ""}|${norm(title)}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ category: "packing", title, personId, group, starterList: listId });
  };

  for (const id of listIds) {
    const list = STARTER_LIST_BY_ID[id];
    if (!list) continue;
    const owners = list.audience === "children" ? children : people;
    for (const group of list.groups) {
      for (const title of group.each ?? []) {
        if (owners.length === 0) add(list.id, group.group, title, null);
        else for (const owner of owners) add(list.id, group.group, title, owner.id);
      }
      for (const title of group.shared ?? []) add(list.id, group.group, title, null);
    }
  }
  return out;
}

export interface PackingSection {
  /** "shared" or a person's id. */
  key: string;
  heading: string;
  groups: { group: string; items: { id: string; title: string; done: boolean }[] }[];
}

/**
 * The packing rows on a trip, set out for reading: the things shared by
 * everyone first, then each traveller in the order they were recorded, and
 * within each, the headings in the order they first appear. A row somebody
 * typed by hand, with no heading, sits under "Other".
 */
export function packingSections(
  items: Pick<PreparationItem, "id" | "title" | "category" | "status" | "personId" | "group" | "completionStatus">[],
  people: Pick<Person, "id" | "name" | "status">[],
): PackingSection[] {
  const packing = items.filter((item) => item.category === "packing" && item.status === "active");
  const knownIds = new Set(people.filter((person) => person.status === "active").map((person) => person.id));
  const owners: { key: string; heading: string }[] = [
    { key: "shared", heading: "Everyone" },
    ...people.filter((person) => person.status === "active").map((person) => ({ key: person.id, heading: person.name })),
  ];
  return owners
    .map(({ key, heading }) => {
      const mine = packing.filter((item) => (item.personId && knownIds.has(item.personId) ? item.personId : "shared") === key);
      const order: string[] = [];
      for (const item of mine) if (!order.includes(item.group ?? "Other")) order.push(item.group ?? "Other");
      return {
        key,
        heading,
        groups: order.map((group) => ({
          group,
          items: mine
            .filter((item) => (item.group ?? "Other") === group)
            .map((item) => ({ id: item.id, title: item.title, done: item.completionStatus === "done" })),
        })),
      };
    })
    .filter((section) => section.groups.length > 0);
}
