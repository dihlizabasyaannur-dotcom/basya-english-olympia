"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileInput } from "@/lib/validation";
import { friendlyError } from "@/lib/utils";

export async function updateProfile(input: ProfileInput): Promise<{ error?: string }> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Please sign in again." };
  const v = parsed.data;
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: v.full_name, school_level: v.school_level, grade: Number(v.grade), school_name: v.school_name || null, bio: v.bio || null })
    .eq("id", auth.user.id);
  if (error) return { error: friendlyError(error.message) };
  revalidatePath("/student", "layout");
  return {};
}

export async function joinClass(code: string): Promise<{ error?: string; name?: string }> {
  if (!/^[A-Za-z0-9]{6}$/.test(code.trim())) return { error: "Class codes have 6 letters or numbers." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_class", { p_code: code });
  if (error) return { error: friendlyError(error.message) };
  revalidatePath("/student/profile");
  return { name: (data as { name: string }).name };
}
