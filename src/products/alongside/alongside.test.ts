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
import { conditionMet, nextStep, OUTCOME_OPTIONS, visibleItems, visibleWording, type Answers } from "./playbook";
import { makeAPhoneCall } from "./playbooks/makeAPhoneCall";
import { PLAYBOOKS, PLAYBOOK_BY_KEY, playbooksFor } from "./playbooks";

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
    // Productivity-app language. The product is external memory,
    // attention, and situational companionship, not a task manager with
    // an ADHD theme, and these are the words that theme shows up in.
    "streak", "adherence", "attempt", "focus timer", "productivity", "coaching",
    // Reference must stay a place for a detail you need for something
    // specific, never a general notes feature.
    "journal", "diary", "notebook",
  ];

  const surfaces = [
    ...Object.values(KIND_LABEL),
    ...Object.values(KIND_PROMPT),
    QUIET_LINE,
    ...OUTCOME_OPTIONS.map((o) => o.label),
    // Every line of every playbook. Scoping this to one of them was how
    // seven unchecked playbooks would have been possible.
    ...PLAYBOOKS.flatMap((playbook) => [
      playbook.title,
      playbook.situation,
      ...playbook.steps.flatMap((s) => [
        s.prompt, s.why ?? "", s.hint ?? "", s.placeholder ?? "",
        ...(s.choices ?? []).map((c) => c.label),
        ...(s.items ?? []).map((i) => i.text),
        ...(s.suggestedWording ?? []).map((w) => w.text),
      ]),
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

  it("registers the whole library and offers each for the right shapes", () => {
    expect(PLAYBOOKS).toHaveLength(8);
    expect(playbooksFor("commitment").length).toBeGreaterThan(4);
    // Something you only want to be able to find later is not a task.
    expect(playbooksFor("reference")).toHaveLength(0);
  });
});

/**
 * Structural checks across all eight.
 *
 * Authored content is where the silent faults live: a branch with no
 * suggestion for one choice, a condition naming a step that comes later,
 * a during list that has quietly grown to twelve lines. None of that
 * throws, and none of it shows up until somebody picks that exact path
 * on a real screen.
 */
describe("the library", () => {
  it("has the eight the founder locked, and no ninth", () => {
    expect(Object.keys(PLAYBOOK_BY_KEY).sort()).toEqual(
      [
        "book-and-prepare-for-an-appointment",
        "break-down-something-too-big",
        "follow-up-with-someone",
        "make-a-difficult-phone-call",
        "make-a-phone-call",
        "resolve-a-billing-problem",
        "resume-something-abandoned",
        "send-the-email",
      ].sort()
    );
  });

  for (const playbook of PLAYBOOKS) {
    describe(playbook.key, () => {
      it("has unique step keys", () => {
        const keys = playbook.steps.map((s) => s.key);
        expect(new Set(keys).size).toBe(keys.length);
      });

      it("ends at exactly one outcome step, and it is the last one", () => {
        const outcomes = playbook.steps.filter((s) => s.kind === "outcome");
        expect(outcomes).toHaveLength(1);
        expect(playbook.steps[playbook.steps.length - 1].kind).toBe("outcome");
      });

      /**
       * A condition naming a later step can never be true, so the step
       * or line it guards is dead. It reads as intentional in the source
       * and is invisible on screen.
       */
      it("only ever conditions on an answer it has already asked for", () => {
        const seen = new Set<string>();
        for (const step of playbook.steps) {
          const conditions = [
            step.askIf,
            ...(step.items ?? []).map((i) => i.askIf),
            ...(step.suggestedWording ?? []).map((w) => w.askIf),
          ].filter(Boolean);
          for (const condition of conditions) {
            expect(seen, `${step.key} conditions on ${condition!.step}`).toContain(condition!.step);
          }
          seen.add(step.key);
        }
      });

      it("gives every choice question at least two answers", () => {
        for (const step of playbook.steps.filter((s) => s.kind === "choose")) {
          expect((step.choices ?? []).length, step.key).toBeGreaterThan(1);
          const values = (step.choices ?? []).map((c) => c.value);
          expect(new Set(values).size, `${step.key} repeats a value`).toBe(values.length);
        }
      });

      /**
       * The gap this catches: an author adds a seventh purpose and
       * forgets the opening line for it, and that one branch shows a
       * wording step with nothing in it.
       */
      it("has wording for every branch that can reach it", () => {
        for (const step of playbook.steps.filter((s) => s.kind === "wording")) {
          const gate = step.suggestedWording?.find((w) => w.askIf)?.askIf;
          if (!gate) {
            expect(visibleWording(step, {}).length, step.key).toBeGreaterThan(0);
            continue;
          }
          const gating = playbook.steps.find((s) => s.key === gate.step);
          for (const choice of gating?.choices ?? []) {
            // Include the step's own gate, if it has one, so a branch
            // that never reaches this step is not counted against it.
            const answers = { [gate.step]: choice.value, ...gateAnswers(step, choice.value) };
            if (!conditionMet(step.askIf, answers)) continue;
            expect(visibleWording(step, answers).length, `${step.key} has nothing for ${choice.value}`).toBeGreaterThan(0);
          }
        }
      });

      it("keeps every during list short enough to read while somebody is talking", () => {
        for (const step of playbook.steps.filter((s) => s.kind === "during")) {
          const gate = step.items?.find((i) => i.askIf)?.askIf;
          const gating = gate ? playbook.steps.find((s) => s.key === gate.step) : null;
          const cases = gating?.choices?.map((c) => ({ [gate!.step]: c.value })) ?? [{}];
          for (const answers of cases) {
            expect(visibleItems(step, answers).length, step.key).toBeLessThanOrEqual(7);
          }
        }
      });

      it("shows something on every prepare and during step it can reach", () => {
        for (const step of playbook.steps.filter((s) => s.kind === "prepare" || s.kind === "during")) {
          expect(visibleItems(step, {}).length, `${step.key} is empty with no answers given`).toBeGreaterThan(0);
        }
      });

      it("opens for at least one shape, and never for a reference", () => {
        expect(playbook.opensFor, `${playbook.key} never sets opensFor`).toBeDefined();
        expect(playbook.opensFor!.length).toBeGreaterThan(0);
        expect(playbook.opensFor).not.toContain("reference");
      });

      it("only ever marks a write step optional, since that is the only kind the engine gives a skip button to", () => {
        for (const step of playbook.steps.filter((s) => s.optional)) {
          expect(step.kind, `${step.key} sets optional but is a ${step.kind} step, which has no skip button`).toBe("write");
        }
      });

      /**
       * Suggested wording opens a conversation. It never says what to
       * claim, accept, threaten, or settle for, because the person on
       * this end is the only one who knows.
       */
      it("suggests openings only, never a position", () => {
        for (const step of playbook.steps.filter((s) => s.kind === "wording")) {
          for (const { text } of step.suggestedWording ?? []) {
            for (const word of [
              "i demand", "you owe", "unacceptable", "compensation", "refund me",
              "i insist", "legal action", "or else", "final warning",
            ]) {
              expect(text.toLowerCase(), text).not.toContain(word);
            }
          }
        }
      });

      /**
       * The product is built for how these difficulties feel. It never
       * claims to know why somebody has them, so nothing it asks or
       * stores touches a diagnosis. Prepare lists are exempt on purpose:
       * telling somebody to bring their medication list to a doctor is
       * not the product profiling them, and prepare steps store only
       * that the screen was seen.
       */
      it("never asks for a diagnosis", () => {
        const asked = playbook.steps
          .filter((s) => s.kind === "write" || s.kind === "choose")
          .flatMap((s) => [s.prompt, s.why ?? "", s.hint ?? "", ...(s.choices ?? []).map((c) => c.label)]);
        for (const text of asked) {
          for (const word of ["diagnos", "adhd", "medication", "symptom", "disorder", "condition"]) {
            expect(text.toLowerCase(), text).not.toContain(word);
          }
        }
      });
    });
  }
});

/** The step's own gate, satisfied, so a reachable branch is judged as reachable. */
function gateAnswers(step: { askIf?: { step: string; equals?: string[] } }, fallback: string): Answers {
  if (!step.askIf) return {};
  return { [step.askIf.step]: step.askIf.equals?.[0] ?? fallback };
}

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

/**
 * The engine is one thing, not eight. Content lives in the eight
 * playbook files; state, persistence, resume, navigation, and outcome
 * handling live once, in CompanionRun and the domain layer. This is
 * asserted rather than left to hold by convention, because branching on
 * a specific playbook inside the runtime is exactly how eight
 * independent workflows would grow back in, one small exception at a
 * time.
 */
/**
 * The engine itself (never branches on which playbook is running,
 * switches only on step.kind, requires the run as a prop, creates one
 * only in response to a choice) is now guarded in
 * src/components/product-shell/companion/companion.test.ts, once, for
 * every product built on it, rather than re-asserted per product here.
 *
 * Resume is the P0 correction: closing the tab mid-run must not lose
 * the run, and reopening must not create a second one next to it.
 */
describe("resume", () => {
  const domain = readFileSync(new URL("./domain/alongsideData.ts", import.meta.url), "utf8");

  it("looks for a run to pick back up before the interface offers to start a new one", () => {
    const now = readFileSync(new URL("./components/NowModule.tsx", import.meta.url), "utf8");
    const life = readFileSync(new URL("./components/LifeModule.tsx", import.meta.url), "utf8");
    const detail = readFileSync(new URL("./components/AlongsideItemDetailModule.tsx", import.meta.url), "utf8");
    for (const [name, source] of [["Now", now], ["Life", life], ["item detail", detail]] as const) {
      expect(source, `${name} never calls findResumableRun`).toContain("findResumableRun");
    }
  });

  it("still finds a run the person left mid-way, not only one still marked open", () => {
    // Leaving is not failure elsewhere in this product (the "did not get
    // to it" outcome writes nothing at all); a left run has to be just
    // as resumable as one nobody has touched, or that principle would be
    // true of outcomes and false of the run itself.
    expect(domain).toMatch(/\.in\(\s*"status"\s*,\s*\[\s*"open"\s*,\s*"left"\s*\]\s*\)/);
  });

  it("still creates real runs through startRun, even though the engine that consumes them no longer lives in this file", () => {
    expect(domain, "beginRun/pickPlaybook flows must exist to create a run before CompanionRun mounts").toContain(
      "export async function startRun"
    );
  });

  /**
   * The wrapper's own contract: instanceId/item/directTitle are this
   * product's business, but `run` must still be required here too, not
   * only in the shared engine, since this file is what every call site
   * in this product actually imports.
   */
  it("requires the run as a prop on this product's own wrapper, rather than accepting one that might not exist yet", () => {
    const wrapper = readFileSync(new URL("./components/CompanionRun.tsx", import.meta.url), "utf8");
    expect(wrapper, "run must be required, not optional").toMatch(/\n\s*run: RunRecord;/);
    expect(wrapper).not.toMatch(/run\?:\s*RunRecord/);
  });

  it("creates the run exactly once per playbook choice, at every place a run can start", () => {
    for (const [name, file] of [
      ["Now", "./components/NowModule.tsx"],
      ["Life", "./components/LifeModule.tsx"],
      ["Help", "./components/HelpModule.tsx"],
      ["item detail", "./components/AlongsideItemDetailModule.tsx"],
    ] as const) {
      const source = readFileSync(new URL(file, import.meta.url), "utf8");
      expect(source, `${name} must create runs through beginRun, not by calling startRun directly`).toContain(
        "beginRun"
      );
    }
  });
});

/**
 * The front door, and the direct-entry path.
 *
 * A person should be able to open Alongside with nothing recorded and
 * say what they need to do without first learning that Alongside calls
 * that a commitment, or that this particular situation is called
 * "make-a-phone-call". These checks are about the mental model the
 * interface asks for, not about behaviour a unit test can otherwise see.
 */
describe("the front door does not require Draftpace's own mental model", () => {
  const now = readFileSync(new URL("./components/NowModule.tsx", import.meta.url), "utf8");
  const help = readFileSync(new URL("./components/HelpModule.tsx", import.meta.url), "utf8");

  // The screen's own rendering (situation over playbook name, typing
  // before choosing, no guessing from free text) is guarded once, at
  // the shared engine, in companion.test.ts.

  it("offers every situation, never one playbook standing in for the rest", () => {
    // The bug this guards: "Help me with something" once always opened
    // PLAYBOOKS[0], so whatever a person actually needed, they got the
    // phone call playbook.
    expect(now).not.toMatch(/PLAYBOOKS\[0\]/);
    expect(now).toContain("StartCompanion");
    expect(help).toContain("StartCompanion");
  });
});

describe("a direct run does not require picking a shape first", () => {
  it("lets somebody start from Help or Now with only a situation, no commitment/waiting/thread/reference choice", () => {
    const help = readFileSync(new URL("./components/HelpModule.tsx", import.meta.url), "utf8");
    expect(help).not.toMatch(/KIND_PROMPT|KIND_LABEL/);
  });
});

/**
 * Every outcome, wherever it is triggered from, writes through the one
 * applyOutcome rule. Two call sites would mean two chances for one of
 * them to quietly skip the recurring-item and history-writing behaviour
 * the other gets right, which is exactly what LifeModule's own quick
 * close button used to do before it was routed through here too.
 */
describe("outcomes are applied in exactly one place", () => {
  it("has a single call site that writes an outcome event", () => {
    const domain = readFileSync(new URL("./domain/alongsideData.ts", import.meta.url), "utf8");
    const inserts = domain.match(/\.from\("als_item_events"\)\.insert\(/g) ?? [];
    expect(inserts).toHaveLength(1);
  });

  it("routes every quick action through it rather than writing the item directly", () => {
    const life = readFileSync(new URL("./components/LifeModule.tsx", import.meta.url), "utf8");
    const detail = readFileSync(new URL("./components/AlongsideItemDetailModule.tsx", import.meta.url), "utf8");
    for (const [name, source] of [["Life", life], ["item detail", detail]] as const) {
      expect(source, `${name} calls recordOutcome`).toContain("recordOutcome");
    }
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
