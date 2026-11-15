/**
 * Phosphor icons as inline SVG strings, server-rendered from the same
 * package the app uses (the repo allows only Phosphor).
 *
 *   icon("Calendar", { size: 44, color: "#fff", weight: "duotone" })
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Ph from "@phosphor-icons/react/dist/ssr";

/** "calendar-check" (the bank's spelling) and "CalendarCheck" both work. */
const pascal = (n) => n.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");

export function icon(name, { size = 40, color = "currentColor", weight = "duotone" } = {}) {
  const Icon = Ph[pascal(name)];
  if (!Icon) throw new Error(`no Phosphor icon "${name}" (${pascal(name)})`);
  return renderToStaticMarkup(React.createElement(Icon, { size, color, weight }));
}
