import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type AppRole = "student" | "teacher" | "admin";

/** Signed-in user's profile (cached per request). */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();
  return data;
});

export function homeFor(role: string) {
  return role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student";
}

/** Server-side guard: redirects if not signed in or not one of the allowed roles. */
export async function requireRole(roles: AppRole[]): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!roles.includes(profile.role as AppRole)) redirect(homeFor(profile.role));
  return profile;
}
