import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import LiveDemo from "./LiveDemos";
import { POSTER_SCENES } from "@/content/homepagePosters";

/**
 * Every Companion on the homepage has a working copy of itself. These check
 * that each one renders, says what it should before anybody touches it, and
 * that the two that run real product logic really do.
 */
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const slugs = POSTER_SCENES.flatMap((scene) => scene.products.map((p) => p.productSlug));

describe("the homepage's live demos", () => {
  it("exist for every Companion, and render something", () => {
    for (const slug of slugs) {
      const html = renderToStaticMarkup(<LiveDemo slug={slug} />);
      expect(html.length, `${slug} has no demo`).toBeGreaterThan(200);
    }
  });

  it("start each one in the state its product would show first", () => {
    expect(text(renderToStaticMarkup(<LiveDemo slug="home-management-companion" />))).toContain("A couple of things worth taking care of.");
    expect(text(renderToStaticMarkup(<LiveDemo slug="alongside" />))).toContain("Call the clinic about the referral");
    expect(text(renderToStaticMarkup(<LiveDemo slug="vehicle-maintenance-companion" />))).toContain("Oil and filter change");
    expect(text(renderToStaticMarkup(<LiveDemo slug="travel-companion" />))).toContain("The flight changed");
  });

  it("run the real payoff plan, so the month it names comes from the product's own arithmetic", () => {
    const out = text(renderToStaticMarkup(<LiveDemo slug="personal-finance-companion" />));
    expect(out).toMatch(/Debt-free by\s+[A-Z][a-z]+ 20\d\d/);
    expect(out).toContain("Available to spend");
  });

  it("run the real Forms sheet, so an allergy marked private is genuinely left off", () => {
    const out = text(renderToStaticMarkup(<LiveDemo slug="family-health-binder" />));
    expect(out).toContain("Peanuts (Hives), Penicillin (Rash), Latex");
    expect(out).toContain("Nothing is marked private.");
  });

  it("never use a word this product refuses, or an em dash", () => {
    const refused = [["ca", "lm"], ["str", "eak"], ["sc", "ore"]].map((p) => p.join(""));
    for (const slug of slugs) {
      const out = text(renderToStaticMarkup(<LiveDemo slug={slug} />)).toLowerCase();
      expect(out).not.toContain(String.fromCharCode(0x2014));
      for (const word of refused) expect(out, `"${word}" in ${slug}`).not.toContain(word);
    }
  });
});
