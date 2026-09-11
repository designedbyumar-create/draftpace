import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Regression guard for the public-experience correction pass
 * (docs/PUBLIC-EXPERIENCE-CORRECTION.md). Scans every customer-facing
 * marketing and authentication source file so a banned word, an em dash, or
 * internal-architecture language leaking into copy fails the test suite
 * instead of shipping unnoticed.
 *
 * Scope is deliberately limited to public/auth surfaces, not /app or /admin
 * (which are unaffected by this pass and use their own internal language).
 */

const SCAN_ROOTS = [
  "src/app/(marketing)",
  "src/app/(auth)",
  "src/app/reset-password",
  "src/app/auth",
  "src/components/public",
  "src/content",
  // The real (non-fixture) Shop listing content — customer-facing product
  // copy, not the registry/definition machinery, so not all of src/shop.
  "src/shop/products",
];

const EXTENSIONS = [".tsx", ".ts"];

function collectFiles(root: string): string[] {
  const absolute = join(process.cwd(), root);
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (EXTENSIONS.includes(entry.slice(entry.lastIndexOf("."))) && !entry.endsWith(".test.ts")) {
        files.push(full);
      }
    }
  };
  walk(absolute);
  return files;
}

const FILES = SCAN_ROOTS.flatMap(collectFiles);

// "studio" and "living product(s)" within 60 characters of each other,
// either order, case-insensitive: wide enough to catch "a studio ...
// living products" and "living products ... studio" phrasings, narrow
// enough that the two words appearing in unrelated parts of a much
// longer file would not trip it. Module scope because two separate
// describe blocks below both need it.
const TAGLINE_SHAPE = /studio[\s\S]{0,60}?living products?|living products?[\s\S]{0,60}?studio/i;

describe("public/auth copy has no em dashes", () => {
  for (const file of FILES) {
    const relative = file.replace(process.cwd() + "/", "");
    it(`${relative} contains no em dash character`, () => {
      const source = readFileSync(file, "utf-8");
      expect(source.includes("—")).toBe(false);
    });
  }
});

const BANNED_WORDS = [
  // "calm" is banned on two grounds: the founder rejected it as the
  // product's adjective, and Calm is a large meditation brand, so it is a
  // collision as well as a taste problem. Copy leads on behaviour instead
  // ("it never tells you that you are behind"), which is a promise the
  // suite can actually enforce. Use "quiet" where an adjective is needed.
  "calm",
  "seamless",
  "frictionless",
  "robust",
  "revolutionary",
  "empower",
  "unlock",
  "supercharge",
  "optimize",
  "all-in-one",
  "actionable insights",
  "purpose-built",
  "product families",
  "product ecosystem",
  "digital products",
  "made for modern life",
  "transform your journey",
];

describe("public/auth copy avoids generic SaaS marketing language", () => {
  for (const file of FILES) {
    const relative = file.replace(process.cwd() + "/", "");
    it(`${relative} contains no banned marketing words`, () => {
      const source = readFileSync(file, "utf-8").toLowerCase();
      for (const word of BANNED_WORDS) {
        expect(source.includes(word)).toBe(false);
      }
    });
  }
});

const FABRICATED_CLAIM_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: "star rating glyph", pattern: /★|☆/ },
  { name: "numeric star rating (e.g. \"4.8 out of 5\")", pattern: /\d(\.\d)?\s*(out of|\/)\s*5/i },
  { name: "customer/user count claim", pattern: /\b[\d,]+\+?\s*(customers|users|people)\s+(trust|love|use|joined)/i },
  { name: "bestseller badge", pattern: /bestseller/i },
  { name: "testimonial marker", pattern: /testimonial/i },
  { name: "Gumroad reference", pattern: /gumroad/i },
  { name: "Etsy reference", pattern: /etsy/i },
];

describe("public/auth copy has no fabricated social proof", () => {
  for (const file of FILES) {
    const relative = file.replace(process.cwd() + "/", "");
    it(`${relative} contains no fabricated ratings, counts, or testimonials`, () => {
      const source = readFileSync(file, "utf-8");
      for (const { pattern } of FABRICATED_CLAIM_PATTERNS) {
        expect(pattern.test(source)).toBe(false);
      }
    });
  }
});

describe("primary navigation avoids internal-architecture language", () => {
  it("PublicNav does not expose family/platform classification as a nav label", () => {
    const source = readFileSync(join(process.cwd(), "src/components/public/PublicNav.tsx"), "utf-8");
    expect(/label:\s*"[^"]*platform[^"]*"/i.test(source)).toBe(false);
    expect(/label:\s*"[^"]*product famil[^"]*"/i.test(source)).toBe(false);
  });

  it("PublicFooter does not expose family/platform classification as a link label", () => {
    const source = readFileSync(join(process.cwd(), "src/components/public/PublicFooter.tsx"), "utf-8");
    expect(/label:\s*"[^"]*platform[^"]*"/i.test(source)).toBe(false);
    expect(/label:\s*"[^"]*product famil[^"]*"/i.test(source)).toBe(false);
  });
});

/**
 * The homepage leads with what these products are for, not with the
 * format argument.
 *
 * This previously asserted the opposite: an H1 of "A studio for living
 * products" and a supporting paragraph about files. That positioning was
 * correct when the shelf was one product competing with template
 * sellers, and it was deliberately replaced once the catalogue became
 * seven products across six life areas. The format claim ("most things
 * you buy online die on download") is not banned, it is demoted: it
 * survives as one supporting line further down the page, and must never
 * climb back into the hero.
 */
describe("homepage leads with the domain, not the format argument", () => {
  const source = () => readFileSync(join(process.cwd(), "src/app/(marketing)/page.tsx"), "utf-8");

  it("names the Companion Series rather than positioning Draftpace as a studio", () => {
    expect(source().includes("The Companion Series")).toBe(true);
    expect(source().includes("A studio for living products")).toBe(false);
  });

  it("puts the life-area picker in the hero, so products are visible immediately", () => {
    expect(source().includes("CompanionPicker")).toBe(true);
    expect(source().includes("LIFE_AREAS")).toBe(true);
  });

  it("leads the hero with what the products are for", () => {
    expect(source().includes("parts of life that are hard to keep track of")).toBe(true);
  });

  it("keeps the anti-guilt promise on the page, since it is the behavioural claim the products are tested against", () => {
    expect(source().includes("never tells you that you are behind")).toBe(true);
  });
});

/**
 * The "studio for living products" positioning tagline, specifically,
 * regardless of which file it turns up in.
 *
 * Scoped to the combined phrase rather than to "studio" or "living
 * product(s)" as individual banned words on purpose: "living product" by
 * itself is a real, still-current concept (the static-file-vs-living
 * comparison in LivingProductHero, TrustSection, /how-it-works), kept
 * deliberately when the hero positioning was demoted, per the test above.
 * A bare word ban would fail on that legitimate copy. What actually keeps
 * recurring is the two words together as a company-positioning claim: it
 * shipped once in the homepage H1 (caught above), once more in
 * PublicFooter's tagline, and once more in organizationStructuredData's
 * description, each a separate file the other checks in this suite never
 * touched. This regex catches the shape itself, anywhere it appears, so a
 * fourth copy cannot ship unnoticed the same way.
 */
describe("the 'studio for living products' tagline never comes back", () => {
  // The one deliberate exception: the case study quotes its own retired
  // headline verbatim as a labeled "Before" artifact with real commit
  // provenance (see REPOSITION.before in casestudy/content.ts), telling
  // the story of the repositioning rather than repeating the claim. That
  // is the phrase's entire remaining reason to exist in the codebase, so
  // excluding it here (rather than loosening the regex) keeps the guard
  // strict everywhere the phrase would actually be a live regression.
  const EXEMPT = ["src/app/(marketing)/casestudy/content.ts"];

  for (const file of FILES) {
    const relative = file.replace(process.cwd() + "/", "");
    if (EXEMPT.includes(relative)) continue;
    it(`${relative} does not combine "studio" with "living product(s)"`, () => {
      const source = readFileSync(file, "utf-8");
      expect(TAGLINE_SHAPE.test(source)).toBe(false);
    });
  }
});

/**
 * structuredData.ts's builders are not in SCAN_ROOTS (it is a src/lib
 * utility file, most of which is genuinely internal and not customer
 * copy), but every string in it is rendered as JSON-LD straight into
 * pages Google and AI crawlers read, which makes it exactly the kind of
 * output this whole suite exists to guard. Checked narrowly, by name,
 * rather than by adding all of src/lib to the sweep, since most of that
 * directory (currency.ts, server-auth.ts, ...) is internal utility code
 * whose comments are not held to marketing-copy rules.
 */
describe("structured data (JSON-LD) follows the same copy rules as the page it's on", () => {
  const source = () => readFileSync(join(process.cwd(), "src/lib/structuredData.ts"), "utf-8");

  it("contains no em dash", () => {
    expect(source().includes("—")).toBe(false);
  });

  it("contains no banned marketing words", () => {
    const lower = source().toLowerCase();
    for (const word of BANNED_WORDS) {
      expect(lower.includes(word)).toBe(false);
    }
  });

  it('does not combine "studio" with "living product(s)"', () => {
    expect(TAGLINE_SHAPE.test(source())).toBe(false);
  });
});
