"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type MarketingButtonVariant = "primary" | "secondary" | "ghost";
type MarketingButtonSize = "sm" | "md" | "lg";

type SharedButtonProps = {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  size?: MarketingButtonSize;
  variant?: MarketingButtonVariant;
};

type LinkButtonProps = SharedButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href"> & {
    href: string;
    type?: never;
  };

type NativeButtonProps = SharedButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

export type MarketingButtonProps = LinkButtonProps | NativeButtonProps;

const baseClass =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-center font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variantClass: Record<MarketingButtonVariant, string> = {
  primary:
    "bg-[var(--marketing-primary)] text-white shadow-[var(--marketing-button-shadow)] hover:bg-[var(--marketing-primary-hover)]",
  secondary:
    "border border-[var(--marketing-border)] bg-white text-[var(--marketing-text)] shadow-sm hover:border-[var(--marketing-border-strong)] hover:bg-[var(--marketing-surface-muted)]",
  ghost:
    "text-[var(--marketing-muted)] hover:bg-[var(--marketing-surface-muted)] hover:text-[var(--marketing-text)]",
};

const sizeClass: Record<MarketingButtonSize, string> = {
  sm: "min-h-10 rounded-xl px-4 py-2 text-[13px]",
  md: "min-h-11 rounded-xl px-5 py-2.5 text-[14px]",
  lg: "min-h-12 rounded-xl px-6 py-3.5 text-[14px]",
};

export function marketingButtonClassName({
  className = "",
  fullWidth = false,
  size = "md",
  variant = "primary",
}: Omit<SharedButtonProps, "children" | "iconLeft" | "iconRight"> = {}) {
  return [
    baseClass,
    variantClass[variant],
    sizeClass[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function MarketingButton(props: MarketingButtonProps) {
  if ("href" in props && props.href) {
    const linkButtonProps = props as LinkButtonProps;
    const {
      children,
      className,
      fullWidth,
      iconLeft,
      iconRight,
      size = "md",
      variant = "primary",
      href,
      ...linkProps
    } = linkButtonProps;
    const classes = marketingButtonClassName({ className, fullWidth, size, variant });

    return (
      <Link href={href} className={classes} {...linkProps}>
        {iconLeft}
        {children}
        {iconRight}
      </Link>
    );
  }

  const nativeButtonProps = props as NativeButtonProps;
  const {
    children,
    className,
    fullWidth,
    iconLeft,
    iconRight,
    size = "md",
    variant = "primary",
    ...buttonProps
  } = nativeButtonProps;
  const classes = marketingButtonClassName({ className, fullWidth, size, variant });

  return (
    <button {...buttonProps} type={buttonProps.type ?? "button"} className={classes}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
