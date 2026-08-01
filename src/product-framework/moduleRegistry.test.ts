import { describe, expect, it } from "vitest";
import { moduleRegistry, resolveProductModule } from "./moduleRegistry";
import { validateProductDefinition } from "./definition";

function definitionWithModules(modules: { id: string; destination?: string }[]) {
  return validateProductDefinition({
    id: "module-test-product",
    slug: "module-test-product",
    title: "Module Test Product",
    family: "companion",
    version: "0.1.0",
    status: "draft",
    access: { model: "free" },
    modules,
  });
}

describe("resolveProductModule", () => {
  it("returns undefined when the product declares no module for the destination", () => {
    const definition = definitionWithModules([]);
    expect(resolveProductModule(definition, "workspace")).toBeUndefined();
  });

  it("returns undefined when a module id is declared but never registered", () => {
    const definition = definitionWithModules([{ id: "unregistered.module", destination: "workspace" }]);
    expect(resolveProductModule(definition, "workspace")).toBeUndefined();
  });

  it("returns the registered component when the destination matches", () => {
    const Component = () => null;
    moduleRegistry.register("module-registry-test.start", Component);
    const definition = definitionWithModules([{ id: "module-registry-test.start", destination: "start" }]);
    expect(resolveProductModule(definition, "start")).toBe(Component);
    expect(resolveProductModule(definition, "workspace")).toBeUndefined();
  });
});
