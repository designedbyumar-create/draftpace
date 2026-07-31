import Image from "next/image";
import { ArrowRight } from "@/design-system/Icon";
import { MarketingButton } from "@/components/marketing/ui";

const VALUES = [
  { label: "Small on purpose",   body: "We're not optimizing for headcount. We're optimizing for impact per person." },
  { label: "Async by default",   body: "Deep work matters. We don't fill calendars — we protect time." },
  { label: "Ship, then refine",  body: "Real feedback beats internal debate. We get things in front of users fast." },
];

export default function CareersPage() {
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
              Careers
            </span>
          </div>

          <h1
            className="font-black text-gray-950 leading-[1.0] mb-5"
            style={{ fontSize: "clamp(34px, 5vw, 54px)", letterSpacing: "-0.04em" }}
          >
            Small team.
            <span className="text-indigo-600"> Big</span> ambition.
          </h1>

          <p className="text-[16px] text-gray-500 leading-relaxed mb-8 max-w-md mx-auto">
            We're building Draftpace with a tight, focused team. No open roles right now — but when we grow, it'll be deliberate.
          </p>

          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-xl text-[13px] font-semibold">
            No open roles right now — check back soon
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6">How we work</p>
          <div className="flex flex-col gap-4">
            {VALUES.map((v) => (
              <div key={v.label}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-all">
                <p className="text-[15px] font-bold text-gray-950 mb-1.5">{v.label}</p>
                <p className="text-[14px] text-gray-500 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>

          {/* Stay in touch */}
          <div className="mt-10 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
            <p className="text-[14px] font-semibold text-gray-900 mb-1">
              Think you'd fit?
            </p>
            <p className="text-[13px] text-gray-500 mb-4">
              We're not hiring right now, but we're always open to a conversation.
            </p>
            <MarketingButton
              href="mailto:team@draftpace.com"
              size="sm"
              iconRight={<ArrowRight size={13} />}
              className="font-bold"
            >
              Say hello
            </MarketingButton>
          </div>
        </div>
      </section>

    </main>
  );
}
