/**
 * Bespoke mobile mockups for Vehicle Maintenance Companion's Shop page,
 * following the pattern its siblings established: real recreations of
 * the shipped product UI, on the shared PhoneFrame from day one, not a
 * locally-duplicated bezel.
 *
 * What is drawn maps to what ships: WorkspaceModule's dominant-action
 * hero for the single most urgent due item, the Service Boundary
 * printable's requested/not-authorized split, and the template-picker +
 * severe-duty toggle from adding a maintenance item. Olive (#4d5a35, the
 * real theme.accent) reads as tools and a garage, distinct from every
 * other accent already in use on this platform.
 *
 * Nothing drawn here implies a real factory schedule, a live vehicle
 * connection, or a shop booking: every figure traces to something a
 * person typed in, same discipline as the product itself.
 */
import PhoneFrame from "../PhoneFrame";

const INK = "#211f1a";
const MUTED = "#6f6c62";
const FAINT = "#9a9689";
const STEEL = "#4d5a35";
const PAPER = "#fbfaf7";
const LINE = "#e9e7e0";

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

function TabBar({ current }: { current: "Due" | "Vehicles" | "Boundary" }) {
  return (
    <div
      className="mt-auto flex items-center justify-between rounded-xl border bg-white px-4 py-2.5 text-[8.5px] font-semibold"
      style={{ borderColor: LINE, color: FAINT }}
    >
      {(["Due", "Vehicles", "Boundary"] as const).map((tab) => (
        <span key={tab} style={tab === current ? { color: STEEL } : undefined}>
          {tab}
        </span>
      ))}
    </div>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[7.5px] font-bold uppercase tracking-[0.14em]" style={{ color: STEEL }}>
      {children}
    </p>
  );
}

/**
 * Screen 1: Due, the single ranked "what's due" view. Drawn with a real
 * overdue item as the dominant-action hero, exactly the WorkspaceModule
 * treatment: one urgent thing named plainly, with a real remaining
 * figure, never a generic checklist.
 */
export function OverviewScreenMockup() {
  return (
    <PhoneFrame accent={STEEL}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <Eyebrow>Due</Eyebrow>
          <h3 className="mt-2 text-[16px] font-semibold leading-[1.15]" style={{ color: INK, fontFamily: "Georgia, serif" }}>
            What&apos;s due, across everything you own.
          </h3>

          <div className="mt-3 rounded-lg border-l-[3px] border bg-white p-2.5" style={{ borderColor: LINE, borderLeftColor: "#b5482f" }}>
            <p className="text-[7px] font-bold uppercase tracking-[0.08em]" style={{ color: "#b5482f" }}>
              Due
            </p>
            <p className="mt-1 text-[10px] font-semibold" style={{ color: INK }}>
              Engine oil and filter change
            </p>
            <p className="mt-0.5 text-[8px]" style={{ color: MUTED }}>
              2019 Honda Civic
            </p>
            <p className="mt-1 text-[8px]" style={{ color: MUTED }}>
              320 miles past due (every 5,000 miles)
            </p>
            <span className="mt-2 inline-block rounded-md border px-2 py-1 text-[7.5px] font-semibold" style={{ borderColor: STEEL, color: STEEL }}>
              Mark done today
            </span>
          </div>

          <p className="mt-3 text-[7.5px] font-bold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
            Also due
          </p>
          <div className="mt-1.5 rounded-lg border bg-white p-2.5" style={{ borderColor: LINE }}>
            <p className="text-[8.5px]" style={{ color: INK }}>
              Tire rotation
              <span style={{ color: MUTED }}> · 2019 Honda Civic</span>
            </p>
            <p className="mt-0.5 text-[7.5px]" style={{ color: MUTED }}>
              180 miles left
            </p>
          </div>
        </div>
        <TabBar current="Due" />
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 2: the Service Boundary, this product's signature feature. The
 * exact requested-today / not-authorized split the printable itself
 * generates, drawn as the choosing step before generating it.
 */
export function ServiceBoundaryScreenMockup() {
  return (
    <PhoneFrame accent={STEEL}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <Eyebrow>Boundary</Eyebrow>
          <h3 className="mt-2 text-[15px] font-semibold leading-[1.15]" style={{ color: INK, fontFamily: "Georgia, serif" }}>
            Service Boundary
          </h3>
          <p className="mt-1 text-[8px]" style={{ color: MUTED }}>
            2019 Honda Civic, at 62,340 miles
          </p>

          <p className="mt-3 text-[7px] font-bold uppercase tracking-[0.08em]" style={{ color: STEEL }}>
            Requested today
          </p>
          <div className="mt-1.5 rounded-lg border bg-white p-2.5" style={{ borderColor: LINE }}>
            <p className="text-[8.5px] font-semibold" style={{ color: INK }}>
              Engine oil and filter change
            </p>
          </div>

          <p className="mt-2.5 text-[7px] font-bold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
            Not authorized without a further conversation
          </p>
          <div className="mt-1.5 flex flex-col gap-1.5">
            {["Brake pad and rotor inspection", "Cabin air filter replacement"].map((task) => (
              <div key={task} className="rounded-lg border bg-white p-2" style={{ borderColor: LINE }}>
                <p className="text-[8px]" style={{ color: MUTED }}>
                  {task}
                </p>
              </div>
            ))}
          </div>

          <span className="mt-3 inline-block self-start rounded-md px-2.5 py-1.5 text-[7.5px] font-semibold text-white" style={{ backgroundColor: STEEL }}>
            Generate
          </span>
        </div>
        <TabBar current="Boundary" />
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 3: adding a maintenance item, the template picker and the
 * severe-duty toggle, the two mechanisms the whole feature build was
 * about: a typical starting interval, always editable, and a one-time
 * per-item toggle rather than a second interval table.
 */
export function AddItemScreenMockup() {
  return (
    <PhoneFrame accent={STEEL}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <Eyebrow>Vehicles</Eyebrow>
          <h3 className="mt-2 text-[14px] font-semibold leading-[1.15]" style={{ color: INK, fontFamily: "Georgia, serif" }}>
            Track a maintenance item
          </h3>

          <p className="mt-3 text-[7px] font-semibold" style={{ color: MUTED }}>
            Start from a typical job (optional)
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {["Oil change", "Tire rotation", "Brake fluid"].map((label, i) => (
              <span
                key={label}
                className="rounded-full border px-2 py-1 text-[7px] font-semibold"
                style={i === 0 ? { borderColor: STEEL, color: STEEL } : { borderColor: LINE, color: FAINT }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="mt-2.5 rounded-lg border bg-white p-2" style={{ borderColor: LINE }}>
            <p className="text-[7px]" style={{ color: FAINT }}>
              Interval, miles
            </p>
            <p className="text-[9.5px] font-semibold" style={{ color: INK }}>
              5,000
              <span className="ml-1 text-[7px] font-normal" style={{ color: MUTED }}>
                typical, editable
              </span>
            </p>
          </div>

          <label className="mt-2.5 flex items-start gap-1.5 text-[8px]" style={{ color: INK }}>
            <span className="mt-[1px] h-2.5 w-2.5 shrink-0 rounded-[2px] border" style={{ borderColor: STEEL, backgroundColor: STEEL }} />
            <span>
              Severe duty for this job
              <span className="block text-[7px] font-normal" style={{ color: MUTED }}>
                Halves this job&apos;s interval only.
              </span>
            </span>
          </label>

          <span className="mt-3 inline-block self-start rounded-md px-2.5 py-1.5 text-[7.5px] font-semibold text-white" style={{ backgroundColor: STEEL }}>
            Add item
          </span>
        </div>
        <TabBar current="Vehicles" />
      </div>
    </PhoneFrame>
  );
}
