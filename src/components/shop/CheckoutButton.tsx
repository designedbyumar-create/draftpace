"use client";

import Script from "next/script";
import type { ReactNode } from "react";
import { buttonClassName, type ButtonSize } from "@/design-system/buttonStyles";
import { trackEvent } from "@/lib/analytics/gtag";

/**
 * The buy button, as a Lemon Squeezy overlay rather than a trip to another
 * domain.
 *
 * HOW THE OVERLAY IS TRIGGERED
 *
 * lemon.js watches for clicks on any `<a class="lemonsqueezy-button">` and
 * opens the href in an overlay instead of navigating. The class is a
 * behaviour hook, not a style hook: Lemon Squeezy ships no CSS for it, so
 * this stays an ordinary design-system button in the product's own accent
 * and simply carries the class along.
 *
 * WHY A PLAIN <a> AND NOT design-system/Button
 *
 * Button renders next/link for an href, which owns the click for its own
 * routing. Checkout is an external URL that a third-party script needs to
 * intercept, so it gets a plain anchor and skips the router entirely.
 *
 * WHAT HAPPENS IF THE SCRIPT NEVER LOADS
 *
 * Nothing breaks. The href is a real, complete checkout URL, so a blocked
 * or failed lemon.js leaves an ordinary link that opens Lemon Squeezy's
 * hosted checkout page in the normal way. The overlay is an enhancement,
 * never the only path to paying.
 */
declare global {
  interface Window {
    createLemonSqueezy?: () => void;
  }
}

export default function CheckoutButton({
  href,
  children,
  size = "md",
  fullWidth = false,
  iconRight,
  analytics,
}: {
  href: string;
  children: ReactNode;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconRight?: ReactNode;
  /**
   * Optional so this component works with zero analytics knowledge if a
   * future call site has none to give it. Every real call site today
   * (GetAction, in shop/[productSlug]/page.tsx) passes it: this is the
   * one place a Lemon Squeezy checkout actually opens, so one click here
   * is both "the product CTA was clicked" and "checkout began", so the two
   * GA4 events fire together rather than needing two separate handlers
   * for what is, on this button, a single real moment.
   */
  analytics?: { productId: string; productName: string; productCategory: string; cta: string };
}) {
  const handleClick = () => {
    if (!analytics) return;
    const { productId, productName, productCategory, cta } = analytics;
    trackEvent("product_cta_click", { product_id: productId, product_name: productName, cta });
    trackEvent("begin_checkout", { product_id: productId, product_name: productName, product_category: productCategory });
  };

  return (
    <>
      <Script
        src="https://assets.lemonsqueezy.com/lemon.js"
        strategy="afterInteractive"
        // lemon.js self-initialises on DOMContentLoaded, which has already
        // fired by the time Next injects an afterInteractive script, so the
        // binding is requested explicitly here rather than assumed.
        onLoad={() => window.createLemonSqueezy?.()}
      />
      {/* `primary`, the marketing register, because this is the public
          Shop, not in-product UI (see CLAUDE.md's two-register rule). */}
      <a href={href} className={`lemonsqueezy-button ${buttonClassName({ size, fullWidth, variant: "primary" })}`} onClick={handleClick}>
        {children}
        {iconRight}
      </a>
    </>
  );
}
