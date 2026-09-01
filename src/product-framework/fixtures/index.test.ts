import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// registerDevFixtures() is idempotent via a module-level flag, so each test
// needs its own fresh module graph to observe different environment
// conditions. vi.resetModules() means the registry itself must also be
// re-imported fresh each time — reusing a statically-imported registry here
// would silently point at a different singleton than the one the freshly
// imported registerDevFixtures() actually wrote to.
async function loadFreshFixtureModules() {
  vi.resetModules();
  const [{ registerDevFixtures }, { productRegistry }] = await Promise.all([
    import("./index"),
    import("../registry"),
  ]);
  return { registerDevFixtures, productRegistry };
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("registerDevFixtures", () => {
  it("registers all four fixtures, each clearly labeled, when fixtures are enabled", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { registerDevFixtures, productRegistry } = await loadFreshFixtureModules();

    registerDevFixtures();

    const slugs = productRegistry.list().map((product) => product.slug);
    expect(slugs.sort()).toEqual(
      [
        "internal-companion-fixture",
        "internal-learning-fixture",
        "internal-automation-fixture",
        "internal-workspace-fixture",
      ].sort()
    );
    for (const product of productRegistry.list()) {
      expect(product.devFixture).toBe(true);
      expect(product.title.startsWith("Internal ")).toBe(true);
      expect(product.access.model).toBe("free");
    }
  });

  it("registers nothing in production without the explicit opt-in", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEV_FIXTURES", "");
    const { registerDevFixtures, productRegistry } = await loadFreshFixtureModules();

    registerDevFixtures();

    expect(productRegistry.list()).toHaveLength(0);
  });

  it("is idempotent — calling it twice never throws on re-registration", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { registerDevFixtures, productRegistry } = await loadFreshFixtureModules();

    registerDevFixtures();
    expect(() => registerDevFixtures()).not.toThrow();
    expect(productRegistry.list()).toHaveLength(4);
  });

  it("gives each fixture a distinct family and navigation subset", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { registerDevFixtures, productRegistry } = await loadFreshFixtureModules();
    registerDevFixtures();

    const families = productRegistry.list().map((product) => product.family);
    expect(new Set(families).size).toBe(4);

    const navigationShapes = productRegistry.list().map((product) => product.navigation.join(","));
    expect(new Set(navigationShapes).size).toBe(4);
  });
});
