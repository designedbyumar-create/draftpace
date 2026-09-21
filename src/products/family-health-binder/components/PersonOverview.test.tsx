import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PersonOverview from "./PersonOverview";
import { event, member, provider, visit } from "../testFixtures";

const TODAY = "2026-09-07";
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const render = (over: Partial<Parameters<typeof PersonOverview>[0]> = {}) =>
  text(renderToStaticMarkup(<PersonOverview member={member()} index={0} facts={[]} events={[]} providers={[]} visits={[]} today={TODAY} {...over} />));

describe("PersonOverview", () => {
  it("names what the forms sheet is missing, in the order forms ask", () => {
    expect(render({ member: member({ dateOfBirth: null }) })).toContain("Forms sheet is missing date of birth, emergency contact, insurance, a doctor");
  });

  it("says nothing about the forms sheet when nothing is missing", () => {
    const complete = member({ emergencyName: "Sam", emergencyPhone: "555", insurer: "Acme" });
    expect(render({ member: complete, providers: [provider()] })).not.toContain("Forms sheet is missing");
  });

  it("shows the next visit in words, and skips one that has passed or that belongs to someone else", () => {
    expect(render({ visits: [visit({ visitOn: "2026-09-09" })] })).toContain("Next visit Yearly checkup with Dr. Patel, in 2 days");
    expect(render({ visits: [visit({ visitOn: "2026-08-01" }), visit({ id: "x", familyMemberId: "m2", visitOn: "2026-09-09" })] })).not.toContain("Next visit");
  });

  it("shows the latest symptom with a US date", () => {
    const out = render({ events: [event({ onsetAt: "2026-08-01", description: "Rash" }), event({ id: "e2", onsetAt: "2026-09-01" })] });
    expect(out).toContain("Latest symptom Fever, 09/01/2026");
  });
});
