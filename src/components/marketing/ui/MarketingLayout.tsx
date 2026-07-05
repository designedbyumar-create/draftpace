import type { ElementType, ReactNode } from "react";

type MarketingContainerProps = {
  children: ReactNode;
  className?: string;
};

type MarketingSectionProps = MarketingContainerProps & {
  as?: ElementType;
};

export function MarketingContainer({ children, className = "" }: MarketingContainerProps) {
  return <div className={`mx-auto max-w-6xl px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function MarketingSection({
  as: Component = "section",
  children,
  className = "",
}: MarketingSectionProps) {
  return (
    <Component className={`border-b border-gray-100 bg-[var(--marketing-bg)] ${className}`}>
      {children}
    </Component>
  );
}
