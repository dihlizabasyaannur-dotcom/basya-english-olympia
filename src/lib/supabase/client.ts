"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { AUTH_COOKIE_NAME, SUPABASE_ANON_KEY, browserSupabaseUrl } from "./config";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (!client) {
    client = createBrowserClient<Database>(browserSupabaseUrl(), SUPABASE_ANON_KEY, {
      cookieOptions: { name: AUTH_COOKIE_NAME },
    });
  }
  return client;
}
