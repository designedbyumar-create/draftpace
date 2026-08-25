/**
 * Companion Mode types, for Alongside.
 *
 * The engine itself moved to
 * src/components/product-shell/companion/steps.ts once a second product
 * needed the identical shape; see that file's own header for the
 * engine's rules. This file exists only to specialise `Playbook`'s
 * context type to Alongside's own four life shapes, so every playbook
 * file in ./playbooks/ keeps compile-time checking that opensFor only
 * ever names a real shape, and to re-export everything else unchanged
 * so no other file in this product had to change an import.
 */
import type { ItemKind } from "./life";
import type { Playbook as SharedPlaybook } from "@/components/product-shell/companion/steps";

export type {
  StepKind,
  PlaybookChoice,
  PlaybookStep,
  StepCondition,
  OutcomeKind,
  OutcomeOption,
  Answers,
} from "@/components/product-shell/companion/steps";

export {
  OUTCOME_OPTIONS,
  conditionMet,
  applicableSteps,
  nextStep,
  visibleItems,
  visibleWording,
  runProgress,
} from "@/components/product-shell/companion/steps";

export type Playbook = SharedPlaybook<ItemKind>;
