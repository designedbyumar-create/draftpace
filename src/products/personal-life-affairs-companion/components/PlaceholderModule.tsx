import EmptyState from "@/design-system/EmptyState";
import type { DraftpaceIcon } from "@/design-system/Icon";

/**
 * Phase 0 scaffolding. Every destination this product declares is
 * reachable from day one so the shell, theme and navigation can be
 * verified live before any feature exists, following the same
 * "empty module stubs wired to every destination" step both siblings
 * used.
 *
 * These render an honest not-built-yet state. They never fabricate
 * content, per the platform's rule 8.
 */
export default function PlaceholderModule({
  icon,
  title,
  description,
}: {
  icon: DraftpaceIcon;
  title: string;
  description: string;
}) {
  return <EmptyState icon={icon} title={title} description={description} />;
}
