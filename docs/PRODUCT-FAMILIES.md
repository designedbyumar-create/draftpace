# Product Families

Six initial families are registered in `src/product-framework/families.ts`.
This list is not closed — see `PRODUCT-FRAMEWORK.md` for how a new family
registers itself without modifying the shell.

| Family id | Label | Example known-core capabilities | Default navigation | Progress model |
|---|---|---|---|---|
| `companion` | Companion | `companion.next-action`, `companion.momentum`, `companion.recovery`, `companion.milestones`, `companion.outcomes`, `companion.context` | start, setup, workspace, progress, history, settings | `momentum` |
| `learning` | Learning | `learning.module`, `learning.lesson`, `learning.activity`, `learning.assessment`, `learning.mastery`, `learning.completion`, `learning.certificate` | start, setup, workspace, progress, history | `mastery` |
| `automation` | Automation | `automation.trigger`, `automation.condition`, `automation.action`, `automation.schedule`, `automation.run`, `automation.run-history`, `automation.retry`, `automation.failure`, `automation.permission` | start, setup, workspace, history, settings | `run-health` |
| `workspace` | Tool / Workspace | `workspace.structured-input`, `workspace.calculation`, `workspace.output`, `workspace.saved-output`, `workspace.history`, `workspace.export` | start, workspace, history | `custom` |
| `guided-program` | Guided Program | `guided-program.stage`, `guided-program.task`, `guided-program.checkin`, `guided-program.reflection`, `guided-program.completion` | start, setup, workspace, progress, history | `stage-completion` |
| `tracker` | Tracker | `tracker.entry`, `tracker.trend`, `tracker.summary`, `tracker.review-cycle` | start, workspace, progress, history | `consistency` |

Each family's `defaultNavigation` is what a product gets if it doesn't
declare its own — a product can still opt into a subset (see the fixtures,
which deliberately use different navigation subsets from their family
defaults to prove the resolver isn't hardcoded).

## In practice today

All nine live products are `companion`, and every one of them declares
its own navigation rather than taking the family default: Home Base has
`import`, Travel Companion has `trip` and `people`, Family Health Binder
has `members` and `timeline`, and so on (`docs/ROUTE-MAP.md` lists every
destination that exists). Six of the nine also set
`navigationStyle: "rail"` and get different chrome entirely
(`ProductRailShell`) rather than the tab shell with pieces hidden.

That nine products of one family need thirty different destinations
between them is the evidence the resolver was built for. The other five
families are registered and unused: no product outside `companion` has
been built yet, and none of the shell code branches on family name, so
building one requires no change here.

## Capability naming rule

`<family-namespace>.<capability>`, lowercase, hyphenated. The namespace does
not have to match a registered family id exactly (a capability can belong to
a family's *conceptual* area even if products from other families reuse it),
but in practice each family's capabilities are prefixed with its own id for
clarity. New capabilities just need to match
`^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$` — `capabilities.ts` validates this at
registration time, it doesn't enumerate every legal value.

## What families do not do

A family definition never contains executable logic, UI components, or
rendering branches — only capability/navigation/progress-model *declarations*
the shell composes from. Real per-family behavior (a lesson player, a run-log
viewer, an envelope tracker) is a **module**, registered separately via
`moduleRegistry` and referenced from a specific product's `modules` list —
never baked into the family definition itself.
