/**
 * Carrying UTM attribution across Draftpace's own internal redirects.
 *
 * WHY THIS EXISTS
 *
 * GA4 attributes a session's traffic source from whatever UTM parameters
 * are on the page's URL the first time gtag.js runs on it. If a
 * server-side redirect (the free product's own page, the signed-out
 * checkout bounce, the auth gate) drops the query string before the
 * browser ever renders that URL, gtag.js never sees the campaign at all
 * — not "attributed to direct", just gone, since no client-side code runs
 * on a hop that happens entirely inside a 307/308 response. This has to
 * be fixed at every redirect, not once, which is why it is a shared
 * function rather than six copies of the same string-concatenation.
 *
 * A NAMED ALLOWLIST, NOT "FORWARD EVERYTHING"
 *
 * Only the parameters a campaign link actually uses are carried forward.
 * A redirect is not the place to become a general-purpose query-string
 * proxy: forwarding an arbitrary incoming param (an OAuth code, an error
 * flag meant for the page it was on) into a different destination is
 * exactly the kind of accidental coupling that causes a hard-to-find bug
 * later. If a future campaign needs another parameter carried through,
 * add it here, once, rather than switching to a blanket passthrough.
 */
export const UTM_PARAM_NAMES = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_id", "utm_term"] as const;

export type UtmParamName = (typeof UTM_PARAM_NAMES)[number];

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function readParam(source: ParamSource, name: string): string | undefined {
  if (source instanceof URLSearchParams) return source.get(name) ?? undefined;
  const value = source[name];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * The recognized UTM parameters present in `source`, as a query string
 * with its leading "?" — or "" if none are present, never a bare "?".
 */
export function utmQueryString(source: ParamSource): string {
  const out = new URLSearchParams();
  for (const name of UTM_PARAM_NAMES) {
    const value = readParam(source, name);
    if (value) out.set(name, value);
  }
  const serialized = out.toString();
  return serialized ? `?${serialized}` : "";
}

/**
 * `path` with any recognized UTM parameters from `source` appended,
 * preserving whatever query `path` already has. Returns `path` unchanged
 * when `source` carries no UTM parameters, rather than adding a bare "?".
 */
export function withPreservedUtm(path: string, source: ParamSource): string {
  const utm = utmQueryString(source);
  if (!utm) return path;
  return path + (path.includes("?") ? "&" : "?") + utm.slice(1);
}
