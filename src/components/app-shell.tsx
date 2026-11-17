"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen, ClipboardCheck, FileUp, Gauge, History, LayoutDashboard, LibraryBig, LineChart, LogOut, Menu, UserRound, Users, X,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(auth)/actions";

const ICONS = { LayoutDashboard, BookOpen, ClipboardCheck, History, LineChart, UserRound, Gauge, LibraryBig, FileUp, Users } as const;
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; exact?: boolean };

const NAV: Record<string, NavItem[]> = {
  student: [
    { href: "/student", label: "Dashboard", icon: "LayoutDashboard", exact: true },
    { href: "/student/learn", label: "Learning Programs", icon: "BookOpen" },
    { href: "/student/assessments", label: "Assessments", icon: "ClipboardCheck" },
    { href: "/student/progress", label: "My Progress", icon: "LineChart" },
    { href: "/student/history", label: "History", icon: "History" },
    { href: "/student/profile", label: "Profile", icon: "UserRound" },
  ],
  teacher: [
    { href: "/teacher", label: "Dashboard", icon: "LayoutDashboard", exact: true },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: "Gauge", exact: true },
    { href: "/admin/questions", label: "Question Bank", icon: "LibraryBig" },
    { href: "/admin/questions/import", label: "Import / Export", icon: "FileUp" },
    { href: "/admin/users", label: "Users", icon: "Users" },
  ],
};

const ROLE_LABEL: Record<string, string> = { student: "Student", teacher: "Teacher", admin: "Super Admin" };

export function AppShell({ role, name, children }: { role: string; name: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const items = NAV[role] ?? [];

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    // Most specific match wins (so /admin/questions/import doesn't also light up /admin/questions)
    const matches = items.filter((i) => !i.exact && (pathname === i.href || pathname.startsWith(i.href + "/")));
    return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href === item.href;
  };

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Link href="/" aria-label="Home"><Logo tone="light" className="[&_span.block]:text-[13px]" /></Link>
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-white text-ink shadow-sm" : "text-lavender/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", active ? "text-brand" : "")} aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="m-3 rounded-2xl bg-white/[0.07] p-3">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="text-xs text-gold">{ROLE_LABEL[role] ?? role}</p>
        <form action={signOut} className="mt-3">
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 py-2 text-xs font-semibold text-lavender hover:bg-white/10">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </form>
      </div>
      <p className="px-5 pb-4 text-[10px] leading-snug text-lavender/50">An English Learning Platform by Ma&apos;am Basya</p>
    </nav>
  );

  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="bg-hero fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{nav}</aside>

      {/* Mobile top bar + drawer */}
      <div className="bg-hero sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden">
        <Link href="/" aria-label="Home"><Logo tone="light" className="[&_span.block]:text-[12px]" /></Link>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-white hover:bg-white/10" aria-label="Open menu" aria-expanded={open}>
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside className="bg-hero absolute inset-y-0 left-0 w-72 max-w-[85vw]">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-lg p-2 text-white hover:bg-white/10" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            {nav}
          </aside>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}
