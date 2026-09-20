/**
 * Bespoke mobile mockups for Vehicle Maintenance Companion's Shop page,
 * following the pattern its siblings established: recreations of the
 * shipped product UI, not screenshots and not a generic template.
 *
 * What is drawn maps to what ships. Screen 1 is the Due screen: the
 * vehicle as its instrument cluster, with its odometer and plate, the job
 * most worth attention under a lit lamp, then what else is due and the
 * paperwork dates coming up. Screen 2 is the Service Boundary, on the
 * Print screen. Screen 3 is History: every service, by year. The bottom
 * bar is the real one: Due, Vehicles, History, Paperwork.
 *
 * Every figure is worked out by the same functions the product uses, from
 * a small set of sample records (deriveDueView, describeRemaining,
 * deriveRenewalsView, historyByYear), so a drawing cannot say something the
 * product would not. Every colour comes from the product's own definition,
 * and every phrase drawn is asserted against the component that says it
 * (vehicleMaintenanceCompanionVisuals.test.tsx).
 *
 * The sample vehicles, shops and amounts are illustrative and internally
 * consistent, never presented as real records.
 */
import type { ReactNode } from "react";
import { Article, Car, Clock, Compass } from "@/design-system/Icon";
import { vehicleMaintenanceCompanionDefinition as definition } from "@/products/vehicle-maintenance-companion/definition";
import { deriveDueView } from "@/products/vehicle-maintenance-companion/dueStatus";
import { describeVehicle, vehicleLamps } from "@/products/vehicle-maintenance-companion/fleet";
import { describeInterval, describeRemaining } from "@/products/vehicle-maintenance-companion/dueText";
import { odometerDigits, shortDay } from "@/products/vehicle-maintenance-companion/odometer";
import { describeRenewalTiming, deriveRenewalsView, renewalTitle } from "@/products/vehicle-maintenance-companion/renewals";
import { formatCost, historyByYear } from "@/products/vehicle-maintenance-companion/serviceHistory";
import type { MaintenanceItem, Renewal, ServiceEvent, Vehicle } from "@/products/vehicle-maintenance-companion/state";
import PhoneFrame from "../PhoneFrame";

const theme = definition.theme;
const ground = theme?.ground?.light;
const accent = theme?.accentScale;
const hero = theme?.hero?.light;
if (!ground || !accent || !hero) throw new Error("Vehicle Maintenance Companion must declare its ground, accent scale and hero.");

const DESK = ground.appBg;
const SURFACE = ground.surface;
const SUNKEN = ground.surfaceStrong;
const INK = ground.text;
const MUTED = ground.muted;
const STRONG_RULE = ground.borderStrong;
const ACCENT = accent.base;
const ACCENT_LABEL = accent.contrast;
const HERO_INK = hero.ink;
const HERO_TO = hero.to;
const HERO_BACKGROUND = `radial-gradient(120% 90% at 85% -10%, ${hero.from} 0%, ${hero.mid} 55%, ${hero.to} 100%)`;

const NOW = new Date(2026, 8, 21, 9, 0);
const TODAY = "2026-09-21";
const stamp = { createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" };

const CIVIC: Vehicle = { id: "v1", label: "Civic", year: 2018, make: "Honda", model: "Civic", currentMileage: 50_400, mileageUpdatedAt: "2026-08-01", historyKnown: true, fuelType: "petrol", hardUse: false, plate: "7ABC123", vin: null, tyreSize: null, oilSpec: null, insurer: null, policyNumber: null, roadsidePhone: null, status: "active", ...stamp };
const job = (id: string, taskName: string, intervalMiles: number, intervalMonths: number, lastDoneAt: string, lastDoneMileage: number): MaintenanceItem => ({ id, vehicleId: "v1", templateId: null, taskName, intervalMiles, intervalMonths, severeDuty: false, lastDoneAt, lastDoneMileage, status: "active", ...stamp });
const ITEMS: MaintenanceItem[] = [
  job("i1", "Oil and filter change", 5000, 6, "2026-02-10", 44_900),
  job("i2", "Tire rotation", 6000, 6, "2026-03-20", 45_000),
  job("i3", "Cabin air filter", 15000, 12, "2025-10-05", 39_000),
];
const renewal = (id: string, kind: Renewal["kind"], dueOn: string): Renewal => ({ id, vehicleId: "v1", kind, label: null, dueOn, whereKept: null, note: null, status: "active", ...stamp });
const RENEWALS: Renewal[] = [renewal("r1", "registration", "2026-09-12"), renewal("r2", "insurance", "2026-10-03")];
const service = (id: string, doneOn: string, taskName: string, mileage: number, shop: string | null, costMinorUnits: number | null): ServiceEvent => ({ id, vehicleId: "v1", itemId: null, taskName, doneOn, mileage, shop, costMinorUnits, note: null, status: "active", ...stamp });
export const EVENTS: ServiceEvent[] = [
  service("e1", "2026-09-01", "Engine oil and filter change", 50_100, "Main Street Garage", 8950),
  service("e2", "2026-03-20", "Tire rotation", 45_000, "Main Street Garage", 3000),
  service("e3", "2026-02-14", "Replaced the rear brake pads", 44_900, "Kwik Brakes", 24000),
  service("e4", "2025-10-05", "Cabin air filter", 39_000, null, null),
];
const VAN: Vehicle = { ...CIVIC, id: "v2", label: "Work van", year: 2016, make: "Ford", model: "Transit", currentMileage: 88_100, mileageUpdatedAt: "2026-09-18", plate: "8XYZ456", fuelType: "diesel" };
export const SAMPLE = { vehicles: [CIVIC, VAN], items: ITEMS, renewals: RENEWALS, events: EVENTS };

const MONO = "font-mono";

function StatusBar({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-between px-1 text-[10px] font-semibold" style={{ color }}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="h-2 w-3 rounded-[1px] border border-current" />
        <span className="h-2 w-2 rounded-full border border-current" />
      </div>
    </div>
  );
}

/** The four destinations the product actually has, an icon over a label, the accent only on the tab you are on. Print lives under More, so no tab is lit there. */
function TabBar({ current }: { current: "Due" | "Vehicles" | "History" | "Paperwork" | null }) {
  const tabs = [
    { label: "Due", Icon: Compass },
    { label: "Vehicles", Icon: Car },
    { label: "History", Icon: Clock },
    { label: "Paperwork", Icon: Article },
  ] as const;
  return (
    <div className="-mx-4 -mb-4 mt-auto flex border-t" style={{ borderColor: STRONG_RULE, backgroundColor: SURFACE }}>
      {tabs.map(({ label, Icon }) => (
        <span key={label} className="flex h-10 flex-1 flex-col items-center justify-center gap-px text-[7px] font-semibold" style={{ color: label === current ? ACCENT : MUTED }}>
          <Icon size={12} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}

function Screen({ children }: { children: ReactNode }) {
  return (
    <PhoneFrame accent={ACCENT}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: DESK }}>
        <StatusBar color={INK} />
        {children}
      </div>
    </PhoneFrame>
  );
}

function Heading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mt-3">
      <p className={`${MONO} text-[5.5px] uppercase tracking-[0.12em]`} style={{ color: MUTED }}>
        {kicker}
      </p>
      <h3 className="mt-0.5 text-[16px] font-bold leading-none tracking-[-0.02em]" style={{ color: INK }}>
        {title}
      </h3>
    </div>
  );
}

function Group({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[3px] border" style={{ borderColor: STRONG_RULE, backgroundColor: SURFACE }}>
      {children}
    </div>
  );
}

/** Rows divided by a dashed rule, like a service sheet. */
const rule = (index: number) => (index ? { borderTop: `1px dashed ${STRONG_RULE}` } : undefined);

function SectionTitle({ children, meta }: { children: string; meta?: string }) {
  return (
    <div className="mb-1 mt-3 flex items-center justify-between">
      <p className={`${MONO} flex items-center gap-1 text-[5.5px] font-bold uppercase tracking-[0.14em]`} style={{ color: MUTED }}>
        <span className="h-[1px] w-[6px]" style={{ backgroundColor: ACCENT }} />
        {children}
      </p>
      {meta && (
        <p className={`${MONO} text-[5px]`} style={{ color: MUTED }}>
          {meta}
        </p>
      )}
    </div>
  );
}

function Lamp({ state }: { state: "due" | "soon" | "clear" }) {
  return (
    <span
      className="h-[5px] w-[5px] shrink-0 rounded-full"
      style={state === "due" ? { backgroundColor: ACCENT } : state === "soon" ? { border: `1.5px solid ${ACCENT}` } : { border: `1px solid ${STRONG_RULE}` }}
    />
  );
}

function Plate({ children, hero = false }: { children: string; hero?: boolean }) {
  return (
    <span
      className={`${MONO} rounded-[1.5px] border px-1 py-[1px] text-[6px] font-bold tracking-[0.1em]`}
      style={hero ? { borderColor: "rgba(255,255,255,0.3)", backgroundColor: "rgba(255,255,255,0.1)" } : { borderColor: STRONG_RULE, backgroundColor: DESK, color: INK }}
    >
      {children}
    </span>
  );
}

/**
 * Screen 1: Due. Two vehicles, each with its lamp, and the cluster for the
 * one whose job the engine ranks first: only that job's figures, and no
 * percentage or score, because the product shows neither.
 */
export function OverviewScreenMockup() {
  const view = deriveDueView(SAMPLE.vehicles, ITEMS, NOW);
  const top = view.due[0];
  if (!top) throw new Error("The sample must have a job that is due.");
  const rest = [...view.due.slice(1), ...view.dueSoon];
  const renewals = deriveRenewalsView(SAMPLE.vehicles, RENEWALS, TODAY);
  const lamps = vehicleLamps(SAMPLE.vehicles, view, [...renewals.pastDate, ...renewals.soon]);
  const { digits, lead } = odometerDigits(CIVIC.currentMileage ?? 0);
  return (
    <Screen>
      <Heading kicker="Across everything you own" title="Due" />
      <div className="mt-2 flex flex-wrap gap-1">
        <span className={`${MONO} rounded-[1.5px] border px-1.5 py-[2px] text-[5.5px] font-bold`} style={{ borderColor: INK, backgroundColor: INK, color: SURFACE }}>
          ALL
        </span>
        {lamps.map(({ vehicle, state }) => (
          <span key={vehicle.id} className={`${MONO} flex items-center gap-1 rounded-[1.5px] border px-1.5 py-[2px] text-[5.5px] font-bold`} style={{ borderColor: STRONG_RULE, backgroundColor: SURFACE, color: INK }}>
            <Lamp state={state} />
            {vehicle.plate}
          </span>
        ))}
      </div>
      <div className="mt-2 overflow-hidden rounded-[5px] p-3" style={{ background: HERO_BACKGROUND, color: HERO_INK, boxShadow: `0 0 0 1px ${HERO_TO}` }}>
        <div className="flex items-center justify-between">
          <Plate hero>{CIVIC.plate ?? CIVIC.label}</Plate>
          <span className="text-[6px] opacity-70">{describeVehicle(CIVIC)}</span>
        </div>
        <div className="mt-2.5 flex items-end gap-[1.5px]">
          {digits.map((digit, i) => (
            <span key={i} className={`${MONO} flex h-[17px] w-[12px] items-center justify-center rounded-[1.5px] border text-[10px] font-bold`} style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(0,0,0,0.5)", opacity: i < lead ? 0.25 : 1 }}>
              {digit}
            </span>
          ))}
          <span className={`${MONO} ml-1 pb-[1px] text-[5px] uppercase opacity-60`}>miles</span>
        </div>
        <p className={`${MONO} mt-1 text-[4.5px] uppercase opacity-55`}>as of {shortDay(CIVIC.mileageUpdatedAt ?? TODAY, TODAY)}</p>
        <div className="mt-2 flex h-[4px] items-end gap-[2.6px] opacity-30">
          {Array.from({ length: 31 }, (_, i) => (
            <span key={i} className="w-[0.5px] bg-current" style={{ height: i % 5 === 0 ? 4 : 2 }} />
          ))}
        </div>
        <div className={`${MONO} mt-2.5 flex items-center gap-1 text-[5.5px] font-bold uppercase tracking-[0.14em]`}>
          <span className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: ACCENT, boxShadow: `0 0 0 2px ${ACCENT}55` }} />
          Due
        </div>
        <p className="mt-1 text-[13px] font-bold leading-[1.1] tracking-[-0.02em]">{top.item.taskName}</p>
        <p className={`${MONO} mt-1 text-[5.5px] leading-snug opacity-80`}>
          {describeRemaining(top)} ({describeInterval(top.item)})
        </p>
        <span className="mt-2 inline-block rounded-[2px] px-2 py-[4px] text-[6.5px] font-semibold" style={{ backgroundColor: ACCENT, color: ACCENT_LABEL }}>
          I had this done
        </span>
      </div>

      <SectionTitle>Also due</SectionTitle>
      <Group>
        {rest.map((entry, index) => (
          <div key={entry.item.id} className="flex items-start gap-1.5 px-2 py-1.5" style={rule(index)}>
            <span className="mt-[2px]">
              <Lamp state={entry.urgency >= 1 ? "due" : "soon"} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[7px] font-semibold leading-tight" style={{ color: INK }}>
                {entry.item.taskName}
              </p>
              <p className={`${MONO} mt-0.5 text-[5px]`} style={{ color: MUTED }}>
                {describeRemaining(entry)}
              </p>
            </div>
            <Plate>{entry.vehicle.plate ?? entry.vehicle.label}</Plate>
          </div>
        ))}
      </Group>

      <SectionTitle>Paperwork</SectionTitle>
      <Group>
        {[...renewals.pastDate, ...renewals.soon].map((entry, index) => (
          <div key={entry.renewal.id} className="flex items-baseline justify-between px-2 py-1.5" style={rule(index)}>
            <span className="text-[7px] font-semibold" style={{ color: INK }}>
              {renewalTitle(entry.renewal)}
            </span>
            <span className={`${MONO} text-[5px]`} style={{ color: MUTED }}>
              {describeRenewalTiming(entry.days)}, {entry.renewal.dueOn}
            </span>
          </div>
        ))}
      </Group>
      <TabBar current="Due" />
    </Screen>
  );
}

/**
 * Screen 2: the Service Boundary, on the Print screen. What is requested
 * today is chosen from the jobs that are tracked, anything else is written
 * in, and the most the person will agree to without a call is typed as they
 * want it printed. Nothing is stored and nothing is checked.
 */
export function ServiceBoundaryScreenMockup() {
  const requested = new Set(["i1"]);
  return (
    <Screen>
      <Heading kicker="One for the shop, one for a buyer, one for the glove box" title="Print" />
      <div className="mt-2.5 rounded-[3px] border p-2.5" style={{ borderColor: STRONG_RULE, backgroundColor: SURFACE }}>
        <p className="text-[8px] font-bold tracking-[-0.01em]" style={{ color: INK }}>
          Service Boundary
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {[
            { label: "Shop (optional)", value: "Main Street Garage" },
            { label: "Number to call you on (optional)", value: "" },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-[5px] font-semibold" style={{ color: INK }}>
                {field.label}
              </p>
              <div className="mt-0.5 rounded-[2px] border px-1 py-[3px] text-[6px]" style={{ borderColor: STRONG_RULE, color: INK, minHeight: 12 }}>
                {field.value}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[6px] font-semibold" style={{ color: INK }}>
          What are you requesting today?
        </p>
        <div className="mt-1 flex flex-col gap-1">
          {ITEMS.map((item) => (
            <div key={item.id} className="flex items-center gap-1.5">
              <span className="flex h-[7px] w-[7px] items-center justify-center rounded-[1px] text-[5px]" style={requested.has(item.id) ? { backgroundColor: ACCENT, color: ACCENT_LABEL } : { border: `1px solid ${STRONG_RULE}` }}>
                {requested.has(item.id) ? "\u2713" : ""}
              </span>
              <span className="text-[6.5px]" style={{ color: INK }}>
                {item.taskName}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[5px] font-semibold" style={{ color: INK }}>
          Do not go over this without calling (optional)
        </p>
        <div className={`${MONO} mt-0.5 rounded-[2px] border px-1 py-[3px] text-[6px]`} style={{ borderColor: STRONG_RULE, color: INK }}>
          $200
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="flex h-[7px] w-[7px] items-center justify-center rounded-[1px] text-[5px]" style={{ backgroundColor: ACCENT, color: ACCENT_LABEL }}>
            {"\u2713"}
          </span>
          <span className="text-[6px]" style={{ color: INK }}>
            Ask them to keep any parts they replace, so I can see them
          </span>
        </div>
        <span className="mt-2.5 inline-block rounded-[2px] px-2 py-[4px] text-[6.5px] font-semibold" style={{ backgroundColor: ACCENT, color: ACCENT_LABEL }}>
          Make the Service Boundary
        </span>
      </div>
      <TabBar current={null} />
    </Screen>
  );
}

/**
 * Screen 3: History. Every service, newest first, by year. The only sum is
 * the cost somebody chose to enter, and the line says how many entries it
 * covers, so a total never reads as the whole story.
 */
export function HistoryScreenMockup() {
  const groups = historyByYear(EVENTS, "v1");
  return (
    <Screen>
      <Heading kicker="What has been done, and when" title="History" />
      <div className="mt-1 flex flex-col">
        {groups.map((group) => (
          <div key={group.year}>
            <SectionTitle
              meta={group.costedCount > 0 ? `${formatCost(group.costMinorUnits)} entered, on ${group.costedCount} of ${group.events.length} ${group.events.length === 1 ? "entry" : "entries"}` : undefined}
            >
              {group.year}
            </SectionTitle>
            <Group>
              {group.events.map((event, index) => (
                <div key={event.id} className="grid grid-cols-[38px_1fr] gap-2 px-2 py-1.5" style={rule(index)}>
                  <div className={`${MONO} text-[4.5px] leading-[1.5]`} style={{ color: MUTED }}>
                    <p className="font-bold" style={{ color: INK }}>
                      {event.doneOn}
                    </p>
                    {event.mileage !== null && <p>{event.mileage.toLocaleString()} mi</p>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[7px] font-semibold leading-tight" style={{ color: INK }}>
                      {event.taskName}
                    </p>
                    <p className={`${MONO} mt-0.5 text-[4.5px]`} style={{ color: MUTED }}>
                      {[event.shop, event.costMinorUnits !== null ? formatCost(event.costMinorUnits) : null].filter(Boolean).join(" \u00b7 ")}
                    </p>
                    <p className="mt-0.5 text-[5px] font-semibold" style={{ color: MUTED }}>
                      Change
                    </p>
                  </div>
                </div>
              ))}
            </Group>
          </div>
        ))}
        <span className="mt-3 inline-block self-start rounded-[2px] border px-2 py-[4px] text-[6.5px] font-semibold" style={{ borderColor: STRONG_RULE, color: INK, backgroundColor: SUNKEN }}>
          Print the service record
        </span>
      </div>
      <TabBar current="History" />
    </Screen>
  );
}
