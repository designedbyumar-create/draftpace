import { productRegistry } from "../registry";
import { areDevFixturesEnabled } from "../environment";
import { internalCompanionFixture } from "./companion";
import { internalLearningFixture } from "./learning";
import { internalAutomationFixture } from "./automation";
import { internalWorkspaceFixture } from "./workspace";

const FIXTURES = [
  internalCompanionFixture,
  internalLearningFixture,
  internalAutomationFixture,
  internalWorkspaceFixture,
];

let registered = false;

/**
 * Registers the four internal architecture fixtures through the exact same
 * `productRegistry.register()` a real product would use — there is no
 * separate fixture code path. A no-op when dev fixtures are disabled
 * (production, unless explicitly opted in — see environment.ts), and
 * idempotent so repeated calls (e.g. multiple route renders importing this
 * module) never throw on re-registration.
 */
export function registerDevFixtures(): void {
  if (registered) return;
  registered = true;

  if (!areDevFixturesEnabled()) return;

  for (const fixture of FIXTURES) {
    if (!productRegistry.getBySlug(fixture.slug as string)) {
      productRegistry.register(fixture);
    }
  }
}
