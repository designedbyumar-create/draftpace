import Image from "next/image";
import Link from "next/link";

const COOKIE_TYPES = [
  {
    type: "Essential",
    required: true,
    color: "#059669", bg: "#ecfdf5", border: "#bbf7d0",
    description: "These cookies are required for Draftpace to work. You cannot opt out of them.",
    cookies: [
      { name: "sb-access-token",  purpose: "Keeps you logged in. Set by Supabase.",                    duration: "1 hour"    },
      { name: "sb-refresh-token", purpose: "Refreshes your session automatically. Set by Supabase.",   duration: "60 days"   },
      { name: "__session",        purpose: "Server-side session management.",                           duration: "Session"   },
    ],
  },
  {
    type: "Preferences",
    required: false,
    color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe",
    description: "These store your settings so they persist between visits.",
    cookies: [
      { name: "dp-theme",         purpose: "Remembers your display preferences.",  duration: "1 year"  },
      { name: "dp-onboarded",     purpose: "Tracks whether you've completed onboarding so we don't show it again.", duration: "1 year" },
    ],
  },
  {
    type: "Analytics",
    required: false,
    color: "#7c3aed", bg: "#fdf4ff", border: "#ddd6fe",
    description: "If we use analytics, it will be privacy-first (no cross-site tracking, no fingerprinting). Currently we use no third-party analytics.",
    cookies: [
      { name: "None currently",   purpose: "We don't run analytics cookies at this time.", duration: "—" },
    ],
  },
];

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#fafaf9]">

      {/* Hero */}
      <section
        className="bg-white border-b border-gray-100 px-6 lg:px-8 pt-28 pb-14"
        style={{
          backgroundImage: `linear-gradient(#e8e8e6 1px, transparent 1px), linear-gradient(90deg, #e8e8e6 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
        }}
      >
        <div className="mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full mb-6">
            <Image src="/logo/dp-mono.svg" alt="Draftpace" width={13} height={13}/>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">Legal</span>
          </div>
          <h1
            className="font-black text-gray-950 leading-[1.0] mb-4"
            style={{ fontSize: "clamp(30px, 5vw, 48px)", letterSpacing: "-0.04em" }}
          >
            Cookie Policy
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mb-3 max-w-lg">
            We use cookies to keep you logged in and remember your preferences. That's basically it — no tracking, no advertising cookies.
          </p>
          <p className="text-[12px] text-gray-400">Last updated: June 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 lg:px-8 py-14">
        <div className="mx-auto max-w-2xl space-y-12">

          {/* What are cookies */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-[18px] font-bold text-gray-950 mb-3">What are cookies?</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed">
              Cookies are small text files stored in your browser when you visit a website. They let the site remember things about you between visits — like whether you're logged in. We only use cookies that are necessary to run Draftpace or improve your experience. We don't use cookies to track you across other websites or show you ads.
            </p>
          </div>

          {/* Cookie table by type */}
          {COOKIE_TYPES.map((group) => (
            <div key={group.type}>
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="text-[11px] font-bold px-3 py-1 rounded-full border"
                  style={{ background: group.bg, color: group.color, borderColor: group.border }}
                >
                  {group.type}
                </span>
                {group.required && (
                  <span className="text-[11px] font-semibold text-gray-400">Required</span>
                )}
              </div>
              <p className="text-[14px] text-gray-500 leading-relaxed mb-4">{group.description}</p>

              {/* Cookie rows */}
              <div className="flex flex-col gap-2">
                {group.cookies.map((cookie) => (
                  <div key={cookie.name}
                    className="bg-white border border-gray-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2 sm:gap-4 items-start">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Name</p>
                      <p className="text-[13px] font-mono font-semibold text-gray-800">{cookie.name}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Purpose</p>
                      <p className="text-[13px] text-gray-600">{cookie.purpose}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Duration</p>
                      <p className="text-[13px] text-gray-600 whitespace-nowrap">{cookie.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* How to manage */}
          <div>
            <h2 className="text-[20px] font-bold text-gray-950 mb-5">How to manage cookies</h2>
            <div className="flex flex-col gap-3">
              {[
                { title:"In your browser", body:"You can block or delete cookies through your browser settings. Note that blocking essential cookies will break Draftpace — you won't be able to stay logged in." },
                { title:"On iOS / Android", body:"Use Safari or Chrome settings to manage cookies per site. The process varies by browser version." },
                { title:"Deleting your account", body:"Deleting your Draftpace account from Settings removes all server-side data. Browser cookies will clear when you log out or clear your browser data." },
              ].map((item) => (
                <div key={item.title} className="bg-white border border-gray-100 rounded-xl p-5">
                  <p className="text-[14px] font-semibold text-gray-900 mb-1.5">{item.title}</p>
                  <p className="text-[14px] text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[13px] text-gray-400">
              Questions? <a href="mailto:privacy@draftpace.com" className="text-indigo-600 hover:underline">privacy@draftpace.com</a>
            </p>
            <div className="flex items-center gap-4 text-[13px]">
              <Link href="/privacy" className="text-gray-400 hover:text-gray-700 transition-colors">Privacy</Link>
              <Link href="/terms"   className="text-gray-400 hover:text-gray-700 transition-colors">Terms</Link>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}