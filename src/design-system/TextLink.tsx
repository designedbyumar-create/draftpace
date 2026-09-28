"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "./Icon";
import { textLinkClassName } from "./textLinkStyles";

export { textLinkClassName };

type TextLinkProps = {
  href: string;
  children: ReactNode;
  /** A trailing arrow that nudges on hover. The only icon this ever renders — see textLinkStyles.ts for why there's no generic icon slot. */
  arrow?: boolean;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

/**
 * The one plain inline link, everywhere the whole element isn't already
 * a card or a button. See textLinkStyles.ts's own doc comment for why
 * this exists and why it has no variants.
 *
 * Not for a filled, button-shaped call to action: that's Button.tsx.
 * This is for a link that reads as text with somewhere to go, the "See
 * all N guides" / "Read the full trust page" / "Contact support" shape.
 */
export default function TextLink({ href, children, arrow, className, ...rest }: TextLinkProps) {
  return (
    <Link href={href} className={textLinkClassName({ className })} {...rest}>
      {children}
      {arrow && (
        <ArrowRight size={14} aria-hidden className="shrink-0 transition-transform group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}
