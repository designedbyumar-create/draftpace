import Image from "next/image";
import { ArrowRight } from "@/components/ui/Icon";
import { MarketingButton } from "@/components/marketing/ui";

const FAQS = [
  {
    q: "How do I connect my Gumroad account?",
    a: "Go to your Dashboard → Drafts → Purchases tab. Tap 'Connect Gumroad' and follow the steps. Your purchases import automatically.",
  },
  {
    q: "My planner isn't showing up after I bought it.",
    a: "Connect your Gumroad or Etsy account in Drafts → Purchases. If you bought it manually, use the 'Add manually' option with your receipt email.",
  },
  {
    q: "How do streaks work?",
    a: "Open your active planner and check in for the day. Any check-in counts toward your streak. Missing a day resets it — so set a daily reminder in Settings.",
  },
  {
    q: "Can I cancel my membership?",
    a: "Yes — cancel anytime from Settings → Subscription → Manage billing. You keep access until the end of your billing period.",
  },
  {
    q: "How do I change my reminder time?",
    a: "Settings → Notifications → Reminder time. Pick any 30-minute slot between 6 AM and 10 PM.",
  },
  {
    q: "I found a bug. How do I report it?",
    a: "Email us at support@draftpace.com with a short description and a screenshot if possible. We respond within 24 hours.",
  },
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#fafaf9]">

      {/* Hero */}
      <section
        className="bg-white border-b border-gray-100 px-6 lg:px-8 pt-28 pb-20"
        style={{
          backgroundImage: `linear-gradient(#e8e8e6 1px, transparent 1px), linear-gradient(90deg, #e8e8e6 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
        }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full mb-7">
            <Image src="/logo/dp-mono.svg" alt="Draftpace" width={13} height={13}/>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
              Support
            </span>
          </div>

          <h1
            className="font-black text-gray-950 leading-[1.0] mb-5"
            style={{ fontSize: "clamp(34px, 5vw, 54px)", letterSpacing: "-0.04em" }}
          >
            How can we
            <span className="text-indigo-600"> help?</span>
          </h1>

          <p className="text-[16px] text-gray-500 leading-relaxed max-w-sm mx-auto">
            Most answers are below. If not — email us and we'll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact bar */}
      <section className="px-6 lg:px-8 py-6 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[14px] text-gray-500">
            Can't find what you need?
          </p>
          <MarketingButton
            href="mailto:support@draftpace.com"
            size="sm"
            iconRight={<ArrowRight size={13} />}
            className="font-bold"
          >
            Email support@draftpace.com
          </MarketingButton>
        </div>
      </section>

      {/* FAQs */}
      <section className="px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-8">
            Common questions
          </p>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq) => (
              <div key={faq.q}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-all">
                <p className="text-[15px] font-bold text-gray-950 mb-2">{faq.q}</p>
                <p className="text-[14px] text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Still stuck */}
          <div className="mt-10 rounded-2xl px-6 py-8 text-center"
            style={{ background: "linear-gradient(135deg, #e0e7ff, #ede9fe)", border: "1px solid rgba(99,102,241,0.15)" }}>
            <p className="text-[16px] font-bold text-gray-950 mb-1">Still stuck?</p>
            <p className="text-[13px] text-gray-500 mb-5">
              We read every email. Usually reply within a few hours.
            </p>
            <MarketingButton
              href="mailto:support@draftpace.com"
              iconRight={<ArrowRight size={13} />}
              className="font-bold"
            >
              support@draftpace.com
            </MarketingButton>
          </div>
        </div>
      </section>

    </main>
  );
}
