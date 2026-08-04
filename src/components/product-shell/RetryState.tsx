import EmptyState from "@/design-system/EmptyState";
import Button from "@/design-system/Button";
import { WarningCircle } from "@/design-system/Icon";

/**
 * A recoverable failure inside the product shell — a read or write that
 * failed, not a "you don't own this" or "nothing here" state. Access must
 * never be silently reinterpreted as absence just because a check failed;
 * this is what every such check renders instead.
 */
export default function RetryState({
  title,
  description,
  retryHref,
}: {
  title: string;
  description: string;
  retryHref: string;
}) {
  return (
    <div className="mx-auto max-w-md py-16">
      <EmptyState
        icon={WarningCircle}
        title={title}
        description={description}
        action={<Button href={retryHref}>Try again</Button>}
      />
    </div>
  );
}
