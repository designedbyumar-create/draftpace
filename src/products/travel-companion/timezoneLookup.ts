/**
 * A small, static, offline city/airport to timezone table.
 *
 * WHY THIS EXISTS, AND WHY IT REPLACES A MANUAL UTC OFFSET
 *
 * The founder's original idea was a manual offset picker: "this place is
 * UTC+9." That is wrong the moment a trip touches anywhere that observes
 * daylight saving, because the same place is a different offset in
 * summer and winter, and a person setting it once at the start of a trip
 * has no reason to remember to change it. An IANA zone name
 * ("Asia/Tokyo") carries that rule with it; a raw offset cannot.
 *
 * This table exists only to guess a reasonable IANA name from what
 * somebody typed as a destination, so most people never have to think
 * about timezones at all. It is deliberately small (a few dozen major
 * cities and airports, not a gazetteer) and deliberately exact-match
 * only: no fuzzy matching, no partial matching, nothing that could guess
 * wrong and be silently confident about it. An unlisted place returns
 * null, every time, which the caller reads honestly as "not detected"
 * rather than falling back to a guess.
 *
 * A person can always search the same table directly to set a place's
 * timezone by hand (PlaceForm.tsx), which is the only override path.
 * There is no raw offset input anywhere in this product.
 */

export interface TimezonePlace {
  /** A city name or an airport/station code, matched case-insensitively and exactly. */
  name: string;
  iana: string;
}

export const TIMEZONE_PLACES: TimezonePlace[] = [
  // ------------------------------------------------------------- Europe
  { name: "London", iana: "Europe/London" },
  { name: "LHR", iana: "Europe/London" },
  { name: "Paris", iana: "Europe/Paris" },
  { name: "CDG", iana: "Europe/Paris" },
  { name: "Berlin", iana: "Europe/Berlin" },
  { name: "Amsterdam", iana: "Europe/Amsterdam" },
  { name: "Madrid", iana: "Europe/Madrid" },
  { name: "Barcelona", iana: "Europe/Madrid" },
  { name: "Rome", iana: "Europe/Rome" },
  { name: "Milan", iana: "Europe/Rome" },
  { name: "Zurich", iana: "Europe/Zurich" },
  { name: "Vienna", iana: "Europe/Vienna" },
  { name: "Athens", iana: "Europe/Athens" },
  { name: "Istanbul", iana: "Europe/Istanbul" },
  { name: "Lisbon", iana: "Europe/Lisbon" },
  { name: "Dublin", iana: "Europe/Dublin" },
  { name: "Copenhagen", iana: "Europe/Copenhagen" },
  { name: "Stockholm", iana: "Europe/Stockholm" },
  { name: "Oslo", iana: "Europe/Oslo" },
  { name: "Warsaw", iana: "Europe/Warsaw" },
  { name: "Prague", iana: "Europe/Prague" },
  { name: "Moscow", iana: "Europe/Moscow" },

  // ---------------------------------------------------------- Americas
  { name: "New York", iana: "America/New_York" },
  { name: "JFK", iana: "America/New_York" },
  { name: "Boston", iana: "America/New_York" },
  { name: "Miami", iana: "America/New_York" },
  { name: "Toronto", iana: "America/Toronto" },
  { name: "Chicago", iana: "America/Chicago" },
  { name: "Dallas", iana: "America/Chicago" },
  { name: "Mexico City", iana: "America/Mexico_City" },
  { name: "Denver", iana: "America/Denver" },
  { name: "Phoenix", iana: "America/Phoenix" },
  { name: "Los Angeles", iana: "America/Los_Angeles" },
  { name: "LAX", iana: "America/Los_Angeles" },
  { name: "San Francisco", iana: "America/Los_Angeles" },
  { name: "Seattle", iana: "America/Los_Angeles" },
  { name: "Vancouver", iana: "America/Vancouver" },
  { name: "Sao Paulo", iana: "America/Sao_Paulo" },
  { name: "Rio de Janeiro", iana: "America/Sao_Paulo" },
  { name: "Buenos Aires", iana: "America/Argentina/Buenos_Aires" },
  { name: "Lima", iana: "America/Lima" },
  { name: "Bogota", iana: "America/Bogota" },
  { name: "Honolulu", iana: "Pacific/Honolulu" },

  // ----------------------------------------------------- Asia Pacific
  { name: "Tokyo", iana: "Asia/Tokyo" },
  { name: "NRT", iana: "Asia/Tokyo" },
  { name: "Osaka", iana: "Asia/Tokyo" },
  { name: "Kyoto", iana: "Asia/Tokyo" },
  { name: "Seoul", iana: "Asia/Seoul" },
  { name: "Beijing", iana: "Asia/Shanghai" },
  { name: "Shanghai", iana: "Asia/Shanghai" },
  { name: "Hong Kong", iana: "Asia/Hong_Kong" },
  { name: "Taipei", iana: "Asia/Taipei" },
  { name: "Singapore", iana: "Asia/Singapore" },
  { name: "Bangkok", iana: "Asia/Bangkok" },
  { name: "Kuala Lumpur", iana: "Asia/Kuala_Lumpur" },
  { name: "Jakarta", iana: "Asia/Jakarta" },
  { name: "Manila", iana: "Asia/Manila" },
  { name: "Ho Chi Minh City", iana: "Asia/Ho_Chi_Minh" },
  { name: "Hanoi", iana: "Asia/Ho_Chi_Minh" },
  { name: "Delhi", iana: "Asia/Kolkata" },
  { name: "Mumbai", iana: "Asia/Kolkata" },
  { name: "Dubai", iana: "Asia/Dubai" },
  { name: "Doha", iana: "Asia/Qatar" },
  { name: "Sydney", iana: "Australia/Sydney" },
  { name: "Melbourne", iana: "Australia/Melbourne" },
  { name: "Auckland", iana: "Pacific/Auckland" },
  { name: "Perth", iana: "Australia/Perth" },

  // ---------------------------------------------------- Africa/Middle East
  { name: "Cairo", iana: "Africa/Cairo" },
  { name: "Cape Town", iana: "Africa/Johannesburg" },
  { name: "Johannesburg", iana: "Africa/Johannesburg" },
  { name: "Nairobi", iana: "Africa/Nairobi" },
  { name: "Tel Aviv", iana: "Asia/Jerusalem" },
];

/**
 * Exact, case-insensitive lookup only. Returns null for anything not in
 * the table, deliberately: a wrong guess dressed up as a real answer is
 * worse than an honest "not detected", since a place with the wrong
 * timezone quietly gets its bookings sorted into the wrong day.
 */
export function lookupTimezone(name: string): string | null {
  const needle = name.trim().toLowerCase();
  if (!needle) return null;
  const found = TIMEZONE_PLACES.find((entry) => entry.name.toLowerCase() === needle);
  return found ? found.iana : null;
}
