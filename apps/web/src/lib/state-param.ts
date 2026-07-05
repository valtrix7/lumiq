/**
 * Server-safe variant resolution for seeded UI states.
 *
 * Lives outside `state-switcher.tsx` (a `"use client"` module) so that server
 * components can read the active variant from `searchParams` without crossing
 * the client boundary. No hooks, no browser APIs — pure object read.
 */

/**
 * Read the active variant for a param from a server component's `searchParams`.
 * Falls back to the provided default when the param is absent.
 */
export function resolveStateParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  param: string,
  fallback: string,
): string {
  const raw = searchParams?.[param];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value ?? fallback;
}
