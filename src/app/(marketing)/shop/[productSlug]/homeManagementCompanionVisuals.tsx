/**
 * Bespoke mobile mockups for Home Base's Shop page, following the exact
 * pattern personalFinanceCompanionVisuals.tsx established: real
 * recreations of the actual product UI (the same "Needs attention" /
 * "on track" treatment shipped in WorkspaceModule.tsx, the same grouped
 * Attention inbox from AttentionModule.tsx, the same three-area Records
 * hub from RecordsModule.tsx), not screenshots and not a generic
 * template. Sage accent (#4f7a5c, Home Base's real theme.accent, see
 * definition.ts) distinguishes it from PFC's teal and MMR's clay at a
 * glance. Appliance/task names below are illustrative but internally
 * consistent, never presented as real account data. Only features that
 * are actually built are shown here: no CSV import screen exists yet
 * since that phase hasn't shipped.
 */

function StatusBar({ tone = "light" }: { tone?: "light" | "dark" }) {
  const color = tone === "dark" ? "text-white" : "text-[#1a2420]";
  return (
    <div className={`flex items-center justify-between px-1 text-[10px] font-semibold ${color}`}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="h-2 w-3 rounded-[1px] border border-current" />
        <span className="h-2 w-2 rounded-full border border-current" />
      </div>
    </div>
  );
}

/** Same phone chrome as PFC's mockups, glow tinted sage instead of teal so
 * the two paid Companions read as distinct products at a glance while
 * staying visually consistent as a family. */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 inset-y-8 -z-10 rounded-[3rem] bg-[#4f7a5c] opacity-[0.16] blur-3xl"
      />
      <div
        className="relative overflow-hidden rounded-[2.75rem] border-[6px] border-[#101312] bg-[#101312] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)]"
        style={{ aspectRatio: "9 / 19.5" }}
      >
        <div className="absolute left-1/2 top-2.5 z-10 h-[16px] w-[84px] -translate-x-1/2 rounded-full bg-[#101312]" aria-hidden />
        <div className="absolute inset-0 overflow-hidden rounded-[2.25rem]">{children}</div>
      </div>
    </div>
  );
}

/** Screen 1: Today, the picture you land on. Used in the hero. Mirrors
 * WorkspaceModule.tsx's "Needs attention" list plus "on track" banner. */
export function OverviewScreenMockup() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[#f4f2ec] px-4 pb-4 pt-9">
        <StatusBar />
        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[#6b7570]">Home base</p>
        <p className="mt-1 text-[15px] font-semibold text-[#1a2420]">Your home, right now</p>

        <p className="mt-4 text-[8px] font-bold uppercase tracking-[0.1em] text-[#8b9089]">Needs attention (2)</p>
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex items-start gap-2 rounded-xl border border-[#e0b98a] bg-[#f7eedb] p-3">
            <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full bg-[#9a5a11]" aria-hidden />
            <p className="flex-1 text-[10.5px] font-medium leading-relaxed text-[#1a2420]">Furnace filter is 12 days overdue.</p>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-[#e0b98a] bg-[#f7eedb] p-3">
            <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full bg-[#9a5a11]" aria-hidden />
            <p className="flex-1 text-[10.5px] font-medium leading-relaxed text-[#1a2420]">Water heater warranty expires in 18 days.</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#cfe0d1] bg-[#e3f3ec] p-3">
          <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#12795b]" aria-hidden />
          <p className="text-[10px] font-medium text-[#1a2420]">3 other items are on track.</p>
        </div>

        <div className="mt-auto flex items-center justify-between rounded-xl border border-[#e4e0d5] bg-white px-3 py-2.5 text-[8px] font-semibold text-[#8b9089]">
          <span className="text-[#4f7a5c]">Today</span>
          <span>Attention</span>
          <span>Records</span>
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Screen 2: the honest gaps it watches for you, never a fabricated task.
 * Mirrors AttentionModule.tsx's grouped "Needs resolution" / "Worth a
 * while" sections, including the Mark done action on maintenance-due
 * items. */
export function AttentionScreenMockup() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[#f4f2ec] px-4 pb-4 pt-9">
        <StatusBar />
        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[#6b7570]">Attention</p>
        <p className="mt-1 text-[14px] font-semibold text-[#1a2420]">Everything here is real</p>
        <p className="mt-1 text-[10px] leading-relaxed text-[#6b7570]">
          Derived from what you have recorded. Mark it done and it disappears on its own.
        </p>

        <p className="mt-4 text-[8px] font-bold uppercase tracking-[0.1em] text-[#8b9089]">Needs resolution (2)</p>
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-[#e4e0d5] bg-white p-3">
            <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#9a5a11]" aria-hidden />
            <p className="flex-1 text-[10px] font-medium leading-relaxed text-[#1a2420]">Furnace filter is 12 days overdue.</p>
            <span className="shrink-0 rounded-md border border-[#dcd7ca] px-2 py-1 text-[8px] font-semibold text-[#1a2420]">
              Mark done
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#e4e0d5] bg-white p-3">
            <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#9a5a11]" aria-hidden />
            <p className="flex-1 text-[10px] font-medium leading-relaxed text-[#1a2420]">Water heater warranty expires in 18 days.</p>
          </div>
        </div>

        <p className="mt-4 text-[8px] font-bold uppercase tracking-[0.1em] text-[#8b9089]">Worth a while (1)</p>
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-[#e4e0d5] bg-white p-3">
            <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#c7c2b3]" aria-hidden />
            <p className="flex-1 text-[10px] font-medium leading-relaxed text-[#1a2420]">Dishwasher has not been serviced in 14 months.</p>
          </div>
        </div>

        <div className="mt-auto rounded-lg bg-[#e6ede2] px-3 py-2.5 text-center text-[9px] font-semibold text-[#4f7a5c]">
          Never a fabricated to-do, always a real gap
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Screen 3: the guided way it stays organized, area by area. Mirrors
 * RecordsModule.tsx's three-card Records hub (Appliances, Maintenance,
 * Service providers). */
export function RecordsScreenMockup() {
  const areas: [string, string, string][] = [
    ["Appliances", "6 appliances tracked", "3 with warranty on file"],
    ["Maintenance", "4 tasks tracked", "1 never logged"],
    ["Service providers", "3 providers saved", ""],
  ];
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[#f4f2ec] px-4 pb-4 pt-9">
        <StatusBar />
        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[#6b7570]">Records</p>
        <p className="mt-1 text-[14px] font-semibold text-[#1a2420]">What&rsquo;s actually in your home</p>

        <div className="mt-4 flex flex-col gap-2.5">
          {areas.map(([label, primary, secondary]) => (
            <div key={label} className="rounded-xl border border-[#e4e0d5] bg-white p-3.5">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6ede2] text-[#4f7a5c]">
                  <span className="h-2.5 w-2.5 rounded-[2px] border-2 border-current" aria-hidden />
                </span>
                <span className="text-[13px] text-[#8b9089]">›</span>
              </div>
              <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.08em] text-[#8b9089]">{label}</p>
              <p className="mt-1 text-[11px] font-medium text-[#1a2420]">
                {primary}
                {secondary ? ` · ${secondary}` : ""}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between rounded-xl border border-[#e4e0d5] bg-white px-3 py-2.5 text-[8px] font-semibold text-[#8b9089]">
          <span>Today</span>
          <span>Attention</span>
          <span className="text-[#4f7a5c]">Records</span>
        </div>
      </div>
    </PhoneFrame>
  );
}
