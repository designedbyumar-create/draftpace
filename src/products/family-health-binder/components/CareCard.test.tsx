import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CareCard from "./CareCard";
import { allergy, condition, fact, member } from "../testFixtures";

const TODAY = "2026-09-07";
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&#x27;/g, "'");
const render = (props: Partial<Parameters<typeof CareCard>[0]> = {}) =>
  renderToStaticMarkup(<CareCard member={member()} index={0} facts={[]} today={TODAY} {...props} />);

describe("CareCard", () => {
  it("names the person, how they relate to you and how old they are", () => {
    expect(text(render())).toContain("Amina Child · 8 years");
  });

  it("shows allergies first, as tags, and says plainly when none were recorded", () => {
    const withAllergy = render({ facts: [allergy(), allergy({ id: "a2", detail: "Latex" })] });
    expect(withAllergy).toContain("Peanuts");
    expect(withAllergy).toContain("Latex");
    expect(text(withAllergy)).not.toContain("No allergies recorded");
    expect(text(render())).toContain("No allergies recorded");
  });

  it("shows conditions and what is taken now, and leaves a stopped medication and another person's facts out", () => {
    const out = text(
      render({
        member: member({ medicationsCheckedOn: "2026-09-06" }),
        facts: [
          condition(),
          fact({ id: "m1", detail: "Vitamin D", dosage: null, frequency: null }),
          fact({ id: "m2", detail: "Old syrup", stoppedOn: "2026-06-01" }),
          fact({ id: "m3", detail: "Someone else's", familyMemberId: "m2" }),
        ],
      })
    );
    expect(out).toContain("Asthma");
    expect(out).toMatch(/Takes Vitamin D\s*\.\s*Checked yesterday\./);
    expect(out).not.toContain("Old syrup");
    expect(out).not.toContain("Someone else's");
  });

  it("says nothing is recorded, not that nothing is taken, when there are no medications", () => {
    expect(text(render())).toContain("No current medications recorded.");
  });

  it("still shows a private fact to its owner", () => {
    expect(render({ facts: [allergy({ visibility: "private" })] })).toContain("Peanuts");
  });

  it("keeps the medication line off the compact card", () => {
    expect(text(render({ compact: true, facts: [fact()] }))).not.toContain("Takes");
  });
});
