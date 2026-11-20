import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },
  {
    // One-off report/rebuild scripts, deliberately plain Node CommonJS (the
    // .cjs extension signals that): they patch `require.extensions` to load
    // guides.ts and its git history through CommonJS's own module loader, a
    // trick ESM has no equivalent for. require() here is the point, not a
    // mistake the rule should flag.
    files: ["scripts/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The Creative Engine is its own workspace with its own dependencies
    // and its own CI job (.github/workflows/creative.yml).
    "creative/**",
    // Draftpace Studio's build output and local state; its source is linted like the site's.
    "studio/.next/**",
    "studio/.data/**",
    "studio/next-env.d.ts",
  ]),
]);

export default eslintConfig;
