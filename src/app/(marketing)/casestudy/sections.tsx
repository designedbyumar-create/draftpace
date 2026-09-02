import { Check, ArrowRight } from "@/design-system/Icon";

/**
 * The case study's own layout vocabulary.
 *
 * Each block here exists because a different kind of content needed a
 * different shape. A decision is not a paragraph, a comparison is not a
 * list, and a thesis is not a heading. Putting them all through one prose
 * column is what makes a case study read like a document rather than a
 * designed thing, so they each get their own form.
 *
 * Everything is built from the existing token set. No new colours, no new
 * spacing values, nothing that would drift from the rest of the site.
 */

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--brand-ink)]">{children}</p>
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-4 max-w-2xl font-serif text-[30px] font-semibold leading-[1.12] tracking-tight sm:text-[38px]">
      {children}
    </h2>
  );
}

export function Prose({ children }: { children: string }) {
  return <p className="mt-5 max-w-[62ch] text-[16.5px] leading-[1.72] text-[var(--muted)]">{children}</p>;
}

/**
 * The two moments the page is allowed to raise its voice: the thesis and
 * the closing. Same treatment both times, so the end visibly answers the
 * middle.
 */
export function BigStatement({
  quote,
  support,
  lines,
}: {
  quote: string;
  support?: string;
  lines?: string[];
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="font-serif text-[32px] font-semibold leading-[1.14] tracking-tight text-[var(--text)] sm:text-[46px] lg:text-[54px]">
        {quote}
      </p>
      {support && (
        <p className="mx-auto mt-7 max-w-xl text-[16px] leading-relaxed text-[var(--muted)]">{support}</p>
      )}
      {lines && (
        <div className="mt-10 space-y-2">
          {lines.map((line) => (
            <p key={line} className="font-serif text-[20px] font-semibold tracking-tight text-[var(--text)] sm:text-[24px]">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The fragmented-tools figure. Deliberately a drawing rather than a
 * screenshot: it is describing the situation a person is already in
 * before Draftpace exists, so there is nothing real to photograph.
 */
export function ScatterFigure({ labels }: { labels: string[] }) {
  const offsets = ["mt-0", "mt-8", "mt-3", "mt-10", "mt-1", "mt-7", "mt-4", "mt-9", "mt-2"];
  return (
    <figure className="mt-10">
      <div className="flex flex-wrap items-start justify-center gap-x-3 gap-y-2 rounded-[var(--radius-xl)] border border-dashed border-[var(--border-strong)] px-6 py-10">
        {labels.map((label, i) => (
          <span
            key={label}
            className={`${offsets[i % offsets.length]} rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[12.5px] text-[var(--muted)]`}
          >
            {label}
          </span>
        ))}
      </div>
      <figcaption className="mt-3 text-center text-[12px] text-[var(--faint)]">
        The system a person ends up maintaining themselves.
      </figcaption>
    </figure>
  );
}

/** The four-way evidence key, so a reader can weigh each claim. */
export function EvidenceLedger({ rows }: { rows: { kind: string; text: string }[] }) {
  return (
    <dl className="mt-9 grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.kind} className="border-t border-[var(--border)] pt-4">
          <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">{row.kind}</dt>
          <dd className="mt-1.5 text-[14px] leading-relaxed text-[var(--muted)]">{row.text}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Caveat({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-8 max-w-[62ch] border-l-2 border-[var(--border-strong)] pl-4 text-[13.5px] leading-relaxed text-[var(--faint)]">
      {children}
    </p>
  );
}

/** A decision, in the shape a decision actually has. */
export function DecisionCard({
  index,
  title,
  rows,
}: {
  index: number;
  title: string;
  rows: { label: string; text: string }[];
}) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">
        Decision {String(index).padStart(2, "0")}
      </p>
      <h3 className="mt-2.5 font-serif text-[20px] font-semibold leading-snug tracking-tight text-[var(--text)]">
        {title}
      </h3>
      <dl className="mt-5 space-y-3.5">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1 sm:grid-cols-[88px_1fr] sm:gap-4">
            <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)] sm:pt-[3px]">
              {row.label}
            </dt>
            <dd className="text-[14px] leading-[1.65] text-[var(--muted)]">{row.text}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

/**
 * The repositioning, shown as the running order of the page rather than
 * described in a paragraph. Where the products sat is the whole argument,
 * so the figure counts the positions instead of asserting them.
 */
export function RunningOrder({
  side,
}: {
  side: {
    label: string;
    provenance: string;
    eyebrow: string;
    headline: string;
    sections: string[];
    productsAt: number;
  };
}) {
  return (
    <div className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">{side.label}</p>
        <p className="text-[11px] text-[var(--faint)]">{side.provenance}</p>
      </div>

      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">{side.eyebrow}</p>
      <p className="mt-1.5 font-serif text-[21px] font-semibold leading-tight tracking-tight text-[var(--text)]">
        {side.headline}
      </p>

      <ol className="mt-6 space-y-1.5 border-t border-[var(--border)] pt-5">
        {side.sections.map((label, i) => {
          const isProducts = i + 1 === side.productsAt;
          return (
            <li
              key={label}
              className={[
                "flex gap-3 rounded-md px-2 py-1.5 text-[13.5px]",
                isProducts
                  ? "bg-[var(--primary-soft)] font-semibold text-[var(--text)]"
                  : "text-[var(--muted)]",
              ].join(" ")}
            >
              <span className="tabular-nums opacity-55">{i + 1}</span>
              <span>{label}</span>
            </li>
          );
        })}
      </ol>

      <p className="mt-5 text-[12.5px] leading-relaxed text-[var(--faint)]">
        The products were the{" "}
        <span className="font-semibold text-[var(--text)]">
          {side.productsAt === 1 ? "first" : `${side.productsAt}th`}
        </span>{" "}
        thing a visitor met.
      </p>
    </div>
  );
}

/** The loop the work actually ran in. */
export function ProcessLoop({ steps }: { steps: { name: string; text: string }[] }) {
  return (
    <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="list">
      {steps.map((step, i) => (
        <li
          key={step.name}
          className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-ink)] text-[10px] font-bold tabular-nums text-[var(--brand-ink-contrast)]">
              {i + 1}
            </span>
            <p className="text-[13.5px] font-semibold text-[var(--text)]">{step.name}</p>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** How one problem becomes many products and still holds together. */
export function SystemFlow({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-10 space-y-2" role="list">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center gap-3">
          <span className="w-6 shrink-0 text-[11px] tabular-nums text-[var(--faint)]">{i + 1}</span>
          <div
            className={[
              "flex-1 rounded-[var(--radius)] border px-4 py-3 text-[14px]",
              i === steps.length - 1
                ? "border-[var(--primary)] bg-[var(--primary-soft)] font-semibold text-[var(--text)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
            ].join(" ")}
          >
            {step}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ComparisonTable({ rows }: { rows: { approach: string; startsWith: string }[] }) {
  return (
    <div className="mt-10 overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--border-strong)]">
            <th className="pb-3 pr-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">
              Approach
            </th>
            <th className="pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">
              Starts with
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isUs = row.approach === "Draftpace";
            return (
              <tr key={row.approach} className="border-b border-[var(--border)]">
                <td
                  className={[
                    "py-4 pr-6 text-[14.5px]",
                    isUs ? "font-semibold text-[var(--text)]" : "text-[var(--muted)]",
                  ].join(" ")}
                >
                  {row.approach}
                </td>
                <td
                  className={[
                    "py-4 text-[14.5px]",
                    isUs ? "font-semibold text-[var(--primary)]" : "text-[var(--muted)]",
                  ].join(" ")}
                >
                  {row.startsWith}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The two assessments, side by side on purpose. What held up and what is
 * still a guess are the same size on the page, because they are the same
 * size in reality.
 */
export function AssessmentList({
  items,
  tone,
}: {
  items: { head: string; text: string }[];
  tone: "held" | "unproven";
}) {
  return (
    <ul className="mt-8 space-y-6" role="list">
      {items.map((item) => (
        <li key={item.head} className="flex gap-3.5">
          {tone === "held" ? (
            <Check size={15} className="mt-1 shrink-0 text-[var(--success)]" aria-hidden />
          ) : (
            <span
              aria-hidden
              className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--faint)]"
            />
          )}
          <div>
            <p className="text-[15px] font-semibold leading-snug text-[var(--text)]">{item.head}</p>
            <p className="mt-1.5 text-[14.5px] leading-[1.68] text-[var(--muted)]">{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function StatGrid({ items }: { items: { value: string; label: string }[] }) {
  return (
    <dl className="mt-10 grid gap-x-6 gap-y-9 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="sr-only">{item.label}</dt>
          <dd>
            <p className="font-serif text-[40px] font-semibold leading-none tracking-tight text-[var(--text)] sm:text-[46px]">
              {item.value}
            </p>
            <p className="mt-2.5 max-w-[24ch] text-[13.5px] leading-relaxed text-[var(--muted)]">{item.label}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function DeepDiveRows({
  rows,
}: {
  rows: { label: string; text: string }[];
}) {
  return (
    <dl className="mt-7 space-y-5">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">{row.label}</dt>
          <dd className="mt-1.5 text-[14.5px] leading-[1.68] text-[var(--muted)]">{row.text}</dd>
        </div>
      ))}
    </dl>
  );
}

export { ArrowRight };
