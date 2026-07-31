import Image from "next/image";
import Link from "next/link";

const SECTIONS = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    content: [
      {
        sub: "By using Draftpace, you agree to these terms",
        body: "If you don't agree, don't use the product. These terms apply to all users — free and paid. We may update them occasionally; continued use after an update means you accept the new terms. We'll notify you of material changes by email.",
      },
    ],
  },
  {
    id: "what-we-provide",
    title: "What we provide",
    content: [
      {
        sub: "The Draftpace platform",
        body: "Draftpace gives you access to interactive planners, streak tracking, progress monitoring, and integrations with Gumroad and Etsy. The free tier includes 3 planners. The Pro membership ($7/month or $49/year) unlocks all 200+ planners.",
      },
      {
        sub: "Service availability",
        body: "We aim for high availability but don't guarantee it. Draftpace may be unavailable during maintenance or due to circumstances beyond our control. We are not liable for losses caused by downtime.",
      },
    ],
  },
  {
    id: "your-account",
    title: "Your account",
    content: [
      {
        sub: "You're responsible for your account",
        body: "Keep your login credentials secure. You're responsible for all activity under your account. If you suspect unauthorised access, contact us immediately at support@draftpace.com.",
      },
      {
        sub: "One account per person",
        body: "Accounts are personal. You may not share, sell, or transfer your account to another person.",
      },
      {
        sub: "Account termination",
        body: "You can delete your account at any time from Settings. We may suspend or terminate accounts that violate these terms, engage in abusive behaviour, or attempt to abuse the free tier.",
      },
    ],
  },
  {
    id: "billing",
    title: "Billing and subscriptions",
    content: [
      {
        sub: "Pro membership",
        body: "The Pro plan is billed monthly ($7) or annually ($49). Payments are processed by Stripe. We don't store your card details.",
      },
      {
        sub: "Cancellation",
        body: "Cancel anytime from Settings → Subscription → Manage billing. You keep Pro access until the end of your paid period. We don't offer refunds for partial months, but we don't lock you in either.",
      },
      {
        sub: "External purchases",
        body: "Planners bought on Gumroad or Etsy are governed by those platforms' terms. Draftpace facilitates tracking them — we're not responsible for the purchase itself.",
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: [
      {
        sub: "What you may not do",
        body: "You may not attempt to reverse-engineer Draftpace, scrape our content, resell access, use the platform to distribute harmful or illegal content, or attempt to circumvent usage limits through automation or multiple accounts.",
      },
    ],
  },
  {
    id: "ip",
    title: "Intellectual property",
    content: [
      {
        sub: "Our content",
        body: "All planners, copy, design, and code in Draftpace belong to us or our licensors. You may use them through the platform but may not copy, redistribute, or resell them.",
      },
      {
        sub: "Your data",
        body: "Your planner entries, check-ins, and personal data belong to you. We hold a limited license to store and display them in order to provide the service. We don't claim ownership of anything you create.",
      },
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: [
      {
        sub: "We're not liable for indirect losses",
        body: "Draftpace is provided as-is. We're not liable for indirect, incidental, or consequential damages — including lost progress, missed goals, or data loss — arising from use of the platform. Our total liability is limited to what you paid us in the past 12 months.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    content: [
      {
        sub: "Legal questions",
        body: "Email legal@draftpace.com. For general support, use support@draftpace.com.",
      },
    ],
  },
];

export default function TermsPage() {
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
            Terms of Use
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mb-3 max-w-lg">
            Plain language. No traps. Here's what you're agreeing to when you use Draftpace.
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

          <div className="flex flex-col gap-12">
            {SECTIONS.map((section, i) => (
              <div key={section.id} id={section.id}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[11px] font-black text-gray-300 tracking-widest">0{i + 1}</span>
                  <h2 className="text-[20px] font-bold text-gray-950">{section.title}</h2>
                </div>
                <div className="flex flex-col gap-5">
                  {section.content.map((item) => (
                    <div key={item.sub} className="bg-white border border-gray-100 rounded-xl p-5">
                      <p className="text-[14px] font-semibold text-gray-900 mb-1.5">{item.sub}</p>
                      <p className="text-[14px] text-gray-500 leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[13px] text-gray-400">Questions? <a href="mailto:legal@draftpace.com" className="text-indigo-600 hover:underline">legal@draftpace.com</a></p>
            <div className="flex items-center gap-4 text-[13px]">
              <Link href="/privacy" className="text-gray-400 hover:text-gray-700 transition-colors">Privacy</Link>
              <Link href="/cookies" className="text-gray-400 hover:text-gray-700 transition-colors">Cookies</Link>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}