/**
 * Runs a TypeScript/TSX entry file using Vite's own transform pipeline.
 *
 * Node can strip types but cannot transform JSX, and this project has no
 * standalone esbuild binary. Vite is already here for the test runner, so
 * borrowing its SSR module loader avoids adding a build dependency purely
 * to render a PDF once per print run.
 */
import { createServer } from "vite";

const entry = process.argv[2];
if (!entry) {
  console.error("usage: node scripts/run-tsx.mjs <entry.ts|tsx>");
  process.exit(1);
}

const server = await createServer({
  configFile: false,
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true },
  appType: "custom",
});

try {
  await server.ssrLoadModule(entry);
} finally {
  await server.close();
}
