export default function RecoverySection() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Coming back</p>
      <h2 className="mt-3 font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
        Start again without starting over.
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
        You do not want to rebuild everything from memory, and going back now should not feel like more work than
        it is worth. When you return after a while, Draftpace does not show you a lost streak or a wall of overdue
        tasks. It asks what changed, and gets you to one small step you can take right now.
      </p>

      <div className="mx-auto mt-8 max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left">
        <p className="text-[13px] font-semibold text-[var(--text)]">Welcome back</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
          It has been a while. A few things may have changed. Want to update what's different, or just pick up where
          you left off?
        </p>
      </div>
    </div>
  );
}
