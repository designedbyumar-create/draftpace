import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    // creative/tests guard the Creative Engine's data against the real
    // products. They read app source only, so they need none of creative's
    // own dependencies and run with everything else.
    include: ["src/**/*.test.{ts,tsx}", "creative/tests/**/*.test.ts", "studio/tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@engine": path.resolve(import.meta.dirname, "./creative"),
      "~": path.resolve(import.meta.dirname, "./studio"),
    },
  },
});
