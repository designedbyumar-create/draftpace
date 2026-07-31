import Image from "next/image";
import Link from "next/link";

const PRODUCT_LINKS = [
  { href: "/#platform", label: "Platform" },
  { href: "/#families", label: "Product families" },
  { href: "/signup", label: "Create an account" },
];

const COMPANY_LINKS = [
  { href: "/blog", label: "Blog" },
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
            <Image src="/logo/draftpace-brand-logo.svg" alt="Draftpace" width={128} height={40} />
            <p className="mt-4 max-w-xs text-[13px] leading-6 text-[var(--muted)]">
              An extensible platform for interactive digital products that remember state, adapt, and guide the next
              useful action.
            </p>
          </div>

          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[var(--faint)]">© {new Date().getFullYear()} Draftpace.</p>
          <nav aria-label="Legal" className="flex gap-5">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-[12px] font-medium text-[var(--muted)] hover:text-[var(--text)]">
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
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">{title}</p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-[13px] text-[var(--muted)] hover:text-[var(--text)]">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
