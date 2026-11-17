import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Alert } from "@/components/ui/field";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="bg-hero hidden flex-col justify-between p-10 text-white lg:flex">
        <Link href="/"><Logo tone="light" showSignature /></Link>
        <div>
          <p className="font-display text-4xl font-semibold leading-tight">Learn. Practise.<br /><span className="text-gold">Compete.</span></p>
          <p className="mt-4 max-w-md text-lavender/80">English proficiency from A1 to B2 and Olympiad preparation for SMP &amp; SMA students.</p>
        </div>
        <p className="text-xs text-lavender/60">© {new Date().getFullYear()} Basya English Olympia</p>
      </aside>
      <main className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <Link href="/" className="mb-8 lg:hidden"><Logo /></Link>
        <div className="w-full max-w-md">
          {!isSupabaseConfigured() && (
            <Alert tone="warning" className="mb-6">
              <strong>Database not connected yet.</strong> Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code> (see README) to enable sign-in.
            </Alert>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
