import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart } from "@/components/ui/Icon";
import { MarketingButton } from "@/components/marketing/ui";

const LINKS = {
  Product: [
    { label: "Features",  href: "/features"  },
    { label: "Store",     href: "/store"     },
    { label: "Pricing",   href: "/pricing"   },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Explore: [
    { label: "Money",        href: "/store?category=money"        },
    { label: "Habits",       href: "/store?category=habits"       },
    { label: "Mindset",      href: "/store?category=mindset"      },
    { label: "Productivity", href: "/store?category=productivity" },
  ],
  Company: [
    { label: "About",   href: "about"                       },
    { label: "Blog",    href: "/blog"                        },
    { label: "Careers", href: "/careers"                     },
    { label: "Support", href: "mailto:support@draftpace.com" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use",   href: "/terms"   },
    { label: "Cookie Policy",  href: "/cookies" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 px-6 lg:px-8 pt-16 pb-10">
      <div className="mx-auto max-w-6xl">

        {/* Top row — flex so brand never collapses into the link grid */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-14">

          {/* Brand */}
          <div className="w-full lg:w-64 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <Image
                src="/logo/draftpace-brand-logo.svg"
                alt="Draftpace"
                width={180}
                height={56}
                className="h-auto w-[180px] shrink-0"
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Interactive planners for money, goals, and habits. Built for people who want to stay consistent — not just start strong.
            </p>
            <MarketingButton href="/signup" iconRight={<ArrowRight size={14} />}>
              Start for free
            </MarketingButton>
          </div>

          {/* Link columns — always 2 cols on mobile, 4 on sm+ */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(LINKS).map(([group, items]) => (
              <div key={group}>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
                  {group}
                </p>
                <ul className="space-y-3">
                  {items.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom row */}
        <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Draftpace. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-gray-600 transition-colors">Terms</Link>
            <span className="flex items-center gap-1.5">
              Built with <Heart size={12} filled className="text-rose-400" /> for consistency
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
