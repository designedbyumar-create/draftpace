import Image from "next/image";
import Link from "next/link";

const SECTIONS = [
  {
    id: "what-we-collect",
    title: "What we collect",
    content: [
      {
        sub: "Account information",
        body: "When you sign up, we collect your email address and display name. This is used to create and identify your account. We never ask for your real name — your display name is whatever you choose.",
      },
      {
        sub: "Usage data",
        body: "We store your planner progress, daily check-ins, streak counts, and completion history. This is the core of what Draftpace does — without it, the product doesn't work.",
      },
      {
        sub: "Connected account data",
        body: "If you connect Gumroad or Etsy, we fetch your purchase history from those platforms to import planners into your Drafts. We only read purchase data — we never access payment details or other account activity.",
      },
      {
        sub: "Notification preferences",
        body: "Your reminder time and notification toggles are stored in your account so they persist across devices.",
      },
      {
        sub: "What we don't collect",
        body: "We don't collect your location, device fingerprints, browsing history, or any data unrelated to using Draftpace. We don't run advertising or sell your data. Ever.",
      },
    ],
  },
  {
    id: "how-we-use-it",
    title: "How we use it",
    content: [
      {
        sub: "To run the product",
        body: "Your data powers your dashboard — streaks, progress, Today's Focus, Drafts. Without it, none of this works.",
      },
      {
        sub: "To send you reminders",
        body: "If you enable daily reminders, we use your email to send a nudge at your chosen time. You can turn this off at any time in Settings.",
      },
      {
        sub: "To improve Draftpace",
        body: "We look at aggregate, anonymised usage patterns (e.g. which planner types are most popular) to decide what to build next. We don't analyse individual user behaviour without reason.",
      },
    ],
  },
  {
    id: "who-we-share-with",
    title: "Who we share it with",
    content: [
      {
        sub: "Sub-processors",
        body: "We use Supabase for authentication and database storage, Stripe for payment processing, and Vercel for hosting. Each of these processes only the data necessary for their function. We have data processing agreements with all of them.",
      },
      {
        sub: "Gumroad and Etsy",
        body: "When you connect these accounts, data flows between their platforms and Draftpace under your explicit authorisation. We don't share your Draftpace data with them.",
      },
      {
        sub: "No selling, no advertising",
        body: "We do not sell, rent, or share your personal data with advertisers, data brokers, or third parties for commercial purposes. This is a hard line.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    content: [
      {
        sub: "Access and export",
        body: "You can export all your data at any time from Settings → Data & Privacy → Export my data. We'll send a complete download to your email.",
      },
      {
        sub: "Deletion",
        body: "Deleting your account from Settings removes all your personal data, progress, and history permanently. This cannot be undone.",
      },
      {
        sub: "Corrections",
        body: "You can update your display name in Settings at any time. To update your email address, contact us directly.",
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    content: [
      {
        sub: "How we protect your data",
        body: "All data is encrypted in transit (TLS) and at rest. Authentication is handled by Supabase, which uses industry-standard security practices. We don't store passwords — authentication uses secure tokens.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    content: [
      {
        sub: "Questions or concerns",
        body: "Email us at privacy@draftpace.com. We respond within 5 business days.",
      },
    ],
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mb-3 max-w-lg">
            We built Draftpace to help you build momentum — not to mine your data. Here's exactly what we collect, why, and what we don't do with it.
          </p>
          <p className="text-[12px] text-gray-400">Last updated: June 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 lg:px-8 py-14">
        <div className="mx-auto max-w-2xl">

          {/* TOC */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Contents</p>
            <div className="flex flex-col gap-2">
              {SECTIONS.map((s, i) => (
                <a key={s.id} href={`#${s.id}`}
                  className="flex items-center gap-3 text-[14px] text-gray-500 hover:text-indigo-600 transition-colors">
                  <span className="text-[11px] font-black text-gray-300 w-5">0{i + 1}</span>
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-12">
            {SECTIONS.map((section, i) => (
              <div key={section.id} id={section.id}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[11px] font-black text-gray-300 tracking-widest">0{i + 1}</span>
                  <h2 className="text-[20px] font-bold text-gray-950">{section.title}</h2>
                </div>
                <div className="flex flex-col gap-5">
                  {section.content.map((item) => (
                    <div key={item.sub}
                      className="bg-white border border-gray-100 rounded-xl p-5">
                      <p className="text-[14px] font-semibold text-gray-900 mb-1.5">{item.sub}</p>
                      <p className="text-[14px] text-gray-500 leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[13px] text-gray-400">Questions? <a href="mailto:privacy@draftpace.com" className="text-indigo-600 hover:underline">privacy@draftpace.com</a></p>
            <div className="flex items-center gap-4 text-[13px]">
              <Link href="/terms"   className="text-gray-400 hover:text-gray-700 transition-colors">Terms</Link>
              <Link href="/cookies" className="text-gray-400 hover:text-gray-700 transition-colors">Cookies</Link>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}