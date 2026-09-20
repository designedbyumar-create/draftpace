import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PaidToggle, { paidDayLabel } from "./PaidToggle";

describe("PaidToggle", () => {
  it("offers to mark the named bill paid, unpressed", () => {
    const html = renderToStaticMarkup(<PaidToggle name="Rent" payment={undefined} onToggle={() => {}} />);
    expect(html).toContain('aria-label="Mark Rent as paid"');
    expect(html).toContain('aria-pressed="false"');
  });

  it("says the day it was paid, pressed, and that pressing it again undoes it", () => {
    const html = renderToStaticMarkup(<PaidToggle name="Rent" payment={{ id: "p", billId: "b", period: "2026-09", paidOn: "2026-09-05" }} onToggle={() => {}} />);
    expect(html).toContain('aria-label="Rent: Paid 5 Sep. Mark as not paid"');
    expect(html).toContain('aria-pressed="true"');
  });

  it("spells the paid day the same everywhere", () => {
    expect(paidDayLabel("2026-01-31")).toBe("Paid 31 Jan");
    expect(paidDayLabel("2026-12-01")).toBe("Paid 1 Dec");
  });
});
