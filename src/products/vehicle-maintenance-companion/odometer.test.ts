import { describe, expect, it } from "vitest";
import { odometerDigits, shortDay } from "./odometer";

describe("odometerDigits", () => {
  it("pads to six cells and marks where the number starts", () => {
    expect(odometerDigits(50_400)).toEqual({ digits: ["0", "5", "0", "4", "0", "0"], lead: 1 });
    expect(odometerDigits(312)).toEqual({ digits: ["0", "0", "0", "3", "1", "2"], lead: 3 });
  });

  it("never drops a digit from a number that is longer than the cells", () => {
    expect(odometerDigits(1_234_567).digits.join("")).toBe("1234567");
    expect(odometerDigits(1_234_567).lead).toBe(0);
  });

  it("shows zero as a single lit digit, and never a negative or fractional one", () => {
    expect(odometerDigits(0)).toEqual({ digits: ["0", "0", "0", "0", "0", "0"], lead: 5 });
    expect(odometerDigits(-5).digits.join("")).toBe("000000");
    expect(odometerDigits(50_400.9).digits.join("")).toBe("050400");
  });
});

describe("shortDay", () => {
  it("leaves the year off for this year and puts it on for any other", () => {
    expect(shortDay("2026-08-01", "2026-09-21")).toBe("1 Aug");
    expect(shortDay("2025-12-31", "2026-09-21")).toBe("31 Dec 2025");
  });
});
