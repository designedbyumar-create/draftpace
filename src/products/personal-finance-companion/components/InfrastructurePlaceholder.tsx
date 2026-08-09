"use client";

import type { ProductDefinition } from "@/product-framework/definition";
import EmptyState from "@/design-system/EmptyState";
import Alert from "@/design-system/Alert";
import type { DraftpaceIcon } from "@/design-system/Icon";

/**
 * Shared presentational shell for every Personal Finance Companion
 * destination this infrastructure session registers a module for. Not a
 * customer-facing "Coming Soon" state — this product has no Shop listing
 * and is reachable only via a manual admin grant (see definition.ts), so
 * nothing here is ever shown to a real customer. It exists so an internal
 * tester can confirm routing, entitlement, and (where wired) live data
 * access actually work for each destination, honestly labeled as
 * unbuilt feature UI rather than dressed up as a finished screen.
 */
export default function InfrastructurePlaceholder({
  icon,
  title,
  description,
  definition,
  children,
}: {
  icon: DraftpaceIcon;
  title: string;
  description: string;
  definition: ProductDefinition;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <EmptyState icon={icon} title={title} description={description} />
      {children}
      <div className="mt-6">
        <Alert tone="info">
          {definition.title} is an internal, unreleased product (foundation stage). This destination is a route and
          data-access shell, not finished feature UI. Not reachable by any real customer: there is no Shop listing
          and no self-serve purchase path.
        </Alert>
      </div>
    </div>
  );
}
