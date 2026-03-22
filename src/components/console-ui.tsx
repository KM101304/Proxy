import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-[var(--border-soft)] pb-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          {eyebrow}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)] md:text-[3.25rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] md:text-[15px]">
          {description}
        </p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[22px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0)),var(--background-panel)] shadow-[var(--shadow-panel)]",
        className,
      )}
    >
      {title || description || action ? (
        <div className="flex flex-col gap-3 border-b border-[var(--border-soft)] px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            {title ? (
              <h2 className="text-base font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)] sm:text-[15px]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "accent" | "positive" | "warning";
}) {
  const toneClass =
    tone === "accent"
      ? "border-[rgba(199,160,106,0.18)] bg-[rgba(199,160,106,0.08)]"
      : tone === "positive"
        ? "border-[rgba(84,199,154,0.18)] bg-[rgba(84,199,154,0.08)]"
        : tone === "warning"
          ? "border-[rgba(215,184,111,0.18)] bg-[rgba(215,184,111,0.08)]"
          : "border-[var(--border-soft)] bg-[var(--background-panel-soft)]";

  return (
    <div className={cn("rounded-[20px] border p-4", toneClass)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
            {value}
          </div>
        </div>
        <span
          className={cn(
            "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
            tone === "accent"
              ? "bg-[var(--accent)]"
              : tone === "positive"
                ? "bg-[var(--positive)]"
                : tone === "warning"
                  ? "bg-[var(--warning)]"
                  : "bg-[var(--border-strong)]",
          )}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{detail}</p>
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "info"
      ? "border-[rgba(199,160,106,0.22)] bg-[rgba(199,160,106,0.12)] text-[var(--accent-strong)]"
      : tone === "success"
        ? "border-[rgba(84,199,154,0.24)] bg-[rgba(84,199,154,0.12)] text-[var(--positive)]"
        : tone === "warning"
          ? "border-[rgba(215,184,111,0.24)] bg-[rgba(215,184,111,0.12)] text-[var(--warning)]"
          : tone === "danger"
            ? "border-[rgba(255,139,122,0.24)] bg-[rgba(255,139,122,0.12)] text-[var(--danger)]"
            : "border-[var(--border-soft)] bg-[var(--background-panel-soft)] text-[var(--text-secondary)]";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]",
        toneClass,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-[var(--border-strong)] bg-[rgba(13,19,28,0.6)] px-5 py-10 text-center">
      <div className="mx-auto inline-flex rounded-[18px] border border-[var(--border-soft)] bg-[var(--background-panel-strong)] p-3 text-[var(--text-secondary)]">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-[var(--text-primary)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>
    </div>
  );
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[var(--border-soft)] bg-[var(--background-panel-strong)]">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function KeyValueGrid({
  items,
  columns = 2,
}: {
  items: Array<{ label: string; value: ReactNode }>;
  columns?: 2 | 3;
}) {
  const gridClass = columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <div className={cn("grid gap-4", gridClass)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[18px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] p-4"
        >
          <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
            {item.label}
          </div>
          <div className="mt-2 text-sm leading-6 text-[var(--text-primary)]">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export function Timeline({
  items,
}: {
  items: Array<{
    id: string;
    eyebrow: string;
    title: string;
    detail: string;
    meta?: string;
  }>;
}) {
  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <div key={item.id} className="grid grid-cols-[16px_1fr] gap-4">
          <div className="relative flex justify-center">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
            {index < items.length - 1 ? (
              <span className="absolute top-5 bottom-0 w-px bg-[var(--border-soft)]" />
            ) : null}
          </div>
          <div className={cn("pb-5", index < items.length - 1 ? "border-b border-[var(--border-soft)]" : "")}>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  {item.eyebrow}
                </div>
                <div className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                  {item.title}
                </div>
              </div>
              {item.meta ? (
                <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {item.meta}
                </div>
              ) : null}
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
