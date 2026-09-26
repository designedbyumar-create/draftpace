import Link from "next/link";
import { ChevronRight } from "@/design-system/Icon";

/**
 * The trail above a guide or hub. It renders the same list the page hands
 * to the BreadcrumbList schema, because Google only trusts breadcrumb
 * markup that matches what a reader can see. The last item is the current
 * page: text, not a link, and cut short so a 60-character title cannot
 * push the trail onto three lines.
 */
export type BreadcrumbItem = { name: string; path: string };

export default function Breadcrumbs({ trail }: { trail: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--area)]">
        {trail.map((item, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={item.path} className="flex min-w-0 items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="max-w-[26ch] truncate text-[var(--muted)] sm:max-w-[44ch]">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="transition-opacity hover:opacity-70">
                  {item.name}
                </Link>
              )}
              {!last && <ChevronRight size={12} aria-hidden className="shrink-0 opacity-60" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
