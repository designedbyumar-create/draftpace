"use client";

import type { ReactNode } from "react";
import Button, { type ButtonSize } from "@/design-system/Button";
import { trackEvent, type EventParams } from "@/lib/analytics/gtag";

/**
 * A design-system Button that also records a GA4 event on click, for the
 * call sites that render from a server component and so cannot pass an
 * inline onClick down to Button directly (a plain function isn't a valid
 * prop across the server/client boundary — see this file's callers for
 * the actual cases: GetAction's signed-out redirect, and /free's two
 * navigating CTAs). Anywhere already inside a client component (e.g.
 * ShopGrid.tsx) just calls trackEvent from its own onClick instead; this
 * exists only to cross that specific boundary.
 *
 * Never wraps CheckoutButton or AddToLibraryButton, which already fire
 * their own events internally (see those files) — this is only for a
 * plain navigating link that needs one added.
 */
export default function TrackedLink({
  href,
  children,
  size = "md",
  fullWidth = false,
  iconRight,
  eventName,
  eventParams,
}: {
  href: string;
  children: ReactNode;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconRight?: ReactNode;
  eventName: string;
  eventParams: EventParams;
}) {
  return (
    <Button
      href={href}
      size={size}
      fullWidth={fullWidth}
      iconRight={iconRight}
      onClick={() => trackEvent(eventName, eventParams)}
    >
      {children}
    </Button>
  );
}
