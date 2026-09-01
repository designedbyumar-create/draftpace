/**
 * Shared content-width conventions so pages don't invent their own
 * max-width values. See docs/DESIGN-SYSTEM.md.
 *
 * - "wide"     max-w-6xl  — marketing hero / feature sections
 * - "standard" max-w-5xl  — platform surfaces (Home, Library, Account, etc.)
 * - "narrow"   max-w-3xl  — product shell, auth forms, single-column reading
 */
export type ContainerWidth = "wide" | "standard" | "narrow";

const widthClass: Record<ContainerWidth, string> = {
  wide: "max-w-6xl",
  standard: "max-w-5xl",
  narrow: "max-w-3xl",
};

export default function Container({
  width = "standard",
  className = "",
  children,
}: {
  width?: ContainerWidth;
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${widthClass[width]} ${className}`}>{children}</div>;
}
