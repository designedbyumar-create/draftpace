import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The guides are the site's search entrance, and they are identical for
 * every visitor. They stopped being static once, because the marketing
 * layout read the Supabase session on the server, and nothing failed: the
 * build still passed and pages were rendered per request. These guards fail
 * the moment anything in the path from layout to guide reads the request.
 */
const read = (path: string) => readFileSync(join(process.cwd(), path), "utf-8");

const REQUEST_READERS = [/next\/headers/, /createSupabaseServerClient/, /getCachedUser/, /force-dynamic/, /\bcookies\(/, /\bheaders\(/];

describe("guides stay prerendered", () => {
  const files = [
    "src/app/(marketing)/layout.tsx",
    "src/app/(marketing)/guides/[guideSlug]/page.tsx",
    "src/app/(marketing)/guides/[guideSlug]/opengraph-image.tsx",
    "src/app/(marketing)/guides/page.tsx",
    "src/components/public/PublicFooter.tsx",
  ];

  it.each(files)("%s does not read the request", (file) => {
    const source = read(file);
    for (const pattern of REQUEST_READERS) expect(source, `${file} matches ${pattern}`).not.toMatch(pattern);
  });

  it("closes the guide route to slugs that are not known at build time", () => {
    expect(read("src/app/(marketing)/guides/[guideSlug]/page.tsx")).toMatch(/export const dynamicParams = false/);
  });
});
