"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, CalendarCheck, ChartBar, Envelope, FilmStrip, LinkSimple, Microphone, Sparkles, SquaresFour,
} from "@/design-system/Icon";
import { LogoMark } from "@/design-system/Logo";
import ThemeToggle from "@/design-system/theme/ThemeToggle";

const GROUPS = [
  { label: "Create", items: [
    { href: "/", label: "Today", Icon: SquaresFour },
    { href: "/make", label: "Make", Icon: Sparkles },
    { href: "/voiceover", label: "Voice-over", Icon: Microphone },
  ] },
  { label: "Content", items: [
    { href: "/library", label: "Library", Icon: FilmStrip },
    { href: "/calendar", label: "Calendar", Icon: CalendarCheck },
    { href: "/sources", label: "Sources", Icon: BookOpen },
  ] },
  { label: "Reach", items: [
    { href: "/channels", label: "Channels", Icon: LinkSimple },
    { href: "/email", label: "Email", Icon: Envelope },
    { href: "/results", label: "Results", Icon: ChartBar },
  ] },
];

const ALL = GROUPS.flatMap((g) => g.items);

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function StudioShell({ mode, children }: { mode: "open" | "locked"; children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-[var(--app-bg)] text-[var(--text)]">
      <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-3 py-4 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <LogoMark size={22} />
          <span className="text-body-sm font-semibold tracking-tight">Draftpace</span>
          <span className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 text-eyebrow font-bold uppercase text-[var(--muted)]">Studio</span>
        </Link>
        <nav aria-label="Studio" className="mt-6 space-y-5">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-2.5 pb-1.5 text-eyebrow font-bold uppercase text-[var(--faint)]">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-body-sm font-semibold transition ${
                        active ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                      }`}
                    >
                      <item.Icon size={16} active={active} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-auto space-y-3 px-1 pt-4">
          <div className="rounded-lg border border-[var(--border)] px-3 py-2.5">
            <p className="text-caption font-semibold">{mode === "open" ? "Local mode" : "Signed in"}</p>
            <p className="mt-0.5 text-caption text-[var(--muted)]">
              {mode === "open" ? "Running on this machine against the engine's files." : "Studio access key accepted."}
            </p>
          </div>
          <ThemeToggle compact />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Below lg the rail becomes one scrollable row of the same links. */}
        <nav aria-label="Studio" className="studio-scroll sticky top-0 z-20 flex gap-1 overflow-x-auto border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2 lg:hidden">
          <Link href="/" className="mr-1 flex shrink-0 items-center"><LogoMark size={20} /></Link>
          {ALL.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-caption font-semibold ${active ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--muted)]"}`}>
                <item.Icon size={14} active={active} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
