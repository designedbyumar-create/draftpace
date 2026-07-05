import Image from "next/image";
import { ArrowRight } from "@/components/ui/Icon";
import { MarketingButton } from "@/components/marketing/ui";

const TOPICS = [
  "Building streaks that stick",
  "Why most planners fail by February",
  "The compound effect of daily check-ins",
  "Money habits worth tracking",
  "Designing your own 30-day challenge",
];

export default function BlogPage() {
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
              Draftpace Blog
            </span>
          </div>

          <h1
            className="font-black text-gray-950 leading-[1.0] mb-5"
            style={{ fontSize: "clamp(34px, 5vw, 54px)", letterSpacing: "-0.04em" }}
          >
            Ideas on consistency,
            <span className="text-indigo-600"> momentum,</span>
            <br/>and building better habits.
          </h1>

          <p className="text-[16px] text-gray-500 leading-relaxed mb-10 max-w-md mx-auto">
            We're writing about the things that actually move the needle. First article dropping soon.
          </p>

          {/* Email notify */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 h-12 bg-white border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 text-[14px] text-gray-900 placeholder-gray-400 transition-all"
            />
            <MarketingButton
              size="md"
              iconRight={<ArrowRight size={14} />}
              className="h-12 px-5"
            >
              Notify me
            </MarketingButton>
          </div>
          <p className="text-[11px] text-gray-400 mt-3">No spam. One email when we publish.</p>
        </div>
      </section>

      {/* Upcoming topics */}
      <section className="px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6 text-center">
            What's coming
          </p>
          <div className="flex flex-col gap-0">
            {TOPICS.map((topic, i) => (
              <div key={topic}
                className="flex items-center gap-5 py-5 border-b border-gray-100 group cursor-default">
                <span className="text-[11px] font-black text-gray-200 tracking-widest shrink-0 w-6">
                  0{i + 1}
                </span>
                <p className="text-[15px] font-semibold text-gray-400 group-hover:text-gray-700 transition-colors flex-1">
                  {topic}
                </p>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full shrink-0">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
