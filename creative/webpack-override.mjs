/**
 * The webpack customization this project needs, shared between
 * remotion.config.ts (used by `remotion studio` / `remotion render`) and
 * scripts/render-direct.mjs (which calls @remotion/bundler's bundle()
 * directly and does NOT read remotion.config.ts at all — that file is only
 * auto-applied by the @remotion/cli wrapper, a real gap between the CLI and
 * the programmatic API discovered while debugging the CLI render hang, see
 * README.md).
 *
 * Two things, both load-bearing:
 *  1. Points "@" at the real app's src/, so ui-adapter/ and the real
 *     component files it imports (which themselves say `@/design-system/
 *     Icon`, unmodified) resolve "@" the way the real app does.
 *  2. Inserts postcss-loader (Tailwind + autoprefixer) into the .css rule:
 *     Remotion's default webpack config is style-loader + css-loader only,
 *     no PostCSS step, so without this the real components' Tailwind
 *     classes compile to nothing (confirmed by inspecting the live
 *     stylesheet in Remotion Studio: the @tailwind directives were passing
 *     through completely unprocessed).
 */
import path from "node:path";
import tailwindcssPlugin from "tailwindcss";
import autoprefixer from "autoprefixer";
import tailwindConfig from "./tailwind.config.mjs";

export function webpackOverride(currentConfig) {
  const rules = (currentConfig.module?.rules ?? []).map((rule) => {
    if (
      rule &&
      typeof rule === "object" &&
      "test" in rule &&
      rule.test instanceof RegExp &&
      rule.test.test("styles.css")
    ) {
      return {
        ...rule,
        use: [
          ...(Array.isArray(rule.use) ? rule.use : []),
          {
            // A bare module name, not require.resolve(): this file is
            // loaded both by remotion.config.ts, under Remotion's own CJS
            // config loader where import.meta (needed for createRequire)
            // is empty, and by plain `node scripts/render-direct.mjs`
            // (real ESM). webpack resolves loader strings itself via its
            // own node_modules resolution, same as the built-in
            // "style-loader" entry a few lines up — no require needed here.
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [tailwindcssPlugin(tailwindConfig), autoprefixer],
              },
            },
          },
        ],
      };
    }
    return rule;
  });

  return {
    ...currentConfig,
    module: { ...currentConfig.module, rules },
    resolve: {
      ...currentConfig.resolve,
      alias: {
        ...currentConfig.resolve?.alias,
        "@": path.resolve(process.cwd(), "../src"),
      },
    },
  };
}
