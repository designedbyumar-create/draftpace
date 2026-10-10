/**
 * Guards for the situation carousels (director/carousel.ts): every word is
 * a real line from the product's listing or the guide that covers the
 * moment, every carousel opens on a moment people search for and teaches
 * something before it shows the product, and nothing sells before launch.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { planCarousels, artText, carouselCopy, resolveCarouselSource, POINTS_ELSEWHERE, CAROUSEL_MICROCOPY, CAROUSELS_PER_PRODUCT, type Carousel, type Slide } from "../director/carousel";
import { guideBySlug, guideSourceLinks, productForGuide } from "../director/guide";
import { SHOP_LISTINGS } from "../src/shop-listings";
import { MOTIFS } from "../src/visual/illustrations";
import { MOTIF_WORDS, MAX_RUN, MIN_SCORE, rankMotifs } from "../director/illustration";

const ROOT = path.resolve(import.meta.dirname, "..");
const carousels = planCarousels();
const slidesOf = <K extends Slide["kind"]>(car: Carousel, kind: K) => car.slides.filter((s): s is Extract<Slide, { kind: K }> => s.kind === kind);
const words = (t: string) => t.trim().split(/\s+/).length;

describe("Situation carousels", () => {
  it("are five for every product, none sharing a guide with another of the same product", () => {
    for (const product of Object.keys(SHOP_LISTINGS)) {
      const mine = carousels.filter((c) => c.product === product);
      expect(mine.length, `${product} has ${mine.length} carousels`).toBe(CAROUSELS_PER_PRODUCT);
      expect(new Set(mine.map((c) => c.guide)).size, `${product} teaches from one guide twice`).toBe(mine.length);
    }
  });

  it("show only real words: each is the line its source names, or one of the reviewed connective words", () => {
    for (const car of carousels) {
      for (const copy of carouselCopy(car)) {
        if (copy.source === "micro") {
          expect(CAROUSEL_MICROCOPY as readonly string[], `${car.id}: "${copy.text}" is not reviewed microcopy`).toContain(copy.text);
          continue;
        }
        expect(resolveCarouselSource(car.product, copy.source), `${car.id}: "${copy.text}" is not what ${copy.source} says`).toBe(copy.text);
      }
    }
  });

  it("open on a real moment from the listing and teach from the guide the listing links it to, or one that hands over to this product", () => {
    for (const car of carousels) {
      const [cover] = car.slides;
      expect(cover.kind, `${car.id} does not open on its cover`).toBe("cover");
      if (cover.kind !== "cover") continue;
      expect(cover.quote.source, `${car.id} opens on something other than its moment`).toBe(car.situation);
      expect(car.situation).toMatch(/^(searchedProblems\[\d+\]\.phrase|problemsSolved\[\d+\]\.problem)$/);
      const linked = car.situation.startsWith("searchedProblems") ? SHOP_LISTINGS[car.product].searchedProblems![Number(car.situation.match(/\d+/)![0])].guideSlug : undefined;
      if (linked) expect(car.guide, `${car.id} teaches from a guide its listing line does not link`).toBe(linked);
      else expect(productForGuide(car.guide).product, `${car.id}'s guide hands over to another product`).toBe(car.product);
      for (const w of cover.emphasis) expect(cover.quote.text.includes(w), `${car.id}: accent "${w}" is not in the cover`).toBe(true);
    }
  });

  it("teach before they show the product, and end on the free guide", () => {
    for (const car of carousels) {
      const kinds = car.slides.map((s) => s.kind);
      const helpAt = kinds.indexOf("help");
      expect(kinds.slice(1, helpAt).filter((k) => k === "step" || k === "checklist").length, `${car.id} shows the product before teaching anything`).toBeGreaterThanOrEqual(1);
      expect(kinds.filter((k) => k === "help").length, `${car.id}: one slide about the product`).toBe(1);
      expect(kinds.at(-1), `${car.id} does not end on the guide`).toBe("close");
      const close = slidesOf(car, "close")[0];
      expect(close.url.source).toBe(`guide:${car.guide}/url`);
      expect(car.slides.length, `${car.id}: ${car.slides.length} slides`).toBeGreaterThanOrEqual(5);
      expect(car.slides.length, `${car.id}: ${car.slides.length} slides`).toBeLessThanOrEqual(10);
    }
  });

  it("sell nothing before launch: product words are only its name and its own answer to the moment", () => {
    for (const car of carousels) {
      const listingSources = carouselCopy(car).map((c) => c.source).filter((s) => s !== "micro" && !s.startsWith("guide:"));
      const answer = car.situation.replace(/\.phrase$/, ".answer").replace(/\.problem$/, ".solution");
      for (const s of listingSources) expect(["title", car.situation, answer], `${car.id} uses ${s}`).toContain(s);
      const price = SHOP_LISTINGS[car.product].price;
      if (price) for (const c of carouselCopy(car).filter((x) => !x.source.startsWith("guide:"))) expect(c.text.includes(`$${price.amount}`), `${car.id} shows a price`).toBe(false);
    }
  });

  it("number steps as the guide numbers them, and never carry a sentence that pointed elsewhere in the guide", () => {
    for (const car of carousels) {
      for (const s of slidesOf(car, "step")) {
        if (s.number) expect(s.number.text, `${car.id}: step "${s.head.text}"`).toBe(String(Number(s.head.source.match(/items\[(\d+)\]/)![1]) + 1));
        for (const b of s.body) expect(guideSourceLinks(b.source), `${car.id}: "${b.text}" was a link`).toBe(false);
        expect(s.body.every((b) => b.source.startsWith(s.head.source.replace(/#\d+$/, ""))), `${car.id}: a step's explanation comes from another item`).toBe(true);
      }
    }
  });

  it("never point at a part of the guide the slide does not show (\"see the table below\")", () => {
    for (const car of carousels) {
      for (const c of carouselCopy(car).filter((x) => x.source.startsWith("guide:") && !x.source.endsWith("/title") && !x.source.endsWith("/dek") && !/\/dek#/.test(x.source))) {
        expect(POINTS_ELSEWHERE.test(c.text), `${car.id}: "${c.text}" points elsewhere in the guide`).toBe(false);
      }
    }
  });

    it("hold every slide to what reads on a phone", () => {
    for (const car of carousels) {
      for (const s of car.slides) {
        if (s.kind === "cover") expect(s.quote.text.length, `${car.id} cover`).toBeLessThanOrEqual(95);
        if (s.kind === "step") {
          expect(words(s.head.text), `${car.id}: "${s.head.text}"`).toBeLessThanOrEqual(24);
          expect(words(s.body.map((b) => b.text).join(" ")), `${car.id}: body under "${s.head.text}"`).toBeLessThanOrEqual(42);
        }
        if (s.kind === "checklist") {
          expect(s.items.length, `${car.id} checklist`).toBeLessThanOrEqual(6);
          for (const i of s.items) expect(words(i.text), `${car.id}: "${i.text}"`).toBeLessThanOrEqual(16);
        }
      }
    }
  });

  it("show the product's own real screen", () => {
    for (const car of carousels) {
      const help = slidesOf(car, "help")[0];
      if (help.ui.kind !== "screen") continue;
      expect(help.ui.src.startsWith(`screens/${car.product}-`), `${car.id} shows ${help.ui.src}`).toBe(true);
      expect(fs.existsSync(path.join(ROOT, "public", help.ui.src)), `${help.ui.src} is not on disk`).toBe(true);
    }
  });

  it("illustrate every slide but the product's own with a drawing that exists, chosen for a stated reason", () => {
    expect(Object.keys(MOTIF_WORDS).sort(), "every illustration the matcher can pick is drawn, and every drawing can be picked").toEqual([...MOTIFS].sort());
    for (const car of carousels) {
      for (const [i, s] of car.slides.entries()) {
        if (s.kind === "help") { expect("art" in s, `${car.id}: the product slide shows its real screen, not a drawing`).toBe(false); continue; }
        expect(s.art, `${car.id} slide ${i + 1} (${s.kind}) has no illustration`).toBeDefined();
        expect(MOTIFS, `${car.id} slide ${i + 1}: no drawing "${s.art!.motif}"`).toContain(s.art!.motif);
        if (s.art!.also) expect(MOTIFS).toContain(s.art!.also);
        expect(s.art!.why.length, `${car.id} slide ${i + 1}: no reason recorded`).toBeGreaterThan(10);
      }
      expect(car.slides[0].kind === "cover" && car.slides[0].art?.also, `${car.id}: the cover's scene has one picture`).toBeTruthy();
    }
  });

  it("give a slide the picture its words name, and never more than two slides in a row the same picture", () => {
    for (const car of carousels) {
      let prev: string | undefined, run = 0;
      for (const s of car.slides) {
        if (s.kind === "help") { prev = undefined; run = 0; continue; }
        run = s.art!.motif === prev ? run + 1 : 1;
        prev = s.art!.motif;
        expect(run, `${car.id}: ${run} slides in a row show ${prev}`).toBeLessThanOrEqual(MAX_RUN);
        // A step or summary whose words name something drawable shows one of the things it names.
        if (s.kind === "step" || s.kind === "answer") {
          const text = artText(s);
          const named = rankMotifs(text).filter((r) => r.score >= MIN_SCORE).map((r) => r.motif);
          if (named.length && s.art!.why.startsWith("the slide names")) expect(named, `${car.id}: "${text.slice(0, 50)}" shows ${s.art!.motif}`).toContain(s.art!.motif);
        }
      }
    }
  });

  it("match the obvious cases: a phone call to the phone, a flight to the plane, a medicine to the bottle", () => {
    expect(rankMotifs("Call the airline from the queue.")[0].motif).toBe("phone");
    expect(rankMotifs("My flight is delayed and I have a connection")[0].motif).toBe("plane");
    expect(rankMotifs("List every medicine, vitamin and supplement from the labels.")[0].motif).toBe("pills");
    expect(rankMotifs("Let each child's pace and curriculum stay fully separate.")[0].motif, "a child's curriculum is schoolwork, not a hotel stay").toBe("books");
    expect(rankMotifs("Where the data plate hides on a fridge")[0].motif, "an appliance's data plate is not a car's number plate").toBe("bulb");
    expect(rankMotifs("Write it.").filter((r) => r.score >= MIN_SCORE), "one everyday word names no picture").toEqual([]);
  });

  it("are the carousels committed in shots/carousels: re-run `node scripts/carousels.mjs` after changing a listing, a guide or the planner", () => {
    for (const car of carousels) {
      const file = path.join(ROOT, "shots/carousels", car.product, `${car.id.replace(`car-${car.product}-`, "")}.carousel.json`);
      expect(fs.existsSync(file), `${file} is missing`).toBe(true);
      expect(JSON.parse(fs.readFileSync(file, "utf8")), `${car.id} is stale`).toEqual(car);
    }
    const generated = fs.readFileSync(path.join(ROOT, "src/carousels.generated.ts"), "utf8");
    expect([...generated.matchAll(/from "\.\.\/shots\/carousels\/(.+)\.carousel\.json"/g)].length, "src/carousels.generated.ts lists different carousels").toBe(carousels.length);
    // The guide each one teaches from still exists.
    for (const car of carousels) expect(() => guideBySlug(car.guide)).not.toThrow();
  });
});
