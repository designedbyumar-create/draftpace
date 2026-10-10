/**
 * Which spot illustration (src/visual/illustrations.tsx) a carousel slide
 * gets: the one whose subject the slide's own words name. A slide about
 * calling the airline gets the phone; one about the bills due before payday
 * gets the calendar. A slide that names nothing drawable gets its
 * carousel's topic (the moment and its guide), and no two slides in a row
 * get the same picture.
 */

/**
 * Each illustration and the words that call for it: whole words (plurals and -ed/-ing count), or a stem where
 * it ends in "*". A word ending in "~" is an everyday one ("ask", "write", "time") and counts for less, so a
 * slide's specific words ("flight", "medication") decide before its ordinary ones.
 */
export const MOTIF_WORDS: Record<string, string[]> = {
  phone: ["phone", "call", "dial", "voicemail", "ring", "airline app", "text"],
  speech: ["say~", "said", "sentence", "talk", "conversation", "tell~", "script", "words~", "ask~", "question~", "speak", "explain~"],
  checklist: ["checklist", "tick", "list~", "items", "check-in"],
  calendar: ["date", "day~", "week", "month", "monday", "sunday", "deadline", "due", "today~", "tomorrow", "year", "schedule", "january", "february", "march", "april", "june", "july", "august", "september", "october", "november", "december", "season", "annual", "renewal"],
  clock: ["minute", "hour", "time~", "late", "delay", "timing", "interval", "quick", "wait~"],
  notebook: ["write~", "note~", "page~", "paper", "log", "journal", "line~", "record", "jot", "draft"],
  envelope: ["email", "mail", "inbox", "message"],
  document: ["form", "document", "certificate", "paperwork", "will", "copy~", "copies", "proof", "license", "registration", "estimate", "contract", "deed", "intent", "requirement", "law", "state~"],
  binder: ["binder", "folder", "tab", "file", "portfolio", "section", "divider", "organi*", "sheet protector", "one place"],
  receipt: ["receipt", "statement", "invoice", "transaction", "charge", "csv", "spending", "groceries"],
  wallet: ["money", "spend", "cash", "budget", "paycheck", "pay~", "income", "take-home", "salary", "cost~", "afford", "price", "$"],
  card: ["card", "credit", "debit", "subscription", "minimum payment"],
  bank: ["bank", "account", "balance", "pension", "401*", "ira", "beneficiar*", "retirement", "pending", "posted", "available"],
  piggy: ["sav*", "cushion", "sinking fund", "emergency fund", "set aside"],
  chart: ["debt", "snowball", "avalanche", "interest", "rate", "payoff", "pay off", "loan", "owe"],
  plane: ["flight", "airline", "plane", "airport", "gate", "landing", "connection", "fly", "flies", "air~"],
  suitcase: ["trip", "travel", "pack", "luggage", "carry-on", "group", "abroad", "vacation", "stop~"],
  ticket: ["booking", "reservation", "confirmation", "ticket", "rebook", "reference", "boarding"],
  hotel: ["hotel", "desk~", "check-in", "room", "stay~", "lodging", "counter~"],
  route: ["route", "multi-stop", "itinerary", "map", "destination", "order~", "leg", "transfer"],
  car: ["car", "vehicle", "drive", "driving", "odometer", "mileage*", "miles", "tow", "used~", "license plate", "keys~"],
  wrench: ["mechanic", "shop", "repair", "oil", "brake", "tire", "servic*~", "inspection", "coolant", "timing belt", "spark", "fluid", "part~"],
  house: ["house", "home", "homeowner*", "property", "roof", "gutter", "rent", "mortgage", "lease", "address"],
  toolbox: ["tool", "fix~", "maintenance", "job", "chore", "plumber", "electrician", "technician", "contractor"],
  water: ["water", "shutoff", "faucet", "hose", "leak", "pipe", "drain", "flush", "freeze"],
  bulb: ["appliance", "model number", "bulb", "fridge", "furnace", "filter", "heater", "warranty", "serial", "manual", "label", "decide~", "idea~", "choose~", "pick~"],
  pills: ["medicine", "medication", "dose", "prescription", "pharmac*", "vitamin", "pill", "allerg*", "reaction"],
  health: ["health", "symptom", "vaccin*", "medical", "insurance", "first aid", "sick", "ill", "care"],
  doctor: ["doctor", "appointment", "visit", "clinic", "nurse", "intake"],
  books: ["homeschool", "school", "lesson", "subject", "curriculum", "learn", "reading", "workbook", "child", "kid", "camp", "sample", "teach", "math", "evaluat*"],
  people: ["parent", "family", "babysitter", "grandparent", "sitter", "everyone", "everybody", "partner", "couple", "children", "person~", "people", "somebody~", "someone~", "executor", "together", "who~"],
  magnifier: ["find~", "look~", "search", "review", "spot", "gap", "missing", "scan", "track~", "where~"],
  target: ["result", "goal", "outcome", "want~", "aim", "limit", "most you"],
  mind: ["brain", "fog", "head", "mind", "procrastinat*", "executive", "overwhelm", "paralysis", "remember", "forget", "memory", "stuck", "avoid", "energy", "motivation"],
  steps: ["step", "start~", "restart", "first~", "begin", "small~", "shrink", "next~", "half finished", "pick up", "back in"],
  key: ["password", "login", "key", "access", "safe deposit", "get into"],
  shield: ["protect", "warranty", "emergency", "secure", "authoriz*", "safe"],
  scale: ["vs", "versus", "which~", "better", "compare", "estate", "court", "probate", "legal", "distribute", "split", "fair"],
  laptop: ["app", "apps", "spreadsheet", "online", "screen", "download", "import", "computer", "digital", "website", "column"],
  moon: ["night", "evening", "bedtime", "sleep", "tonight"],
};

/** What each product is about, in two pictures, for when a slide or a moment names too little that is drawable. */
const PRODUCT_MOTIFS: Record<string, [string, string]> = {
  alongside: ["mind", "steps"],
  "family-health-binder": ["health", "pills"],
  "home-management-companion": ["house", "toolbox"],
  "homeschooling-companion": ["books", "notebook"],
  "monthly-money-reset": ["wallet", "calendar"],
  "personal-finance-companion": ["chart", "receipt"],
  "personal-life-affairs-companion": ["binder", "document"],
  "travel-companion": ["plane", "suitcase"],
  "vehicle-maintenance-companion": ["car", "wrench"],
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const WEAK = 0.4;
const pattern = (w: string) => w.endsWith("*")
  ? new RegExp(`(^|[^a-z0-9$])${escape(w.slice(0, -1))}`, "g")
  : new RegExp(`(^|[^a-z0-9$])${escape(w)}(s|es|ed|d|ing)?(?=[^a-z0-9]|$)`, "g");
const PATTERNS = Object.fromEntries(
  Object.entries(MOTIF_WORDS).map(([m, words]) => [m, words.map((w) => ({ w: w.replace(/[*~]+$/, ""), weight: w.endsWith("~") ? WEAK : 1, re: pattern(w.toLowerCase().replace(/~$/, "")) }))]),
);

/** Every illustration ranked by how many of its words a text names (a word's every mention counts; longer cue words count more). */
export function rankMotifs(text: string): { motif: string; score: number; words: string[] }[] {
  const t = ` ${text.toLowerCase()} `;
  return Object.entries(PATTERNS)
    .map(([motif, pats]) => {
      const words: string[] = [];
      let score = 0;
      for (const { w, weight, re } of pats) {
        const n = (t.match(re) ?? []).length;
        if (n) { words.push(w); score += n * weight * (w.includes(" ") ? 2 : 1); }
      }
      return { motif, score, words };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || MOTIF_ORDER.indexOf(a.motif) - MOTIF_ORDER.indexOf(b.motif));
}
const MOTIF_ORDER = Object.keys(MOTIF_WORDS);

export type Pick = { motif: string; why: string };

/** The carousel's topic: the illustrations its moment and guide title name most, else its product's own. */
export function topicMotifs(product: string, moment: string, guideTitle: string): Pick[] {
  const ranked = rankMotifs(`${moment} ${moment} ${guideTitle}`);
  const out: Pick[] = ranked.slice(0, 2).map((r) => ({ motif: r.motif, why: `the moment and its guide name ${r.words.map((w) => `"${w}"`).join(", ")}` }));
  for (const own of PRODUCT_MOTIFS[product] ?? []) {
    if (!out.some((p) => p.motif === own)) out.push({ motif: own, why: `what ${product} is about` });
  }
  return out;
}

/** How close a runner-up must come to the best match to be used instead of repeating the slide before's picture. */
const CLOSE_ENOUGH = 0.6;

/**
 * The illustration for one slide: the one its words name most. When that is the picture the slide before
 * had, a runner-up nearly as well named is used instead; a clearly better match repeats rather than give a
 * slide a picture it barely names. A slide that names nothing drawable gets the carousel's topic.
 */
/** The most slides in a row that may share a picture: a run of similar steps still changes picture after this. */
export const MAX_RUN = 2;

/** The least a slide's words must name a picture by: one specific word, or two everyday ones. One "plate" alone is not a car. */
export const MIN_SCORE = 0.8;

export function slideMotif(text: string, previous: string | undefined, topic: Pick[], run = previous ? 1 : 0): Pick {
  const ranked = rankMotifs(text).filter((r) => r.score >= MIN_SCORE);
  const runnerUp = ranked.find((r) => r.motif !== previous);
  const mustChange = run >= MAX_RUN;
  const named = ranked[0]?.motif === previous && runnerUp && (mustChange || runnerUp.score >= ranked[0].score * CLOSE_ENOUGH) ? runnerUp : ranked[0];
  if (named?.motif === previous && mustChange) {
    const other = topic.find((p) => p.motif !== previous);
    if (other) return { motif: other.motif, why: `the slide names only what the last ${run} slides showed; the carousel's topic instead (${other.why})` };
  }
  if (named) return { motif: named.motif, why: `the slide names ${named.words.map((w) => `"${w}"`).join(", ")}` };
  const fallback = topic.find((p) => p.motif !== previous) ?? topic[0];
  return { motif: fallback.motif, why: `the slide names nothing drawable; the carousel's topic (${fallback.why})` };
}
