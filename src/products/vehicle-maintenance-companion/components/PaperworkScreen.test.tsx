import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PaperworkScreen, { type PaperworkScreenProps } from "./PaperworkScreen";
import { evaluateRenewal } from "../renewals";
import { renewal, vehicle } from "../testFixtures";

const TODAY = "2026-09-21";
const v = vehicle({ plate: "7ABC123", insurer: "Acme Mutual" });
const entries = [
  evaluateRenewal(renewal({ id: "a", kind: "insurance", dueOn: "2026-09-09", whereKept: "Blue folder" }), v, TODAY),
  evaluateRenewal(renewal({ id: "b", kind: "registration", dueOn: "2026-10-03" }), v, TODAY),
  evaluateRenewal(renewal({ id: "c", kind: "other", label: "Parking permit", dueOn: "2027-03-01", note: "Renew online" }), v, TODAY),
];

function render(over: Partial<PaperworkScreenProps> = {}) {
  const props: PaperworkScreenProps = {
    available: true,
    vehicles: [{ vehicle: v, entries }],
    detailsOpenId: null,
    onOpenDetails: () => {},
    renderDetailsForm: () => "DETAILSFORM",
    renewalFormKey: null,
    onOpenRenewalForm: () => {},
    renderRenewalForm: (_v, e) => `RENEWALFORM:${e?.renewal.id ?? "new"}`,
    onRemoveRenewal: () => {},
    removingId: null,
    onPrintCard: () => {},
    printingId: null,
    notice: null,
    ...over,
  };
  return renderToStaticMarkup(<PaperworkScreen {...props} />).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

describe("Paperwork", () => {
  it("lists each date in words with how far away it is, where the paper is kept, and a person's own name for an other", () => {
    const text = render();
    expect(text).toContain("Insurance 12 days ago, 2026-09-09");
    expect(text).toContain("Kept: Blue folder");
    expect(text).toContain("Registration In 12 days, 2026-10-03");
    expect(text).toContain("Parking permit In 161 days, 2027-03-01");
    expect(text).toContain("Renew online");
  });

  it("shows the glove box details that were typed, and none of the ones that were not", () => {
    const text = render();
    expect(text).toContain("Registration plate 7ABC123");
    expect(text).toContain("Insurer Acme Mutual");
    expect(text).not.toContain("VIN");
    expect(text).toContain("Change details");
  });

  it("says what belongs on the card when nothing is recorded yet", () => {
    const empty = vehicle({ id: "v9", label: "Van" });
    const text = render({ vehicles: [{ vehicle: empty, entries: [] }] });
    expect(text).toContain("No dates recorded for this vehicle yet.");
    expect(text).toContain("Nothing recorded yet. Registration plate, VIN, tire size, oil, insurance and a roadside number all go on the card.");
    expect(text).toContain("Add details");
  });

  it("never says what any place requires, or that anything is late in law", () => {
    expect(render()).not.toMatch(/required by law|legal|illegal|fine|penalt|must be renewed|expired/i);
  });

  it("puts a form in place for a change, a new date, and the details", () => {
    expect(render({ renewalFormKey: "b" })).toContain("RENEWALFORM:b");
    expect(render({ renewalFormKey: `new:${v.id}` })).toContain("RENEWALFORM:new");
    expect(render({ detailsOpenId: v.id })).toContain("DETAILSFORM");
  });

  it("says so, without alarm, when the dates could not be loaded, and does not claim there are none", () => {
    const text = render({ available: false, vehicles: [{ vehicle: v, entries: [] }] });
    expect(text).toContain("could not be loaded right now. Nothing has been lost");
    expect(text).not.toContain("No dates recorded for this vehicle yet.");
  });

  it("prints the card for one vehicle, and shows a notice when that fails", () => {
    expect(render()).toContain("Print the glove box card");
    expect(render({ printingId: v.id })).toContain("Preparing...");
    expect(render({ notice: "The document could not be made. Nothing was downloaded." })).toContain("Nothing was downloaded.");
  });
});
