"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { buttonClassName, type ButtonSize, type ButtonVariant } from "./buttonStyles";

export { buttonClassName };
export type { ButtonSize, ButtonVariant };

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
