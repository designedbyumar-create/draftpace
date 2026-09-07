import { permanentRedirect } from "next/navigation";

/**
 * /blog moved to /guides.
 *
 * Permanent (308) rather than the temporary redirect this used to issue.
 * A temporary redirect tells a search engine to keep /blog indexed and
 * to keep checking it, so the old URL competes with the page that
 * replaced it and inherits none of its authority. Permanent is what
 * actually retires a URL and passes its equity on.
 */
export default function BlogPage() {
  permanentRedirect("/guides");
}
