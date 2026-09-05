/** "3 hours ago", "in 2 days", etc. — shared by any surface showing a timestamped feed (Updates page, Home's cross-product section). */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];
  for (const [unit, unitSeconds] of divisions) {
    if (Math.abs(seconds) >= unitSeconds) {
      return new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }).format(Math.round(seconds / unitSeconds), unit);
    }
  }
  return "just now";
}
