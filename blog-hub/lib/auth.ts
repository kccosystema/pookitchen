import { cookies } from "next/headers";

export const SESSION_COOKIE = "hub_session";

/**
 * Minimal single-admin gate: on login we set a cookie whose value equals the
 * secret ADMIN_SESSION_TOKEN. A request is authenticated if the cookie matches.
 *
 * This is intentionally simple for an internal tool. To support multiple
 * editors, per-user attribution, or SSO, swap this for Supabase Auth
 * (supabase.auth) and gate on the authenticated user instead.
 */
export function expectedToken(): string {
  const token = process.env.ADMIN_SESSION_TOKEN;
  if (!token) throw new Error("ADMIN_SESSION_TOKEN is not set.");
  return token;
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === expectedToken();
}
