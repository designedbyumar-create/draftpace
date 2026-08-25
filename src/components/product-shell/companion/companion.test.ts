import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Structural guards on the shared Companion runtime.
 *
 * These moved here from Alongside's own test suite once the engine was
 * extracted: what they check now lives in this file, not in any one
 * product's, so the guard protects every product built on this engine
 * rather than only the first one. The bugs they guard against are real
 * and already happened once during Alongside's own build:
 *
 *   - a run created inside a mount effect produced a genuine orphaned
 *     row when React's own Strict Mode double-invoked it in development;
 *   - branching the runtime on which specific playbook is running is
 *     exactly how eight independent workflows would grow back in, one
 *     small exception at a time;
 *   - showing a playbook's own internal name instead of the situation
 *     it was offered under puts Draftpace's own vocabulary back in front
 *     of the person using it.
 */

const engine = readFileSync(new URL("./CompanionRun.tsx", import.meta.url), "utf8");
const startCompanion = readFileSync(new URL("./StartCompanion.tsx", import.meta.url), "utf8");

describe("the engine is shared, not per-playbook", () => {
  it("never branches on which playbook is running", () => {
    expect(engine).not.toMatch(/playbook\.key\s*===/);
    expect(engine).not.toMatch(/playbook\.key\s*!==/);
  });

  it("switches only on step.kind, the six shapes every playbook is built from", () => {
    expect(engine).toMatch(/step\.kind === "choose"/);
    expect(engine).toMatch(/step\.kind === "write"/);
    expect(engine).toMatch(/step\.kind === "wording"/);
  });
});

describe("resume, at the engine level", () => {
  it("creates a run only in response to a person's choice, never as a side effect of rendering", () => {
    expect(engine, "CompanionRun must not call startRun itself").not.toContain("startRun");
    expect(engine, "CompanionRun must not create a run inside a mount effect").not.toContain("useEffect");
  });

  it("requires the run as a prop rather than accepting one that might not exist yet", () => {
    expect(engine, "run must be required, not optional").toMatch(/\n\s*run: CompanionRunState;/);
    expect(engine).not.toMatch(/run\?:\s*CompanionRunState/);
  });
});

describe("the front door does not require a product's own vocabulary", () => {
  it("shows the situation, not the playbook's own name, as what the person picks", () => {
    expect(startCompanion).toContain("playbook.situation");
    expect(startCompanion).not.toMatch(/\{playbook\.title\}/);
  });

  it("lets somebody type what they need before choosing anything, by default", () => {
    expect(startCompanion).toMatch(/What do you need to do\?/);
  });

  it("never routes free text into a playbook by guessing at it", () => {
    // The one thing this screen must not become: the person's own words
    // silently deciding which playbook opens. There is no language
    // model anywhere in this codebase, and this engine is not the
    // exception.
    expect(startCompanion).not.toMatch(/\btitle\.(includes|match|toLowerCase\(\)\.includes)/);
  });
});
