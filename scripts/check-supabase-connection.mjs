#!/usr/bin/env node
/**
 * Verifies the configured Supabase project is actually reachable — format
 * validation (src/lib/supabase/config.ts) can't catch a deleted or paused
 * project, only a real network call can. Never prints the URL or key.
 *
 * Usage: node scripts/check-supabase-connection.mjs
 * (reads .env.local the same way Next.js does)
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return {};
  const contents = readFileSync(path, "utf-8");
  const vars = {};
  for (const line of contents.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) vars[match[1]] = match[2];
  }
  return vars;
}

const env = { ...loadEnvLocal(), ...process.env };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Draftpace Supabase connection check\n");

if (!url || !key) {
  console.log("FAIL  Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.");
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(url);
} catch {
  console.log("FAIL  NEXT_PUBLIC_SUPABASE_URL is not a valid URL.");
  process.exit(1);
}

console.log(`Checking https://${"*".repeat(parsed.hostname.length)} (hostname redacted, length shown only)...`);

try {
  const response = await fetch(`${parsed.origin}/auth/v1/settings`, {
    headers: { apikey: key },
    signal: AbortSignal.timeout(8000),
  });
  if (response.ok) {
    console.log(`PASS  Project responded (HTTP ${response.status}). Supabase auth is reachable.`);
    process.exit(0);
  }
  console.log(`FAIL  Project responded with HTTP ${response.status}. Check the URL and anon key are correct.`);
  process.exit(1);
} catch (error) {
  const code = error?.cause?.code || error?.code || error?.name;
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
    console.log("FAIL  DNS lookup failed — this hostname does not resolve.");
    console.log("      The Supabase project is very likely deleted, paused, or the URL is mistyped.");
    console.log("      See docs/SUPABASE-SETUP.md to resume or replace the project.");
  } else if (code === "ABORT_ERR" || error?.name === "TimeoutError") {
    console.log("FAIL  Request timed out after 8s.");
  } else {
    console.log(`FAIL  Request failed: ${code || error?.message || "unknown error"}`);
  }
  process.exit(1);
}
