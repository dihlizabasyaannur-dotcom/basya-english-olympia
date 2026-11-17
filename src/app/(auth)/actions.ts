"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/validation";
import { friendlyError } from "@/lib/utils";

export type ActionResult = { error?: string; message?: string };

function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function signIn(input: LoginInput, next?: string): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: friendlyError(error.message) };
  redirect(safeNext(next));
}

export async function signUp(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, password, full_name, school_level, grade, school_name } = parsed.data;
  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  // Note: role is never sent — every new account is a student. Only the admin can change roles.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { full_name, school_level, grade, school_name: school_name ?? "" },
    },
  });
  if (error) return { error: friendlyError(error.message) };
  if (!data.session) {
    return { message: "Account created! Check your email and click the confirmation link, then sign in." };
  }
  redirect("/student?welcome=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
