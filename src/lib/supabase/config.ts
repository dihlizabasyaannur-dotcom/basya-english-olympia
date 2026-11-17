// Only PUBLIC values live here. The anon/publishable key is designed to be public;
// all protection comes from Row Level Security in the database.
// NEVER put the service-role/secret key in a NEXT_PUBLIC_ variable.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Same cookie name on server and browser, whichever URL each side uses. */
export const AUTH_COOKIE_NAME = "sb-beo-auth-token";

/** Path on this website that forwards to Supabase (only used when the proxy is switched on). */
export const PROXY_PATH = "/supabase-proxy";

/**
 * URL the BROWSER uses to reach Supabase. Normally the real Supabase URL.
 * With NEXT_PUBLIC_SUPABASE_PROXY=1 (previews where the database isn't reachable from the
 * visitor's device, e.g. a local Supabase), the browser goes through this website instead.
 */
export function browserSupabaseUrl() {
  if (process.env.NEXT_PUBLIC_SUPABASE_PROXY === "1" && typeof window !== "undefined") {
    return window.location.origin + PROXY_PATH;
  }
  return SUPABASE_URL;
}

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
