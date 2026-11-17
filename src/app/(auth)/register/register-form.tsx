"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Alert, Field, Input, Select } from "@/components/ui/field";
import { registerSchema, type RegisterInput } from "@/lib/validation";
import { signUp } from "../actions";

export function RegisterForm() {
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { school_level: "SMP", grade: "" },
  });
  const level = watch("school_level");
  const grades = level === "SMA" ? [10, 11, 12] : [7, 8, 9];

  const onSubmit = (values: RegisterInput) =>
    startTransition(async () => {
      setError(undefined);
      const res = await signUp(values);
      if (res?.error) setError(res.error);
      if (res?.message) setMessage(res.message);
    });

  if (message) return <Alert tone="success" className="mt-8">{message}</Alert>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
      {error && <Alert>{error}</Alert>}
      <Field label="Full name" htmlFor="full_name" error={errors.full_name?.message} required>
        <Input id="full_name" autoComplete="name" aria-invalid={!!errors.full_name} {...register("full_name")} />
      </Field>
      <Field label="Email" htmlFor="email" error={errors.email?.message} required>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="School level" htmlFor="school_level" error={errors.school_level?.message} required>
          <Select id="school_level" {...register("school_level")}>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
          </Select>
        </Field>
        <Field label="Grade" htmlFor="grade" error={errors.grade?.message} required>
          <Select id="grade" aria-invalid={!!errors.grade} {...register("grade")}>
            <option value="">Choose…</option>
            {grades.map((g) => <option key={g} value={g}>Grade {g}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="School name" htmlFor="school_name" hint="Optional" error={errors.school_name?.message}>
        <Input id="school_name" {...register("school_name")} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Password" htmlFor="password" error={errors.password?.message} required>
          <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
        </Field>
        <Field label="Confirm password" htmlFor="confirm" error={errors.confirm?.message} required>
          <Input id="confirm" type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} {...register("confirm")} />
        </Field>
      </div>
      <p className="text-xs text-muted">Your school grade is only used for your profile — your English level is set by the placement test.</p>
      <Button type="submit" size="lg" className="w-full" loading={pending}>Create account</Button>
    </form>
  );
}
