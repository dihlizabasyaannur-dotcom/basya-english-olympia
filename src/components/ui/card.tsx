import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-soft)]", className)} {...props} />;
}

export function CardHeader({ title, description, action, className }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6", className)}>
      <div className="min-w-0">
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}

export function Badge({ tone = "lavender", className, children }: { tone?: "lavender" | "gold" | "success" | "danger" | "warning" | "ink" | "neutral"; className?: string; children: React.ReactNode }) {
  const tones = {
    lavender: "bg-lavender text-brand-700",
    gold: "bg-gold-50 text-gold-600 ring-1 ring-gold/50",
    success: "bg-success-50 text-success",
    danger: "bg-danger-50 text-danger",
    warning: "bg-warning-50 text-warning",
    ink: "bg-ink text-white",
    neutral: "bg-[#f1eff7] text-muted",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>{children}</span>;
}

export function ProgressBar({ value, tone = "brand", className, label }: { value: number; tone?: "brand" | "gold" | "success"; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  const tones = { brand: "bg-brand", gold: "bg-gold", success: "bg-success" };
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-lavender", className)} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={cn("h-full rounded-full transition-[width] duration-500", tones[tone])} style={{ width: `${v}%` }} />
    </div>
  );
}

export function EmptyState({ icon, title, description, action, className }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-2xl border border-dashed border-line bg-lavender-50/60 px-6 py-10 text-center", className)}>
      {icon && <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand shadow-[var(--shadow-soft)]">{icon}</div>}
      <p className="font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, icon, tone = "lavender" }: { label: string; value: React.ReactNode; hint?: React.ReactNode; icon?: React.ReactNode; tone?: "lavender" | "gold" | "ink" }) {
  const tones = { lavender: "bg-lavender text-brand", gold: "bg-gold-50 text-gold-600", ink: "bg-ink text-gold" };
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-3">
        {icon && <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tones[tone])}>{icon}</div>}
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
          <p className="truncate text-2xl font-bold text-ink">{value}</p>
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}
