"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import { entranceVariant } from "@/design-system/motion";

/**
 * The few seconds between a payment clearing and its entitlement landing.
 *
 * Lemon Squeezy closes its overlay the moment the card clears; the grant
 * arrives separately, when its webhook reaches us. That gap is usually
 * under a second and occasionally several. This holds the customer in a
 * state that is true for the whole of it: the payment worked, the product
 * is being attached to their account, and nobody needs to do anything.
 *
 * WHAT IT NEVER DOES
 *
 * It never claims the product is ready before the entitlement actually
 * exists, and it never quietly gives up into a dead end. If the wait runs
 * past the window below, it says so plainly and hands over a real next
 * step, because at that point something genuinely is wrong and the
 * customer has already paid. The one thing that must never happen here is
 * a paying customer being told, in any wording, that they do not own the
 * thing they just bought.
 */
const POLL_INTERVAL_MS = 2000;
/** Roughly 40s. Past this a webhook almost certainly is not coming. */
const MAX_ATTEMPTS = 20;

export default function AwaitingGrant({ productSlug, productTitle }: { productSlug: string; productTitle: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const [timedOut, setTimedOut] = useState(false);
  const attempts = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;

      attempts.current += 1;
      if (attempts.current > MAX_ATTEMPTS) {
        setTimedOut(true);
        return;
      }

      try {
        const response = await fetch(`/api/products/${productSlug}/entitlement`, { cache: "no-store" });
        if (response.ok) {
          const body: { granted?: boolean } = await response.json();
          if (body.granted && !cancelled) {
            // Re-render the server component, which now reads the
            // entitlement and shows the real confirmation. One source of
            // truth for "granted" rather than a second copy of the screen
            // rendered from client state.
            router.refresh();
            return;
          }
        }
        // A non-ok response is a read failure, not a verdict. Keep waiting:
        // the webhook may already have succeeded.
      } catch {
        // Same for a dropped connection.
      }

      if (!cancelled) window.setTimeout(poll, POLL_INTERVAL_MS);
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [productSlug, router]);

  if (timedOut) {
    return (
      <Alert tone="warning" title="This is taking longer than it should">
        <p>
          Your payment went through, and {productTitle} is yours. It just has not attached to your account yet, which is
          our side to fix, not yours.
        </p>
        <p className="mt-2">
          Your receipt is in your email. Send it to us and we will put this right, usually the same day.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button href="/support" variant="action" size="sm">
            Contact support
          </Button>
          <Button href="/app" variant="ghost" size="sm">
            Back to Draftpace
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <motion.div
      variants={entranceVariant(reduceMotion)}
      initial="hidden"
      animate="visible"
      className="flex items-start gap-3"
    >
      <span
        aria-hidden
        className="mt-1 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--primary)] motion-reduce:animate-none"
      />
      <div>
        <p className="font-semibold text-[var(--text)]">Payment received. Setting up {productTitle}.</p>
        <p className="mt-1 text-[14px] text-[var(--muted)]">
          This takes a few seconds. You do not need to refresh or do anything.
        </p>
      </div>
    </motion.div>
  );
}
