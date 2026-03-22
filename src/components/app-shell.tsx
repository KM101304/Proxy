"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Cable,
  ChartNoAxesCombined,
  Database,
  GitPullRequestArrow,
  Handshake,
  LayoutDashboard,
  Package,
  ShieldCheck,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { shortTime } from "@/lib/formatters";
import { LogoMark } from "@/components/logo-mark";
import { RunCycleButton } from "@/components/run-cycle-button";

const primaryNavigation = [
  {
    href: "/overview",
    label: "Overview",
    icon: LayoutDashboard,
    section: "Command",
  },
  { href: "/intent-flow", label: "Intent Flow", icon: Target, section: "Command" },
  { href: "/matches", label: "Matches", icon: GitPullRequestArrow, section: "Command" },
  { href: "/negotiations", label: "Negotiations", icon: Handshake, section: "Command" },
  { href: "/deals", label: "Deals", icon: ShieldCheck, section: "Command" },
];

const secondaryNavigation = [
  { href: "/inventory", label: "Inventory", icon: Package, section: "System" },
  { href: "/policies", label: "Policies", icon: SlidersHorizontal, section: "System" },
  { href: "/analytics", label: "Analytics", icon: ChartNoAxesCombined, section: "System" },
  { href: "/integrations", label: "Integrations", icon: Cable, section: "System" },
  { href: "/notifications", label: "Notifications", icon: Bell, section: "System" },
  { href: "/settings", label: "Settings", icon: Database, section: "System" },
];

const navigation = [...primaryNavigation, ...secondaryNavigation];

export function AppShell({
  children,
  lastRunAt,
  stats,
}: {
  children: React.ReactNode;
  lastRunAt?: string;
  stats: {
    activeAgents: number;
    negotiationsLive: number;
    acceptedDeals: number;
  };
}) {
  const pathname = usePathname();
  const currentSurface =
    navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ??
    primaryNavigation[0];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`) || (href !== "/deals" && pathname.startsWith(href));
  }

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen max-w-[1640px]">
        <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 border-r border-[var(--border-soft)] bg-[rgba(8,10,15,0.92)] px-4 py-5 lg:flex lg:flex-col">
          <Link
            href="/overview"
            className="rounded-[24px] border border-[var(--border-strong)] bg-[linear-gradient(180deg,rgba(199,160,106,0.12),rgba(14,18,26,0.96))] px-4 py-4 transition hover:border-[rgba(199,160,106,0.28)]"
          >
            <div className="flex items-center gap-3">
              <LogoMark />
              <div>
                <div className="text-[13px] font-semibold uppercase tracking-[0.28em] text-[var(--text-primary)]">
                  Proxy
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  Market operating system
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <div className="flex items-center justify-between gap-3">
                <span>Mode</span>
                <span className="text-[var(--text-primary)]">Simulation</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Last cycle</span>
                <span className="text-[var(--text-primary)]">{shortTime(lastRunAt)} UTC</span>
              </div>
            </div>
          </Link>

          <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
            {[
              { label: "Command", items: primaryNavigation },
              { label: "System", items: secondaryNavigation },
            ].map((section) => (
              <div key={section.label}>
                <div className="px-2 text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
                  {section.label}
                </div>
                <div className="mt-2 space-y-1.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-[18px] border px-3 py-2.5 text-sm transition",
                          active
                            ? "border-[rgba(199,160,106,0.24)] bg-[rgba(199,160,106,0.1)] text-[var(--text-primary)]"
                            : "border-transparent bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-soft)] hover:bg-[var(--background-panel-soft)] hover:text-[var(--text-primary)]",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-xl border transition",
                            active
                              ? "border-[rgba(199,160,106,0.24)] bg-[rgba(199,160,106,0.12)] text-[var(--accent-strong)]"
                              : "border-[var(--border-soft)] bg-[var(--background-panel)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)]",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">{item.label}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[20px] border border-[var(--border-soft)] bg-[var(--background-panel)] p-4">
            <div className="text-[10px] uppercase tracking-[0.26em] text-[var(--text-muted)]">
              Command posture
            </div>
            <div className="mt-3 grid gap-3">
              <MiniStat label="Active intents" value={String(stats.activeAgents)} />
              <MiniStat label="Negotiations live" value={String(stats.negotiationsLive)} />
              <MiniStat label="Settled deals" value={String(stats.acceptedDeals)} />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[var(--border-soft)] bg-[rgba(7,10,15,0.88)] backdrop-blur">
            <div className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-4">
                  <Link
                    href="/overview"
                    className="flex items-center gap-3 rounded-[20px] border border-[var(--border-soft)] bg-[var(--background-panel)] px-3 py-2 lg:hidden"
                  >
                    <LogoMark size={34} />
                    <span className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[var(--text-primary)]">
                      Proxy
                    </span>
                  </Link>
                  <div className="hidden lg:block">
                    <div className="text-[10px] uppercase tracking-[0.26em] text-[var(--text-muted)]">
                      {currentSurface.section}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      <h1 className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--text-primary)]">
                        {currentSurface.label}
                      </h1>
                      <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                      <span className="text-sm text-[var(--text-secondary)]">
                        Seller-side market command layer
                      </span>
                    </div>
                  </div>
                  <div className="lg:hidden">
                    <div className="text-[10px] uppercase tracking-[0.26em] text-[var(--text-muted)]">
                      {currentSurface.section}
                    </div>
                    <div className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                      {currentSurface.label}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {stats.activeAgents} intents · {stats.negotiationsLive} live · {stats.acceptedDeals} settled
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      Last cycle {shortTime(lastRunAt)} UTC
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="hidden grid-cols-3 gap-2 rounded-[20px] border border-[var(--border-soft)] bg-[var(--background-panel)] p-1.5 sm:grid">
                    <TopMetric label="Intents" value={stats.activeAgents} />
                    <TopMetric label="Live" value={stats.negotiationsLive} />
                    <TopMetric label="Settled" value={stats.acceptedDeals} />
                  </div>
                  <RunCycleButton />
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                {primaryNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition",
                      isActive(item.href)
                        ? "border-[rgba(199,160,106,0.24)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                        : "border-[var(--border-soft)] bg-[var(--background-panel)] text-[var(--text-secondary)]",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <details className="mt-3 rounded-[20px] border border-[var(--border-soft)] bg-[var(--background-panel)] lg:hidden">
                <summary className="cursor-pointer list-none px-4 py-3 text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  System surfaces
                </summary>
                <div className="grid gap-2 border-t border-[var(--border-soft)] px-3 py-3">
                  {secondaryNavigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-[16px] border px-3 py-2 text-sm transition",
                        isActive(item.href)
                          ? "border-[rgba(199,160,106,0.24)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                          : "border-[var(--border-soft)] bg-[var(--background-panel-soft)] text-[var(--text-secondary)]",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[16px] border border-[var(--border-soft)] bg-[var(--background-panel-soft)] px-3 py-2">
      <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function TopMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[16px] bg-[var(--background-panel-soft)] px-3 py-2 text-center">
      <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{value}</div>
    </div>
  );
}
