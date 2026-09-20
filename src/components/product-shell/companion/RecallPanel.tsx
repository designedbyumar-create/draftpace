/**
 * The person's own earlier words, shown back while they are needed.
 *
 * Set in the product's narrative face and a step larger than the checklist
 * beneath it, because this is the part they wrote and the checklist is the
 * part somebody else wrote. Renders nothing when there is nothing to show.
 */
export default function RecallPanel({ entries }: { entries: { label: string; text: string }[] }) {
  if (entries.length === 0) return null;
  return (
    <dl aria-label="What you said" className="flex flex-col gap-3 rounded-xl bg-[var(--surface-muted)] px-4 py-3.5 ring-1 ring-inset ring-[var(--border)]">
      {entries.map((entry) => (
        <div key={entry.label}>
          <dt className="text-[12px] font-semibold text-[var(--muted)]">{entry.label}</dt>
          <dd
            className="mt-0.5 text-[17px] leading-snug text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            {entry.text}
          </dd>
        </div>
      ))}
    </dl>
  );
}
