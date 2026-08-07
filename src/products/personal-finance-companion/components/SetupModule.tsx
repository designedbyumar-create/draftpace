"use client";

import type { ProductDefinition } from "@/product-framework/definition";
import { Compass } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import InfrastructurePlaceholder from "./InfrastructurePlaceholder";
import { useSetupState } from "./useSetupState";

/**
 * Infrastructure verification for the Companion guided-setup flow's
 * autosave/resume foundation (launch spec phase 8) — not the real seven-
 * screen journey from launch spec section 6, which is explicitly out of
 * scope for this session. Exercises useSetupState end to end: loading the
 * current screen/orientation state, and a real autosaved write via the
 * "Advance one screen (test autosave)" button, so the resumable state
 * contract is provably working, not just declared.
 */
export default function SetupModule({ definition }: { definition: ProductDefinition }) {
  const { status, errorMessage, state, saveStatus, setState, retry } = useSetupState();

  return (
    <InfrastructurePlaceholder
      definition={definition}
      icon={Compass}
      title="Companion: guided setup journey not built yet"
      description="Screens 0-7 from the launch specification (orientation, welcome, capture, review, follow-up, summary) are the next stage. This destination currently only proves the autosave/resume state contract those screens will use."
    >
      <div className="mt-4 flex flex-col items-center gap-3">
        {status === "loading" && <Badge tone="neutral">Loading setup state…</Badge>}
        {status === "error" && (
          <>
            <Badge tone="danger">Couldn&apos;t load setup state: {errorMessage}</Badge>
            <Button size="sm" variant="secondary" onClick={retry}>
              Retry
            </Button>
          </>
        )}
        {status === "no-instance" && <Badge tone="warning">No product instance found for this user yet</Badge>}
        {status === "ready" && state && (
          <>
            <Badge tone="success">
              Setup state loaded — screen {state.currentScreen}, orientation {state.orientation.seenAt ? "seen" : "not seen"}
            </Badge>
            <Badge tone={saveStatus === "saved" ? "success" : saveStatus === "error" ? "danger" : "neutral"}>
              Autosave: {saveStatus}
            </Badge>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setState({ ...state, currentScreen: Math.min(7, state.currentScreen + 1) })}
            >
              Advance one screen (test autosave)
            </Button>
          </>
        )}
      </div>
    </InfrastructurePlaceholder>
  );
}
