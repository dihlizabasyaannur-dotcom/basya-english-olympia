"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { questionSchema, type QuestionInput } from "@/lib/validation";
import { friendlyError } from "@/lib/utils";
import type { Json } from "@/lib/supabase/database.types";

// Every action re-checks the role here AND the database re-checks is_admin() — defence in depth.

export async function saveQuestion(input: QuestionInput): Promise<{ error?: string; id?: string }> {
  await requireRole(["admin"]);
  const parsed = questionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_save_question", { p: parsed.data as unknown as Json });
  if (error) return { error: friendlyError(error.message) };
  revalidatePath("/admin/questions");
  return { id: data };
}

export async function deleteQuestion(id: string): Promise<{ error?: string }> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) return { error: friendlyError(error.message) };
  revalidatePath("/admin/questions");
  return {};
}

export async function setQuestionStatus(id: string, status: "draft" | "published"): Promise<{ error?: string }> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("questions").update({ status }).eq("id", id);
  if (error) return { error: friendlyError(error.message) };
  revalidatePath("/admin/questions");
  return {};
}

export async function importQuestions(rows: QuestionInput[]): Promise<{ error?: string; created?: number; updated?: number }> {
  await requireRole(["admin"]);
  if (rows.length === 0) return { error: "There are no valid rows to import." };
  if (rows.length > 2000) return { error: "Import at most 2,000 questions per file." };
  for (const r of rows) {
    const p = questionSchema.safeParse(r);
    if (!p.success) return { error: `Invalid row: ${p.error.issues[0].message}` };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_import_questions", { p_rows: rows as unknown as Json });
  if (error) return { error: friendlyError(error.message) };
  revalidatePath("/admin", "layout");
  return data as { created: number; updated: number };
}

export async function setUserRole(userId: string, role: "student" | "teacher" | "admin"): Promise<{ error?: string }> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_user_role", { p_user_id: userId, p_role: role });
  if (error) return { error: error.message.includes("CANNOT_DEMOTE_SELF") ? "You can't remove your own admin role." : friendlyError(error.message) };
  revalidatePath("/admin/users");
  return {};
}

export async function createClass(input: { name: string; school_level: string; teacher_id: string }): Promise<{ error?: string }> {
  const admin = await requireRole(["admin"]);
  const name = input.name.trim();
  if (name.length < 2) return { error: "Enter a class name." };
  const supabase = await createClient();
  const { error } = await supabase.from("classes").insert({
    name,
    school_level: input.school_level === "SMA" ? "SMA" : input.school_level === "SMP" ? "SMP" : null,
    teacher_id: input.teacher_id || null,
    created_by: admin.id,
  });
  if (error) return { error: friendlyError(error.message) };
  revalidatePath("/admin/users");
  return {};
}
