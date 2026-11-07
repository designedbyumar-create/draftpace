/**
 * What ProductRailShell wraps a product screen in (components/product-shell/
 * ProductRailShell.tsx), minus the chrome (header, tab bar, dev badge): the
 * root carries the product's own theme variables from the REAL
 * productThemeStyle(definition.theme), and the content sits in the same
 * padded narrow column.
 */
import type { ReactNode } from "react";
import { homeschoolingCompanionDefinition } from "@/products/homeschooling-companion/definition";
import { hasProductGround, productThemeStyle } from "@/product-framework/themeExtension";

const theme = homeschoolingCompanionDefinition.theme;

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[var(--app-bg)] text-[var(--text)]"
      data-product-theme
      data-product-motif={theme.identity?.motif}
      data-product-ground={hasProductGround(theme) ? "" : undefined}
      style={productThemeStyle(theme)}
    >
      <main className="mx-auto w-full px-4 pb-10 pt-6">{children}</main>
    </div>
  );
}
