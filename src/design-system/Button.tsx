"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type SharedProps = {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

type LinkButtonProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href"> & {
    href: string;
    type?: never;
  };

type NativeButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

const baseClass =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-center font-semibold tracking-[-0.006em] transition-[transform,box-shadow,background-color,border-color,color] duration-[var(--dur-fast)] ease-[var(--ease-out)] active:scale-[0.985] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-contrast)] shadow-[var(--btn-primary-rest)] hover:bg-[var(--primary-strong)] hover:shadow-[var(--btn-primary-hover)] hover:-translate-y-px active:shadow-[var(--btn-primary-rest)]",
  secondary:
    "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--btn-raise-rest)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] hover:shadow-[var(--btn-raise-hover)] hover:-translate-y-px active:shadow-[var(--btn-raise-rest)]",
  ghost: "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]",
  danger:
    "bg-[var(--danger)] text-white shadow-[var(--btn-raise-rest)] hover:brightness-[1.05] hover:shadow-[var(--btn-raise-hover)] hover:-translate-y-px active:shadow-[var(--btn-raise-rest)]",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-9 rounded-lg px-3.5 py-2 text-[13px]",
  md: "min-h-11 rounded-lg px-5 py-2.5 text-[14px]",
  lg: "min-h-12 rounded-xl px-6 py-3.5 text-[15px]",
};

export function buttonClassName({
  className = "",
  fullWidth = false,
  size = "md",
  variant = "primary",
}: Omit<SharedProps, "children" | "iconLeft" | "iconRight"> = {}) {
  return [baseClass, variantClass[variant], sizeClass[size], fullWidth ? "w-full" : ""]
    .concat(className)
    .filter(Boolean)
    .join(" ");
}

export default function Button(props: ButtonProps) {
  if ("href" in props && props.href) {
    const { children, className, fullWidth, iconLeft, iconRight, size = "md", variant = "primary", href, ...rest } =
      props as LinkButtonProps;
    return (
      <Link href={href} className={buttonClassName({ className, fullWidth, size, variant })} {...rest}>
        {iconLeft}
        {children}
        {iconRight}
      </Link>
    );
  }

  const { children, className, fullWidth, iconLeft, iconRight, size = "md", variant = "primary", ...rest } =
    props as NativeButtonProps;
  return (
    <button {...rest} type={rest.type ?? "button"} className={buttonClassName({ className, fullWidth, size, variant })}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
