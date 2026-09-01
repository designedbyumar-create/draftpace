import { describe, expect, it } from "vitest";
import { validateProductDefinition } from "@/product-framework/definition";
import { familyRegistry, isCapabilitySupportedByFamily } from "@/product-framework/families";
import { resolveLifecycleNavigation, resolveProductNavigation } from "@/product-framework/navigationResolver";
import { homeschoolingCompanionDefinition } from "./definition";
import { homeschoolingCompanionCatalogEntry } from "./catalog";

const resolved = validateProductDefinition(homeschoolingCompanionDefinition);

describe("registration", () => {
  it("validates against the framework's own schema", () => {
    expect(resolved.slug).toBe("homeschooling-companion");
    expect(resolved.devFixture).toBe(false);
    expect(resolved.access.model).toBe("paid");
  });

  /**
   * The platform has had a `learning` family since the reset with nothing
   * in it. This is the product that proves a second family works end to
   * end, which is the whole reason the registry was built open.
   */
  it("is the first product in the learning family", () => {
    expect(resolved.family).toBe("learning");
    const family = familyRegistry.get("learning");
    expect(family).toBeDefined();
    for (const capability of resolved.capabilities) {
      expect(isCapabilitySupportedByFamily(family!, capability), capability).toBe(true);
    }
  });

  /**
   * registry.ts rejects a capability whose namespace does not match the
   * family, so this product cannot borrow companion.next-action however
   * much "today's next thing" sounds like one. Asserted so that a later
   * contributor who tries it finds out here rather than at runtime.
   */
  it("cannot borrow another family's capabilities", () => {
    const family = familyRegistry.get("learning")!;
    expect(isCapabilitySupportedByFamily(family, "companion.next-action")).toBe(false);
  });

  it("registers a module for every destination it declares", () => {
    const ids = Object.keys(homeschoolingCompanionCatalogEntry.moduleComponents);
    for (const entry of resolved.modules) {
      expect(ids, entry.destination).toContain(entry.id);
    }
  });
});

describe("navigation", () => {
  /**
   * Three, one per scope the product loop has: the household this
   * morning, one child, and across time. A fourth would mean two of them
   * overlap.
   */
  it("has exactly three primary destinations", () => {
    expect(resolved.primaryNavigation).toEqual(["workspace", "kids", "record"]);
  });

  it("calls the workspace Today, because that is the question it answers", () => {
    expect(resolved.workspaceLabel).toBe("Today");
  });

  it("keeps settings out of the primary three, since the loop never needs it", () => {
    expect(resolved.primaryNavigation).not.toContain("settings");
    expect(resolved.navigation).toContain("settings");
  });

  /**
   * Declaring "setup" with nothing calling setProductInstanceLifecycle
   * pins a product in resolveLifecycleNavigation's first state, which
   * renders one "Start" link to a destination it does not register.
   * Personal Finance Companion shipped that bug once.
   */
  it("declares no setup destination, so it can never pin itself on a dead Start link", () => {
    expect(resolveProductNavigation(resolved)).not.toContain("setup");
    const fresh = resolveLifecycleNavigation(resolved, { setupComplete: false, everTouched: false });
    expect(fresh.primary.map((item) => item.id)).not.toEqual(["start"]);
  });

  it("reaches every destination it declares from a fresh instance", () => {
    const nav = resolveLifecycleNavigation(resolved, { setupComplete: false, everTouched: true });
    const reachable = [...nav.primary, ...nav.secondary].map((item) => item.id);
    for (const destination of resolved.navigation) {
      expect(reachable, destination).toContain(destination);
    }
  });

  it("does not declare a library destination, because there is nothing behind one", () => {
    expect(resolved.navigation).not.toContain("library");
  });
});

describe("what this product refuses to say", () => {
  const surfaces = [resolved.title, resolved.tagline, resolved.pwa?.description ?? ""].join(" ").toLowerCase();

  /**
   * A homeschooling parent is already anxious about every one of these.
   * A product that supplies the vocabulary of comparison has taken a
   * side against the person paying for it.
   */
  for (const word of ["behind", "ahead", "grade level", "proficient", "failing"]) {
    it(`never says "${word}"`, () => {
      expect(surfaces).not.toContain(word);
    });
  }

  it("uses no em dash, per the repo content rule", () => {
    expect(`${resolved.title} ${resolved.tagline}`).not.toContain("—");
  });

  it("promises no notifications, because there is no evaluator", () => {
    expect(resolved.notifications.supported).toBe(false);
  });

  /**
   * The family's default progress model is "mastery", which is a
   * percentage by another name. This product reports per-topic standing
   * instead, including "not enough to say", so it opts out.
   */
  it("keeps a custom progress model rather than the family's mastery default", () => {
    expect(resolved.progressModel?.kind).toBe("custom");
    expect(familyRegistry.get("learning")?.progressModelKind).toBe("mastery");
  });
});

describe("visual identity", () => {
  /**
   * Covered up, four products must be tellable apart. Teal, clay, sage,
   * ink blue are taken.
   */
  it("does not reuse a sibling's accent", () => {
    const taken = ["#2f7d78", "#b5623a", "#4f7a5c", "#26374f"];
    expect(taken).not.toContain(resolved.theme.accent);
    expect(resolved.theme.accent).toBe("#6a4a72");
  });

  it("uses the rail, because its destinations are parallel questions and not steps", () => {
    expect(resolved.navigationStyle).toBe("rail");
  });
});
