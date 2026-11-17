"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { profileSchema, type ProfileInput } from "@/lib/validation";
import { joinClass, updateProfile } from "./actions";

export function ProfileForm({ defaults }: { defaults: ProfileInput }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const { register, handleSubmit, watch, formState: { errors, isDirty }, reset } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: defaults });
  const grades = watch("school_level") === "SMA" ? ["10", "11", "12"] : ["7", "8", "9"];

  const onSubmit = (v: ProfileInput) =>
    start(async () => {
      const res = await updateProfile(v);
      if (res.error) toast(res.error, "error");
      else { toast("Profile saved."); reset(v); }
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Full name" htmlFor="full_name" error={errors.full_name?.message} required>
        <Input id="full_name" aria-invalid={!!errors.full_name} {...register("full_name")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="School level" htmlFor="school_level">
          <Select id="school_level" {...register("school_level")}><option value="SMP">SMP</option><option value="SMA">SMA</option></Select>
        </Field>
        <Field label="Grade" htmlFor="grade" error={errors.grade?.message}>
          <Select id="grade" {...register("grade")}><option value="">Choose…</option>{grades.map((g) => <option key={g} value={g}>Grade {g}</option>)}</Select>
        </Field>
      </div>
      <Field label="School name" htmlFor="school_name" error={errors.school_name?.message}>
        <Input id="school_name" {...register("school_name")} />
      </Field>
      <Field label="About me" htmlFor="bio" hint="Optional, up to 280 characters" error={errors.bio?.message}>
        <Textarea id="bio" {...register("bio")} />
      </Field>
      <Button type="submit" loading={pending} disabled={!isDirty}>Save changes</Button>
    </form>
  );
}

export function JoinClassForm() {
  const toast = useToast();
  const [code, setCode] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await joinClass(code);
          if (res.error) toast(res.error, "error");
          else { toast(`You joined ${res.name}!`); setCode(""); }
        });
      }}
    >
      <label htmlFor="class-code" className="sr-only">Class code</label>
      <Input id="class-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. 7F3A2B" maxLength={6} className="font-mono uppercase tracking-widest" />
      <Button type="submit" loading={pending} disabled={code.length !== 6}>Join</Button>
    </form>
  );
}
