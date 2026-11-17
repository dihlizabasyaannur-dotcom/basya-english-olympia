import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-1.5 text-muted">Sign in to continue your English journey.</p>
      <LoginForm next={next} initialError={error === "auth" ? "That sign-in link is invalid or has expired." : undefined} />
      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="font-semibold text-brand hover:underline">Create a student account</Link>
      </p>
    </>
  );
}
