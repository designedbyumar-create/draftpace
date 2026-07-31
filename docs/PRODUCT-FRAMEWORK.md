# Product Framework

Everything here lives under `src/product-framework/`. It replaces the old
`src/lib/systems/*` engine, which was presented as generic but actually
hardcoded Companion-only vocabulary (`paths`, `rhythmOptions`,
`companionTone`) into what should have been a neutral contract.

## Design rule: no family switch statements

`ProductFamilyId` and `ProductCapabilityId` are **validated strings**, not
closed TypeScript unions. Nothing in the shell, the shell components, or the
framework does `switch (family) { case "companion": ... }`. Instead:

- Families are **registered data** (`ProductFamilyDefinition`), each
  declaring which capabilities and default navigation it supports.
- Capabilities are **namespaced strings** (`"<family>.<capability>"`, e.g.
  `companion.next-action`, `learning.lesson`, `automation.trigger`,
  `workspace.structured-input`, `tracker.recurring-entry`). A small set of
  "known core" capabilities is documented as constants for editor
  autocomplete and typo-catching, but the registry accepts any string
  matching the namespaced pattern — a brand-new family can register its own
  capabilities without editing this framework.
- The universal product shell reads a product's declared `capabilities` and
  `navigation` and composes UI from a **module registry**
  (`registry.get(moduleId)`), never a hardcoded per-family branch.

## Files

| File | Responsibility |
|---|---|
| `capabilities.ts` | Namespaced capability id validation + documented "known core" constants per family |
| `families.ts` | `FamilyRegistry` + the six initial family definitions (data, not logic) |
| `destinations.ts` | The six canonical product destinations (`start, setup, workspace, progress, history, settings`) + support for family-registered extra destinations (e.g. `learning.lessons`, `automation.runs`) |
| `definition.ts` | The `ProductDefinition` Zod schema and inferred TS type — the product-definition contract |
| `registry.ts` | `ProductRegistry` — register/get/list, enforces validation, uniqueness, and fixture exclusion |
| `versionResolver.ts` | Resolves a slug (+ optional version) to a definition |
| `navigationResolver.ts` | Resolves which destinations a product actually shows, and the family-aware Workspace label |
| `moduleRegistry.ts` | Contract for registering custom per-product UI modules (empty in Phase 1 — no real modules exist yet) |
| `themeExtension.ts` | Typed, scoped product theme-token contract (accent, data-viz palette, motion personality, content width) — never global CSS |
| `environment.ts` | Single source of truth for launch mode + dev-fixture + admin-enabled checks, shared by `middleware.ts` and the framework |
| `fixtures/` | The four internal development fixtures (`DATA-BOUNDARIES.md`) |

## The product-definition contract

See `definition.ts` for the authoritative Zod schema. Summary of what it can
declare: stable id, slug, title, family, semver version, publication status,
access/entitlement model, capabilities, navigation, start route, setup
requirements, a *reference* to a data schema (never inline data), module
registrations, permissions, emitted events, a theme extension, supported
layouts, offline behavior, notification support, a progress-model reference,
history support, settings sections, and a migration/version-compatibility
policy.

It deliberately **cannot** hold sensitive user data or executable secrets —
there is no field for either, by design, not by convention.

## Registering a new product family

1. Add a `ProductFamilyDefinition` to `families.ts` (id, label, description,
   `supportedCapabilities`, `defaultNavigation`, `progressModelKind`,
   optional `defaultWorkspaceLabel`).
2. If it needs capabilities beyond the documented "known core" set, use any
   string matching `^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$` namespaced to the
   family — no framework file needs editing for this to work.
3. Nothing else changes. The shell, registry, and resolvers already handle
   any registered family the same way.

## Registering a new product

1. Build a `ProductDefinition` object.
2. Validate + register it: `productRegistry.register(definition)`.
3. It becomes reachable at `/app/products/[slug]/...` automatically, with
   navigation resolved from its declared `navigation` (or the family default
   if empty) and its Workspace destination labeled per `workspaceLabel` or
   the family's `defaultWorkspaceLabel`.

## Registering a custom module

`moduleRegistry.register(id, Component)` accepts a typed React component
keyed by a module id referenced from a product definition's `modules` list.
Phase 1 ships the registry with nothing registered — this is a contract
proof, not a working module system yet.

## Theme isolation

A product's `theme` extension produces **scoped CSS custom properties**
(applied only inside that product's shell root, via `themeExtension.ts`'s
`productThemeStyle()`), never global stylesheet rules. It cannot override
platform accessibility settings, inject arbitrary CSS, introduce a second
icon library, or change platform/auth navigation.
