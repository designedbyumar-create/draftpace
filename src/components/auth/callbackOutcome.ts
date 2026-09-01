/**
 * The auth callback's single decision, extracted so the invariant is explicit
 * and unit-testable: the real session is the source of truth. If a valid
 * session exists the user is signed in and must be sent on, even if the code
 * exchange returned an error or the provider passed a stale error param. A
 * failure is shown only when no session could be established. This is what
 * prevents a successful sign-in from ever rendering as "Sign-in didn't
 * complete". See src/app/auth/callback/page.tsx.
 */
export function resolveCallbackOutcome(sessionExists: boolean): "redirect" | "fail" {
  return sessionExists ? "redirect" : "fail";
}
