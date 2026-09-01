import { describe, expect, it } from "vitest";
import { personalLifeAffairsCompanionDefinition as inOrder } from "./definition";
import { personalLifeAffairsCompanionCatalogEntry as catalogEntry } from "./catalog";
import { homeManagementCompanionDefinition } from "../home-management-companion/definition";
import { personalFinanceCompanionDefinition } from "../personal-finance-companion/definition";
import { validateProductDefinition } from "@/product-framework/definition";

/**
 * Locks in the decisions made in the design North Star, so later work
 * cannot quietly undo them. Each test below exists because of a specific
 * finding, not for coverage.
 */
describe("In Order, the product definition", () => {
  // Assertions below run against the resolved definition rather than the
  // raw input, because the framework applies defaults during validation
  // and only the resolved shape has navigation and modules guaranteed.
  const resolved = validateProductDefinition(inOrder);

  it("is a valid definition", () => {
    expect(() => validateProductDefinition(inOrder)).not.toThrow();
  });

  /**
   * 40% of people without a will say they do not have enough assets to
   * need one. Every one of these words confirms that belief and loses
   * them, so none may appear on a user-facing surface. "Overdue" is the
   * house rule inherited from Home Base.
   */
  it("never uses the words that lose the buyer", () => {
    const userFacing = [inOrder.title, inOrder.tagline, inOrder.workspaceLabel, inOrder.pwa?.description ?? ""]
      .join(" ")
      .toLowerCase();

    for (const banned of ["estate", "asset", "overdue", "death", "die", "deceased"]) {
      expect(userFacing, `user-facing copy must not say "${banned}"`).not.toContain(banned);
    }
  });

  /**
   * The P3 distinctiveness test, mechanised as far as it can be: cover
   * the labels and the products must not be recolours of each other.
   * A shared accent would mean the world was never built.
   */
  it("does not reuse either sibling's accent", () => {
    const mine = inOrder.theme?.accent;
    expect(mine).toBeTruthy();
    expect(mine).not.toBe(homeManagementCompanionDefinition.theme?.accent);
    expect(mine).not.toBe(personalFinanceCompanionDefinition.theme?.accent);
  });

  it("ships a full accent scale, since declaring an accent alone never re-themes anything", () => {
    // Home Base shipped a declared-but-unrendered accent for months. The
    // scale is what actually reaches --primary and friends.
    expect(inOrder.theme?.accentScale?.base).toBe(inOrder.theme?.accent);
    expect(inOrder.theme?.accentScale?.strong).toBeTruthy();
    expect(inOrder.theme?.accentScale?.soft).toBeTruthy();
    expect(inOrder.theme?.accentScale?.contrast).toBeTruthy();
  });

  /**
   * The defect found in Monthly Money Reset: a "Supported" badge for a
   * capability with no code behind it. This stays false until phase 8
   * builds the evaluator.
   */
  it("does not claim notification support before an evaluator exists", () => {
    expect(inOrder.notifications?.supported).toBe(false);
  });

  /**
   * The defect found in Home Base: every aggregate push deep-linked to a
   * destination the product had stopped declaring. A declared module
   * with no component, or a component with no module, is the same class
   * of bug caught earlier.
   */
  it("registers a component for every destination it declares", () => {
    const declared = resolved.modules.map((entry) => entry.id).sort();
    const registered = Object.keys(catalogEntry.moduleComponents).sort();
    expect(registered).toEqual(declared);

    for (const entry of resolved.modules) {
      expect(resolved.navigation, `${entry.destination} has a module but is not navigable`).toContain(
        entry.destination
      );
    }
  });

  it("declares no printable assets until real bytes exist", () => {
    // A download link with nothing behind it is the dishonest state this
    // repo's rule 8 forbids. Phase 7 adds these.
    expect(catalogEntry.printableAssets ?? []).toHaveLength(0);
  });

  /**
   * Four destinations, each answering a different question. The count
   * matters: a fifth would mean two of them overlap, and the moment a
   * person cannot say what separates them the navigation has stopped
   * being navigation and become a menu.
   */
  it("has exactly four primary destinations, one per question the product answers", () => {
    expect(resolved.primaryNavigation).toEqual(["workspace", "affairs", "printables", "history"]);
    expect(resolved.navigation.length).toBeLessThanOrEqual(6);
  });

  it("never shows a person the internal name, which described a state rather than a job", () => {
    const labels = [
      resolved.workspaceLabel,
      ...Object.values(resolved.destinationLabels ?? {}),
    ];
    expect(labels).toContain("Next");
    for (const label of labels) expect(label).not.toBe("In Order");
  });

  it("keeps settings out of the primary four, since the loop never needs it", () => {
    expect(resolved.primaryNavigation).not.toContain("settings");
    expect(resolved.navigation).toContain("settings");
  });
});
