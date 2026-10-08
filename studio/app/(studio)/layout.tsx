import StudioShell from "~/components/StudioShell";
import { accessMode } from "~/lib/access";

export const dynamic = "force-dynamic";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <StudioShell mode={accessMode() === "open" ? "open" : "locked"}>{children}</StudioShell>;
}
