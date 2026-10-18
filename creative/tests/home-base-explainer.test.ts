/**
 * Guards for the Home Base explainer (explainers/home-base): what the film
 * shows is what Home Base's own code answers. If a care template, the
 * scoring or the band limit changes, these fail and name what the film
 * would now be getting wrong.
 */
import { describe, expect, it } from "vitest";
import { homeBaseTruth } from "../explainers/home-base/truth";
// @ts-expect-error plain ESM module without types
import { makeFilm } from "../explainers/home-base/film.mjs";

const T = homeBaseTruth();
const at = (date: string) => T.visits.find((v) => v.date === date)!;
const ids = (list: { id: string }[]) => list.map((s) => s.id);

describe("Home Base explainer", () => {
  it("raises each job in the month its care template names", () => {
    expect(ids(at("2026-09-02").due), "September: the chimney and the furnace").toEqual(["chimney.sweep", "furnace.tune-up"]);
    expect(T.due, "the date each token rises").toEqual({
      "chimney.sweep": "2026-09-01", "furnace.tune-up": "2026-09-01", "irrigation.blowout": "2026-10-01",
      "hose-bib.winterize": "2026-10-01", "humidifier.pad": "2026-10-01", "gutter.clean": "2026-11-01",
    });
  });

  it("shows Home's own order, first four on Home and the rest under it", () => {
    const oct = at("2026-10-02");
    expect(ids(oct.onHome), "2 October, the rack's front row").toEqual(["hose-bib.winterize", "chimney.sweep", "irrigation.blowout", "furnace.tune-up"]);
    expect(ids(oct.behindShowAll), "2 October, the row behind").toEqual(["humidifier.pad"]);
    expect(ids(at("2026-11-02").onHome), "2 November").toEqual(["hose-bib.winterize", "furnace.tune-up", "gutter.clean", "humidifier.pad"]);
    expect(T.bandLimit).toBe(4);
  });

  it("ends on a home with nothing due", () => {
    expect(at("2026-12-01").due, "1 December: the flag goes up only if Home really says nothing needs you").toEqual([]);
  });

  it("never runs two tokens into each other on the rack", () => {
    const near = makeFilm(T).closest();
    expect(near.d, `${near.pair} at ${near.t.toFixed(2)}s`).toBeGreaterThanOrEqual(14);
  });
});
