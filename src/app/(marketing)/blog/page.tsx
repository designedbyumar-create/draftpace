import { permanentRedirect } from "next/navigation";
import { withPreservedUtm } from "@/lib/analytics/utm";

/**
 * /blog moved to /guides.
 *
 * Permanent (308) rather than the temporary redirect this used to issue.
 * A temporary redirect tells a search engine to keep /blog indexed and
 * to keep checking it, so the old URL competes with the page that
 * replaced it and inherits none of its authority. Permanent is what
 * actually retires a URL and passes its equity on.
 *
 * UTM parameters ride along for the same reason every other internal
 * redirect carries them now (src/lib/analytics/utm.ts): this is a
 * server-side hop, so anything dropped here never reaches gtag.js at all.
 */
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  permanentRedirect(withPreservedUtm("/guides", await searchParams));
}
