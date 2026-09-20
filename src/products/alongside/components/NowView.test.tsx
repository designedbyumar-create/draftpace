import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import NowView, { type NowViewProps } from "./NowView";
import { QUIET_LINE } from "../attention";
import type { LifeItem } from "../life";

const item = (over: Partial<LifeItem> = {}): LifeItem =>
  ({
    id: "1",
    kind: "commitment",
    title: "Call the clinic about the referral",
    note: null,
    status: "open",
    nextAt: null,
    userChosenDate: true,
    everyMonths: null,
    waitingOn: null,
    lastTouchedAt: null,
    leftOffNote: null,
    nextStep: null,
    ...over,
  }) as unknown as LifeItem;

function render(over: Partial<NowViewProps> = {}) {
  return renderToStaticMarkup(
    <NowView
      signal={{ line: "You said you would come back to this", item: item() }}
      setDown={false}
      canWork
      chooser={null}
      closing={null}
      startError={null}
      sorting={false}
      onDoThis={() => {}}
      onNotNow={() => {}}
      onSorted={() => {}}
      onShowAgain={() => {}}
      onKeep={() => {}}
      onHelp={() => {}}
      {...over}
    />
  );
}

describe("The One Card", () => {
  it("shows why it is here, the thing in the person's own words, and one way in", () => {
    const html = render();
    expect(html).toContain("You said you would come back to this");
    expect(html).toContain("Call the clinic about the referral");
    expect(html.match(/Do this with me/g)).toHaveLength(1);
  });

  it("offers two ways to set it down and never a count of what is waiting", () => {
    const html = render();
    expect(html).toContain("Not now");
    expect(html).toContain("It is sorted");
    expect(html).not.toMatch(/\d+ more|more things|more thing/);
  });

  it("gives a waiting item no button until it is worth chasing", () => {
    const html = render({ canWork: false });
    expect(html).not.toContain("Do this with me");
    expect(html).toContain("Not now");
  });

  it("replaces the button with the chooser when there is more than one way in", () => {
    const html = render({ chooser: <div>Pick a way in</div> });
    expect(html).toContain("Pick a way in");
    expect(html).not.toContain("Do this with me");
  });

  it("says what was left off, or the next step, and never invents either", () => {
    expect(render({ signal: { line: "You left off here", item: item({ leftOffNote: "At the tax reference number." }) } })).toContain("At the tax reference number.");
    expect(render({ signal: { line: "You left off here", item: item({ nextStep: "Find the letter" }) } })).toContain("Next: Find the letter");
    const bare = render();
    expect(bare).not.toContain("Next:");
  });

  it("says nothing needs anyone when nothing does, and stops", () => {
    const html = render({ signal: null });
    expect(html).toContain(QUIET_LINE);
    expect(html).toContain("still here in Life");
    expect(html).not.toContain("Do this with me");
    expect(html).not.toContain("Not now");
  });

  it("says that is all for now, and offers to show them again, once everything is set down", () => {
    const html = render({ signal: null, setDown: true });
    expect(html).toContain("That is all for now");
    expect(html).toContain("Show them again");
  });

  it("always keeps the two ways to put something down within reach", () => {
    for (const html of [render(), render({ signal: null })]) {
      expect(html).toContain("Keep something");
      expect(html).toContain("Help me with something");
    }
  });

  it("says 'Recorded.' once, and says nothing at all when there is nothing to record", () => {
    expect(render({ closing: "Recorded." })).toContain("Recorded.");
    expect(render()).not.toContain("Recorded.");
  });

  // Tailwind 3 silently drops `/NN` on a var() colour.
  it("never puts an /opacity on a var() colour", () => {
    const source = readFileSync(join(__dirname, "NowView.tsx"), "utf8");
    expect([...source.matchAll(/\[var\(--[a-z0-9-]+\)\]\/\d+/gi)].map((m) => m[0])).toEqual([]);
  });
});
