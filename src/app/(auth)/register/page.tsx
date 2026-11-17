import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-ink">Create your account</h1>
      <p className="mt-1.5 text-muted">Free for SMP and SMA students. Teachers receive access from Ma&apos;am Basya.</p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">Sign in</Link>
      </p>
    </>
  );
}
