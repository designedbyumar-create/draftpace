import { describe, expect, it } from "vitest";
import { emptyServiceForm, parseServiceForm } from "./serviceForm";

const TODAY = "2026-09-21";
const form = (over = {}) => ({ ...emptyServiceForm({ taskName: "Oil change", today: TODAY, vehicleMileage: 50_000 }), ...over });

describe("parseServiceForm", () => {
  it("turns a filled form into what is saved, trimming and leaving blanks empty", () => {
    const result = parseServiceForm(form({ mileage: "50,400", shop: "  Main St Garage ", cost: "$120.50", note: "" }), TODAY);
    expect(result).toEqual({ ok: true, service: { taskName: "Oil change", doneOn: TODAY, mileage: 50_400, shop: "Main St Garage", costMinorUnits: 12050, note: null } });
  });

  it("starts from today and the vehicle's own mileage, and from nothing when there is none", () => {
    expect(form()).toMatchObject({ doneOn: TODAY, mileage: "50000" });
    expect(emptyServiceForm({ taskName: "", today: TODAY, vehicleMileage: null }).mileage).toBe("");
  });

  it("accepts a past day and today, and refuses a day that has not happened", () => {
    expect(parseServiceForm(form({ doneOn: "2025-01-05" }), TODAY).ok).toBe(true);
    expect(parseServiceForm(form({ doneOn: TODAY }), TODAY).ok).toBe(true);
    expect(parseServiceForm(form({ doneOn: "2026-09-22" }), TODAY)).toEqual({ ok: false, message: "A service cannot be dated after today." });
    expect(parseServiceForm(form({ doneOn: "" }), TODAY)).toEqual({ ok: false, message: "Choose the day it was done." });
  });

  it("needs a name for what was done", () => {
    expect(parseServiceForm(form({ taskName: "  " }), TODAY)).toEqual({ ok: false, message: "Say what was done." });
  });

  it("holds mileage to a whole number and cost to an amount, and lets both be empty", () => {
    expect(parseServiceForm(form({ mileage: "48k" }), TODAY).ok).toBe(false);
    expect(parseServiceForm(form({ mileage: "48200.5" }), TODAY).ok).toBe(false);
    expect(parseServiceForm(form({ cost: "free" }), TODAY).ok).toBe(false);
    const empty = parseServiceForm(form({ mileage: "", cost: "" }), TODAY);
    expect(empty).toMatchObject({ ok: true, service: { mileage: null, costMinorUnits: null } });
  });
});
