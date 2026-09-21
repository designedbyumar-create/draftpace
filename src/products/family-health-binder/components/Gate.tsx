import type { ReactNode } from "react";
import EmptyState from "@/design-system/EmptyState";
import { Heart } from "@/design-system/Icon";
import type { FamilyHealthBinderData } from "./useFamilyHealthBinder";

/** What to show while the account loads, or if it cannot. Null once the data is ready, so a screen goes on to draw itself. */
export function gate(data: Pick<FamilyHealthBinderData, "status" | "errorMessage">): ReactNode | null {
  if (data.status === "loading") return <p className="text-[14px] text-[var(--faint)]">Loading...</p>;
  if (data.status === "no-instance") {
    return <EmptyState icon={Heart} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (data.status === "error") {
    return <EmptyState icon={Heart} title="Couldn't load this" description={data.errorMessage ?? "Try again."} />;
  }
  return null;
}
