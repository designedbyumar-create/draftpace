const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "Monday 21 September", from the device's own calendar day. Spelled out here so it reads the same in every browser and in tests. */
export function formatTodayLabel(now: Date): string {
  return `${WEEKDAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`;
}

/** "SEP" for a "YYYY-MM-DD" date, for the small calendar badge. */
export function badgeMonth(isoDate: string): string {
  const month = Number(isoDate.slice(5, 7));
  return MONTHS[month - 1].slice(0, 3).toUpperCase();
}

/** "24" for a "YYYY-MM-DD" date. */
export function badgeDay(isoDate: string): string {
  return String(Number(isoDate.slice(8, 10)));
}
