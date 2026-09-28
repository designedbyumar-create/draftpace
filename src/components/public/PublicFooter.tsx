import Link from "next/link";
import { Logo } from "@/design-system/Logo";
import ThemeToggle from "@/design-system/theme/ThemeToggle";

const HELP_LINKS = [
  { href: "/help-with", label: "Ask" },
  { href: "/shop", label: "Shop" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/guides", label: "Guides" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/trust", label: "Trust" },
  { href: "/editorial-standards", label: "Editorial standards" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/support", label: "Support" },
  { href: "/careers", label: "Careers" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Logo height={40} />
            <p className="mt-4 max-w-xs text-body-sm leading-6 text-[var(--muted)]">
              The Companion Series: products that remember your situation so you do not have to, yours to
              keep once you buy them.
            </p>
            <div className="mt-6">
              <p className="mb-2.5 text-eyebrow font-bold uppercase text-[var(--faint)]">Appearance</p>
              <ThemeToggle />
            </div>
          </div>

          <FooterColumn title="Get help" links={HELP_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-[var(--faint)]">© {new Date().getFullYear()} Draftpace.</p>
          <nav aria-label="Legal" className="flex gap-5">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-caption font-medium text-[var(--muted)] hover:text-[var(--text)]">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">{title}</p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-body-sm text-[var(--muted)] hover:text-[var(--text)]">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
