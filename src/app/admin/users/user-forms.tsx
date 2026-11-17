"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { createClass, setUserRole } from "../actions";

export function RoleSelect({ userId, role, disabled }: { userId: string; role: string; disabled?: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Select
      aria-label="Role"
      defaultValue={role}
      disabled={disabled || pending}
      className="h-9"
      onChange={(e) => {
        const next = e.target.value as "student" | "teacher" | "admin";
        start(async () => {
          const res = await setUserRole(userId, next);
          if (res.error) { toast(res.error, "error"); e.target.value = role; }
          else { toast("Role updated."); router.refresh(); }
        });
      }}
    >
      <option value="student">Student</option>
      <option value="teacher">Teacher</option>
      <option value="admin">Super Admin</option>
    </Select>
  );
}

export function CreateClassForm({ teachers }: { teachers: { id: string; full_name: string }[] }) {
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [level, setLevel] = useState("SMP");
  const [teacher, setTeacher] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-2 sm:grid-cols-[1.4fr_0.6fr_1fr_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await createClass({ name, school_level: level, teacher_id: teacher });
          if (res.error) toast(res.error, "error");
          else { toast(`Class "${name}" created.`); setName(""); router.refresh(); }
        });
      }}
    >
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Class name, e.g. VIII-A Olympiad Team" aria-label="Class name" />
      <Select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="School level"><option>SMP</option><option>SMA</option></Select>
      <Select value={teacher} onChange={(e) => setTeacher(e.target.value)} aria-label="Teacher">
        <option value="">{teachers.length ? "Assign teacher…" : "No teachers yet"}</option>
        {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
      </Select>
      <Button type="submit" loading={pending} disabled={name.trim().length < 2}>Create class</Button>
    </form>
  );
}
