import { Check, X } from "@/design-system/Icon";

/**
 * "Why not just use a spreadsheet." The homepage's second section, and
 * the one angle genuinely missing from the page before this: everything
 * else here explains what a Companion does, nothing named what it was
 * actually replacing. Direct comparison is the section that does.
 *
 * Replaces ChangeImpactDemo (the flight-delay interactive proof, now
 * deleted): a real, working demo of one feature, but it argued from a
 * single scenario rather than naming the alternative a buyer is
 * actually weighing this against right now. This is a founder-directed
 * replacement, not a quality judgment on what it replaced.
 *
 * Every row is a claim already made and proven elsewhere on this site,
 * never a new one invented for this table: "remembers what depends on
 * what" is the ChangeImpactDemo/ "Holds the connections" claim, "one
 * next thing" is the dominant-action pattern every product's Now/
 * Attention/Next screen uses, "flags what's missing" is the Attention
 * inbox pattern (a bill with no due date, a stale balance), "one
 * payment" is the real, schema-enforced pricing model. A note app and a
 * spreadsheet get an honest "-" rather than a false ✕ on the payment
 * row, since neither is really a subscription competitor; the row is
 * there because "no subscription" is still true of Draftpace and worth
 * stating once, not because either alternative fails it.
 */

type Answer = "yes" | "no" | "na";

const ROWS: { claim: string; noteApp: Answer; spreadsheet: Answer }[] = [
  { claim: "Remembers what depends on what", noteApp: "no", spreadsheet: "no" },
  { claim: "Tells you the one next thing to do", noteApp: "no", spreadsheet: "no" },
  { claim: "Flags what's missing, not just a blank cell", noteApp: "no", spreadsheet: "no" },
  { claim: "One payment, not a subscription", noteApp: "na", spreadsheet: "na" },
];

const COLUMNS = ["A note app", "A spreadsheet", "Draftpace"] as const;

function Cell({ answer }: { answer: Answer }) {
  if (answer === "yes") {
    return (
      <span className="inline-flex items-center justify-center" aria-label="Yes">
        <Check size={17} className="text-[var(--success)]" aria-hidden />
      </span>
    );
  }
  if (answer === "na") {
    // A plain hyphen, not an em dash: this file lives under
    // src/components/public, which the em-dash regression sweep in
    // public-copy.test.ts scans literally, and the character would fail
    // it regardless of use as prose punctuation versus a table glyph.
    return (
      <span className="text-[13px] text-[var(--faint)]" aria-label="Not really a comparison here">
        -
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center" aria-label="No">
      <X size={15} className="text-[var(--faint)]" aria-hidden />
    </span>
  );
}

export default function WhyNotSpreadsheet() {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">
        Why not just use a spreadsheet
      </p>
      <h2 className="mt-3 max-w-2xl font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
        The thing you're already doing, and where it actually breaks.
      </h2>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
        A note app and a spreadsheet are not bad tools. They just don't do the two things that actually matter once
        the pieces of a situation start depending on each other.
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <th scope="col" className="pb-3 pr-4 text-[12px] font-semibold text-[var(--faint)]">
                <span className="sr-only">Capability</span>
              </th>
              {COLUMNS.map((col, i) => {
                const isDraftpace = i === COLUMNS.length - 1;
                return (
                  <th
                    key={col}
                    scope="col"
                    className={`pb-3 px-4 text-center text-[12px] font-bold uppercase tracking-[0.08em] ${
                      isDraftpace ? "text-[var(--primary)]" : "text-[var(--faint)]"
                    }`}
                  >
                    {col}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, rowIndex) => {
              const isLast = rowIndex === ROWS.length - 1;
              const borderClass = isLast ? "" : "border-b border-[var(--border)]";
              return (
                <tr key={row.claim}>
                  <th
                    scope="row"
                    className={`py-3.5 pr-4 text-[13.5px] font-medium leading-snug text-[var(--text)] ${borderClass}`}
                  >
                    {row.claim}
                  </th>
                  <td className={`py-3.5 px-4 text-center ${borderClass}`}>
                    <Cell answer={row.noteApp} />
                  </td>
                  <td className={`py-3.5 px-4 text-center ${borderClass}`}>
                    <Cell answer={row.spreadsheet} />
                  </td>
                  <td className={`bg-[var(--primary-soft)] py-3.5 px-4 text-center ${borderClass}`}>
                    <Cell answer="yes" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-5 max-w-xl text-[13px] leading-relaxed text-[var(--faint)]">
        Not a claim about note apps or spreadsheets being bad software. They just don't know what you built on top of
        what, and nothing tells you when a record has gone quiet.
      </p>
    </div>
  );
}
