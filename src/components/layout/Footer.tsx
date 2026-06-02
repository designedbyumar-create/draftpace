import Link from "next/link";
import { ArrowRight } from "lucide-react";

const links = {
  Product: ["Features", "Planners", "Library", "Pricing"],
  Company: ["About", "Blog", "Careers", "Press"],
  Legal: ["Privacy Policy", "Terms of Use", "Cookie Policy"],
};

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 px-8 pt-16 pb-10">
      <div className="mx-auto max-w-6xl">

        {/* Top row */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 mb-14">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-950 leading-none">Draftpace</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Momentum OS</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6">
              Interactive planners for money, goals, and habits. Built for people who want to stay consistent — not just start strong.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              Start for free <ArrowRight size={14} />
            </Link>
          </div>

          {/* Links */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                {group}
              </p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom row */}
        <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Draftpace. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
            <span className="flex items-center gap-1.5">
              Built with
              <span className="text-rose-400">♥</span>
              for consistency
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}