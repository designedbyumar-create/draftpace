const SCENARIOS = [
  "There is too much to keep track of, and none of it is written down in the same place.",
  "I know what I need to do, but I cannot see where to start.",
  "The plan made sense before something changed, and now it does not quite fit.",
];

export default function RecognitionSection() {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Why it gets hard</p>
        <h2 className="mt-3 font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
          Some things are hard because there is too much to hold at once.
        </h2>
      </div>
      <div className="flex flex-col divide-y divide-[var(--border)]">
        {SCENARIOS.map((scenario) => (
          <p key={scenario} className="py-5 text-[16px] leading-relaxed text-[var(--text)] first:pt-0">
            &ldquo;{scenario}&rdquo;
          </p>
        ))}
      </div>
    </div>
  );
}
