/**
 * Bespoke mobile mockups for Family Health Binder's Shop page, following
 * the pattern its siblings established: real recreations of the shipped
 * product UI, on the shared PhoneFrame from day one.
 *
 * What is drawn maps to what ships: Overview's per-member summary rows,
 * the structured symptom-recording form with its real onset/duration/
 * severity fields, and the Intake Summary printable's own section
 * layout. Dusty lavender-blue (#606e8e, the real theme.accent) is
 * deliberately not clinical white or medical red/green: this product is
 * a record, not a monitor.
 *
 * Nothing drawn here implies a diagnosis, a triage opinion, or medical
 * advice of any kind: every line traces to something a person recorded
 * about their own family.
 */
import PhoneFrame from "../PhoneFrame";

const INK = "#21242c";
const MUTED = "#6d7280";
const FAINT = "#9a9fac";
const ACCENT = "#606e8e";
const PAPER = "#fdfdfe";
const LINE = "#e4e8ef";

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-1 text-[10px] font-semibold" style={{ color: INK }}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="h-2 w-3 rounded-[1px] border border-current" />
        <span className="h-2 w-2 rounded-full border border-current" />
      </div>
    </div>
  );
}

function TabBar({ current }: { current: "Overview" | "Family" | "Symptoms" }) {
  return (
    <div
      className="mt-auto flex items-center justify-between rounded-xl border bg-white px-4 py-2.5 text-[8.5px] font-semibold"
      style={{ borderColor: LINE, color: FAINT }}
    >
      {(["Overview", "Family", "Symptoms"] as const).map((tab) => (
        <span key={tab} style={tab === current ? { color: ACCENT } : undefined}>
          {tab}
        </span>
      ))}
    </div>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[7.5px] font-bold uppercase tracking-[0.14em]" style={{ color: ACCENT }}>
      {children}
    </p>
  );
}

/**
 * Screen 1: Overview, every family member and a one-line summary of
 * what's recorded for them, plus the most recently logged symptom
 * across the family when there is one.
 */
export function OverviewScreenMockup() {
  return (
    <PhoneFrame accent={ACCENT}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <Eyebrow>Overview</Eyebrow>
          <h3 className="mt-2 text-[16px] font-semibold leading-[1.15]" style={{ color: INK, fontFamily: "Georgia, serif" }}>
            3 people in this binder.
          </h3>

          <div className="mt-3 rounded-lg border bg-white p-2.5" style={{ borderColor: LINE }}>
            <p className="text-[7px] font-bold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
              Most recently recorded
            </p>
            <p className="mt-1 text-[9px]" style={{ color: INK }}>
              Amina: Fever, 2026-09-01
            </p>
          </div>

          {[
            { name: "Amina", relation: "Child", detail: "1 medication, 1 allergy" },
            { name: "Yusuf", relation: "Spouse", detail: "Nothing recorded yet" },
          ].map((row) => (
            <div key={row.name} className="mt-2 rounded-lg border bg-white p-2.5" style={{ borderColor: LINE }}>
              <div className="flex items-baseline justify-between">
                <p className="text-[9.5px] font-semibold" style={{ color: INK }}>
                  {row.name}
                </p>
                <span className="text-[7px] font-semibold uppercase" style={{ color: FAINT }}>
                  {row.relation}
                </span>
              </div>
              <p className="mt-0.5 text-[8px]" style={{ color: MUTED }}>
                {row.detail}
              </p>
            </div>
          ))}
        </div>
        <TabBar current="Overview" />
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 2: recording a symptom, the structured onset/duration/severity
 * fields that are this product's central design decision, never one
 * free-text box.
 */
export function SymptomFormScreenMockup() {
  return (
    <PhoneFrame accent={ACCENT}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <Eyebrow>Symptoms</Eyebrow>
          <h3 className="mt-2 text-[14px] font-semibold leading-[1.15]" style={{ color: INK, fontFamily: "Georgia, serif" }}>
            Record a symptom for Amina
          </h3>

          <div className="mt-3 rounded-lg border bg-white p-2" style={{ borderColor: LINE }}>
            <p className="text-[7px]" style={{ color: FAINT }}>
              Symptom
            </p>
            <p className="text-[9.5px] font-semibold" style={{ color: INK }}>
              Fever
            </p>
          </div>

          <div className="mt-2 flex gap-1.5">
            <div className="flex-1 rounded-lg border bg-white p-2" style={{ borderColor: LINE }}>
              <p className="text-[7px]" style={{ color: FAINT }}>
                Onset
              </p>
              <p className="text-[9px] font-semibold" style={{ color: INK }}>
                2026-09-01
              </p>
            </div>
            <div className="w-14 rounded-lg border bg-white p-2" style={{ borderColor: LINE }}>
              <p className="text-[7px]" style={{ color: FAINT }}>
                Duration
              </p>
              <p className="text-[9px] font-semibold" style={{ color: INK }}>
                3 days
              </p>
            </div>
          </div>

          <p className="mt-2.5 text-[7px] font-semibold" style={{ color: MUTED }}>
            Severity
          </p>
          <div className="mt-1 flex gap-1">
            {["Mild", "Moderate", "Severe"].map((s, i) => (
              <span
                key={s}
                className="rounded-md border px-2 py-1 text-[7.5px] font-semibold"
                style={i === 1 ? { backgroundColor: ACCENT, borderColor: ACCENT, color: "#fff" } : { borderColor: LINE, color: FAINT }}
              >
                {s}
              </span>
            ))}
          </div>

          <span className="mt-3 inline-block self-start rounded-md px-2.5 py-1.5 text-[7.5px] font-semibold text-white" style={{ backgroundColor: ACCENT }}>
            Record it
          </span>
        </div>
        <TabBar current="Symptoms" />
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 3: the Intake Summary printable's own section layout, drawn as
 * the on-screen preview before generating it.
 */
export function IntakeSummaryScreenMockup() {
  return (
    <PhoneFrame accent={ACCENT}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <Eyebrow>Summary</Eyebrow>
          <h3 className="mt-2 text-[15px] font-semibold leading-[1.15]" style={{ color: INK, fontFamily: "Georgia, serif" }}>
            Intake Summary
          </h3>
          <p className="mt-1 text-[8px]" style={{ color: MUTED }}>
            Amina, born 2018-04-02
          </p>

          {[
            { label: "Medications", value: "Amoxicillin, 250mg" },
            { label: "Allergies", value: "Peanuts" },
            { label: "Recent symptoms", value: "Fever, 2026-09-01" },
          ].map((row) => (
            <div key={row.label} className="mt-2.5">
              <p className="text-[7px] font-bold uppercase tracking-[0.08em]" style={{ color: ACCENT }}>
                {row.label}
              </p>
              <div className="mt-1 rounded-lg border bg-white p-2" style={{ borderColor: LINE }}>
                <p className="text-[8.5px]" style={{ color: INK }}>
                  {row.value}
                </p>
              </div>
            </div>
          ))}

          <span className="mt-3 inline-block self-start rounded-md px-2.5 py-1.5 text-[7.5px] font-semibold text-white" style={{ backgroundColor: ACCENT }}>
            Generate
          </span>
        </div>
        <TabBar current="Family" />
      </div>
    </PhoneFrame>
  );
}
