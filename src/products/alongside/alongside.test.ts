import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  byKind,
  daysSince,
  describeDaysSince,
  describeDaysUntil,
  isActionable,
  KIND_LABEL,
  KIND_PROMPT,
  resumeContext,
  type LifeItem,
} from "./life";
import { deriveAttention, isApprovedPhrasing, QUIET_LINE, readySignals } from "./attention";
import { applyOutcome, offerFromDirectRun } from "./outcome";
import { nextStep, OUTCOME_OPTIONS, visibleItems, visibleWording, type Answers } from "./playbook";
import { makeAPhoneCall } from "./playbooks/makeAPhoneCall";
import { PLAYBOOKS, playbooksFor } from "./playbooks";

const NOW = new Date("2026-08-23T10:00:00Z");
const ago = (days: number) => new Date(NOW.getTime() - days * 86_400_000).toISOString();
const ahead = (days: number) => new Date(NOW.getTime() + days * 86_400_000).toISOString();

const item = (over: Partial<LifeItem> = {}): LifeItem => ({
  id: "i1",
  kind: "commitment",
  title: "Ring the energy company",
  note: null,
  status: "open",
  nextAt: null,
  userChosenDate: false,
  everyMonths: null,
  waitingOn: null,
  lastTouchedAt: null,
  leftOffNote: null,
  nextStep: null,
  createdAt: ago(30),
  ...over,
});

/**
 * The boundary that defines this product. The other four Companions own
 * a subject; this one owns the user's relationship with something they
 * are trying to do.
 */
describe("the product boundary", () => {
  it("holds no subject-specific fields, whatever a contributor is tempted to add", () => {
    const fields = Object.keys(item()).sort();
    expect(fields).toEqual(
      [
        "createdAt", "everyMonths", "id", "kind", "lastTouchedAt", "leftOffNote",
        "nextAt", "nextStep", "note", "status", "title", "userChosenDate", "waitingOn",
      ].sort()
    );
  });

  it("has no field any of the other four Companions owns", () => {
    const source = readFileSync(new URL("./life.ts", import.meta.url), "utf8");
    for (const owned of ["amount", "account", "provider", "policy", "balance", "address", "invoice"]) {
      expect(source.match(new RegExp(`^\\s+${owned}\\??:`, "im")), owned).toBeNull();
    }
  });
});

describe("the four shapes", () => {
  it("names all four from the person's side, never as a category", () => {
    for (const kind of ["commitment", "waiting", "thread", "reference"] as const) {
      expect(KIND_LABEL[kind].length).toBeGreaterThan(0);
      expect(KIND_PROMPT[kind]).toMatch(/^Something/);
    }
  });

  /**
   * The whole point of the waiting shape. Somebody else has the ball,
   * and putting it in a list of things to do turns a fact about the
   * world into a personal failure to act.
   */
  it("never treats a waiting item as something to act on", () => {
    expect(isActionable(item({ kind: "waiting" }))).toBe(false);
    for (const kind of ["commitment", "thread", "reference"] as const) {
      expect(isActionable(item({ kind })), kind).toBe(true);
    }
  });

  it("keeps the shapes apart", () => {
    const all = [item({ id: "a", kind: "commitment" }), item({ id: "b", kind: "waiting" })];
    expect(byKind(all, "waiting").map((i) => i.id)).toEqual(["b"]);
  });

  it("goes vague past a fortnight, because a precise number nobody acts on is noise", () => {
    expect(describeDaysUntil(1)).toBe("tomorrow");
    expect(describeDaysUntil(4)).toBe("in 4 days");
    expect(describeDaysUntil(21)).toBe("in about 3 weeks");
    expect(describeDaysSince(11)).toBe("11 days ago");
    expect(describeDaysSince(40)).toBe("about 6 weeks ago");
  });
});

describe("derived attention", () => {
  it("says nothing when there is nothing, and means it", () => {
    const view = deriveAttention({ items: [item()] }, NOW);
    expect(view.quiet).toBe(true);
    expect(view.signals).toEqual([]);
  });

  it("mentions a commitment once it is inside the horizon", () => {
    const view = deriveAttention({ items: [item({ nextAt: ahead(10) })] }, NOW);
    expect(view.signals[0].reason).toBe("coming-up");
    expect(view.signals[0].line).toBe("Coming up in about a week");
  });

  it("stays quiet about something too far off to act on", () => {
    expect(deriveAttention({ items: [item({ nextAt: ahead(60) })] }, NOW).quiet).toBe(true);
  });

  it("credits the person when they set the date themselves", () => {
    const view = deriveAttention({ items: [item({ nextAt: ahead(2), userChosenDate: true })] }, NOW);
    expect(view.signals[0].reason).toBe("you-asked");
    expect(view.signals[0].line).toBe("You said you would come back to this");
  });

  it("never raises a waiting item before its own check date", () => {
    const notYet = deriveAttention({ items: [item({ kind: "waiting", nextAt: ahead(5) })] }, NOW);
    expect(notYet.quiet).toBe(true);
    const due = deriveAttention({ items: [item({ kind: "waiting", nextAt: ago(1), waitingOn: "Sarah" })] }, NOW);
    expect(due.signals[0].line).toBe("Still waiting on Sarah?");
  });

  /**
   * A fortnight of not touching something is an ordinary fortnight. A
   * product that speaks up after three days has become the nagging this
   * one exists without.
   */
  it("leaves a thread alone for a fortnight before mentioning it", () => {
    expect(deriveAttention({ items: [item({ kind: "thread", lastTouchedAt: ago(5) })] }, NOW).quiet).toBe(true);
    const later = deriveAttention({ items: [item({ kind: "thread", lastTouchedAt: ago(20) })] }, NOW);
    expect(later.signals[0].reason).toBe("left-off");
    expect(later.signals[0].line).toBe("You left off here about 3 weeks ago");
  });

  it("ignores anything closed", () => {
    expect(deriveAttention({ items: [item({ nextAt: ahead(1), status: "done" })] }, NOW).quiet).toBe(true);
  });

  it("is deterministic for the same inputs", () => {
    const items = [item({ id: "a", nextAt: ahead(3) }), item({ id: "b", nextAt: ahead(3) })];
    expect(JSON.stringify(deriveAttention({ items }, NOW))).toBe(JSON.stringify(deriveAttention({ items }, NOW)));
  });

  it("raises a thread that has just been unblocked", () => {
    const signals = readySignals([item({ id: "t", kind: "thread" })], ["t"]);
    expect(signals[0].line).toBe("This is unblocked now");
  });
});

/**
 * The tone cannot be allowed to drift one string at a time, so every
 * line the engine can emit is checked against a fixed set of shapes.
 */
describe("what attention is allowed to say", () => {
  const everyLine = [
    ...deriveAttention({ items: [
      item({ id: "a", nextAt: ahead(3) }),
      item({ id: "b", nextAt: ahead(3), userChosenDate: true }),
      item({ id: "c", kind: "waiting", nextAt: ago(1), waitingOn: "Sarah" }),
      item({ id: "d", kind: "waiting", nextAt: ago(1) }),
      item({ id: "e", kind: "thread", lastTouchedAt: ago(30) }),
    ] }, NOW).signals.map((s) => s.line),
    ...readySignals([item({ id: "f", kind: "thread" })], ["f"]).map((s) => s.line),
    QUIET_LINE,
  ];

  it("emits only approved phrasings", () => {
    expect(everyLine.length).toBeGreaterThan(4);
    for (const line of everyLine) expect(isApprovedPhrasing(line), line).toBe(true);
  });

  it("never uses an exclamation mark", () => {
    for (const line of everyLine) expect(line).not.toContain("!");
  });

  it("never says overdue, late, or missed", () => {
    for (const line of everyLine) {
      for (const word of ["overdue", "late", "missed", "still not", "you have not"]) {
        expect(line.toLowerCase(), line).not.toContain(word);
      }
    }
  });
});

describe("the whole product's language", () => {
  const BANNED = [
    "lazy", "irresponsible", "failing", "failed", "back on track", "should have",
    "wasted", "procrastinat", "distracted", "discipline", "bad habits",
    "fix yourself", "overcome", "get your life together", "overdue",
  ];

  const surfaces = [
    ...Object.values(KIND_LABEL),
    ...Object.values(KIND_PROMPT),
    QUIET_LINE,
    ...OUTCOME_OPTIONS.map((o) => o.label),
    makeAPhoneCall.title,
    makeAPhoneCall.situation,
    ...makeAPhoneCall.steps.flatMap((s) => [
      s.prompt, s.why ?? "", s.hint ?? "", s.placeholder ?? "",
      ...(s.choices ?? []).map((c) => c.label),
      ...(s.items ?? []).map((i) => i.text),
      ...(s.suggestedWording ?? []).map((w) => w.text),
    ]),
  ];

  for (const word of BANNED) {
    it(`never says "${word}"`, () => {
      for (const text of surfaces) expect(text.toLowerCase(), text).not.toContain(word);
    });
  }

  /**
   * "Just send the email" trivialises initiation difficulty and is the
   * single most common way software condescends to this audience.
   */
  it('never says "just"', () => {
    for (const text of surfaces) {
      expect(text.toLowerCase(), text).not.toMatch(/\bjust\b/);
    }
  });

  it("never uses an exclamation mark anywhere", () => {
    for (const text of surfaces) expect(text, text).not.toContain("!");
  });

  it("uses no em dash, per the repo content rule", () => {
    for (const text of surfaces) expect(text).not.toContain("—");
  });

  it("never claims to know what happened outside Draftpace", () => {
    for (const text of surfaces) {
      for (const claim of ["we noticed", "we saw", "you have been", "you spent"]) {
        expect(text.toLowerCase(), text).not.toContain(claim);
      }
    }
  });
});

describe("the playbook engine", () => {
  const answers = (over: Answers = {}): Answers => ({ purpose: "problem", who: "The energy company", ...over });

  it("asks one thing at a time, in order", () => {
    expect(nextStep(makeAPhoneCall, {})!.key).toBe("purpose");
    expect(nextStep(makeAPhoneCall, { purpose: "problem" })!.key).toBe("who");
  });

  it("does not come back to something deliberately skipped", () => {
    const skipped = new Set(["must-not-forget"]);
    const a = answers({ outcome: "A date", prepare: "seen" });
    expect(nextStep(makeAPhoneCall, a, skipped)!.key).toBe("opening");
  });

  it("finishes at the outcome step and nowhere else", () => {
    const complete = answers({ outcome: "x", prepare: "seen", "must-not-forget": "x", opening: "x", during: "seen" });
    expect(nextStep(makeAPhoneCall, complete)!.kind).toBe("outcome");
  });

  it("shows only what applies to the purpose chosen", () => {
    const prepare = makeAPhoneCall.steps.find((s) => s.key === "prepare")!;
    const chasing = visibleItems(prepare, answers({ purpose: "chase" }));
    const booking = visibleItems(prepare, answers({ purpose: "book" }));
    expect(chasing).toContain("Any reference from a previous call");
    expect(booking).not.toContain("Any reference from a previous call");
    expect(booking).toContain("The dates that would work for you");
  });

  it("offers exactly one opening for every purpose it accepts", () => {
    const opening = makeAPhoneCall.steps.find((s) => s.key === "opening")!;
    const purposes = makeAPhoneCall.steps.find((s) => s.key === "purpose")!.choices!.map((c) => c.value);
    for (const purpose of purposes) {
      expect(visibleWording(opening, { purpose }), purpose).toHaveLength(1);
    }
  });

  it("keeps the during list short enough to read mid-call", () => {
    const during = makeAPhoneCall.steps.find((s) => s.key === "during")!;
    for (const purpose of ["problem", "book", "information"]) {
      expect(visibleItems(during, { purpose }).length).toBeLessThanOrEqual(7);
    }
  });

  it("suggests openings only, never what to claim or accept", () => {
    const opening = makeAPhoneCall.steps.find((s) => s.key === "opening")!;
    for (const text of opening.suggestedWording!.map((w) => w.text)) {
      for (const word of ["refund me", "i demand", "compensation", "you owe", "unacceptable"]) {
        expect(text.toLowerCase(), text).not.toContain(word);
      }
    }
  });

  it("registers the playbook and offers it for the right shapes", () => {
    expect(PLAYBOOKS).toHaveLength(1);
    expect(playbooksFor("commitment")).toHaveLength(1);
    expect(playbooksFor("reference")).toHaveLength(0);
  });
});

describe("the loop closing", () => {
  it("closes a one-off when it is sorted", () => {
    const effect = applyOutcome(item(), { outcome: "resolved", detail: null, now: NOW });
    expect(effect.patch.status).toBe("done");
    expect(effect.event).toBe("Sorted");
  });

  it("rolls a recurring thing forward rather than closing it", () => {
    const effect = applyOutcome(item({ everyMonths: 12, nextAt: ago(2) }), {
      outcome: "resolved", detail: null, now: NOW,
    });
    expect(effect.patch.status).toBeUndefined();
    expect(new Date(effect.patch.nextAt!).getTime()).toBeGreaterThan(NOW.getTime());
  });

  it("turns the item itself into a waiting item rather than making a second one", () => {
    const effect = applyOutcome(item(), { outcome: "waiting", detail: "Sarah", now: NOW });
    expect(effect.patch.kind).toBe("waiting");
    expect(effect.patch.waitingOn).toBe("Sarah");
    expect(effect.patch.nextAt).toBeTruthy();
    expect(effect.offer).toBeNull();
  });

  it("records where they left off, in their own words", () => {
    const effect = applyOutcome(item({ kind: "thread" }), {
      outcome: "progress", detail: "Got through to the right team", now: NOW,
    });
    expect(effect.patch.leftOffNote).toBe("Got through to the right team");
    expect(effect.patch.lastTouchedAt).toBeTruthy();
  });

  /**
   * The rule most likely to be broken by somebody being helpful. Even
   * touching lastTouchedAt would restart the quiet clock and hide the
   * item for another fortnight, which is the opposite of what somebody
   * who did not get to it needs.
   */
  it("changes absolutely nothing when they did not get to it", () => {
    const effect = applyOutcome(item({ kind: "thread", lastTouchedAt: ago(30) }), {
      outcome: "not-yet", detail: null, now: NOW,
    });
    expect(effect.patch).toEqual({});
    expect(effect.event).toBeNull();
    expect(effect.offer).toBeNull();
  });

  it("still surfaces a thread that was not got to, rather than hiding it", () => {
    const thread = item({ kind: "thread", lastTouchedAt: ago(30) });
    const effect = applyOutcome(thread, { outcome: "not-yet", detail: null, now: NOW });
    const after = { ...thread, ...effect.patch };
    expect(deriveAttention({ items: [after] }, NOW).signals[0].reason).toBe("left-off");
  });
});

describe("a run that started with nothing behind it", () => {
  it("offers to remember a waiting item", () => {
    const offer = offerFromDirectRun({ outcome: "waiting", detail: "Sarah", now: NOW }, "Ring the energy company");
    expect(offer?.kind).toBe("waiting");
    expect(offer?.nextAt).toBeTruthy();
  });

  it("offers to remember a next step as something to do", () => {
    const offer = offerFromDirectRun({ outcome: "next-step", detail: "Send the meter photo", now: NOW }, "Call");
    expect(offer).toEqual({ kind: "commitment", title: "Send the meter photo", note: null, nextAt: null });
  });

  /**
   * Somebody who opened the Companion to get one phone call done has not
   * asked for a system. A finished thing needs no memory.
   */
  it("offers nothing when the thing is finished, or did not happen", () => {
    for (const outcome of ["resolved", "not-yet"] as const) {
      expect(offerFromDirectRun({ outcome, detail: null, now: NOW }, "Call"), outcome).toBeNull();
    }
  });
});

/**
 * Reachability, not behaviour.
 *
 * Two of the six attention reasons depend on a date, and for a while
 * nothing in the interface could set one: the derivation was correct and
 * permanently unreachable, which unit tests cannot see because they
 * construct their own items. So the capture form is checked for the two
 * fields the reasons depend on, and the history surface for the read
 * that makes the write worth doing.
 */
describe("what the interface can actually reach", () => {
  const form = readFileSync(new URL("./components/AddItemForm.tsx", import.meta.url), "utf8");

  it("lets somebody set a date, so coming-up and you-asked can happen at all", () => {
    expect(form).toContain("nextAt");
    expect(form).toContain("userChosenDate");
  });

  it("never requires that date, so nobody has to invent a deadline to get past the screen", () => {
    expect(form).toMatch(/Leave this empty if there is no date/);
    // The save button gates on the title alone.
    expect(form).toMatch(/disabled=\{pending \|\| title\.trim\(\)\.length === 0\}/);
  });

  it("reads the history it writes, rather than filling a table nobody sees", () => {
    const life = readFileSync(new URL("./components/LifeModule.tsx", import.meta.url), "utf8");
    expect(life).toContain("loadItemEvents");
  });
});

describe("resuming something", () => {
  it("hands back every fact needed to start again, and infers none", () => {
    const context = resumeContext(
      item({ kind: "thread", lastTouchedAt: ago(11), leftOffNote: "Finished the About page copy", nextStep: "Replace hero image" }),
      NOW
    );
    expect(context).toEqual({
      lastTouched: "11 days ago",
      leftOff: "Finished the About page copy",
      nextStep: "Replace hero image",
    });
  });

  it("says nothing about a thread it has never seen touched", () => {
    expect(resumeContext(item({ kind: "thread" }), NOW).lastTouched).toBeNull();
    expect(daysSince(null, NOW)).toBeNull();
  });
});
