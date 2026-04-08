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
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 border-r border-[var(--border-soft)] bg-[var(--background)] px-4 py-5 lg:flex lg:flex-col z-30">
          <Link
            href="/overview"
            className="border border-[var(--border-soft)] bg-[var(--background-panel)] px-4 py-4 transition hover:border-[var(--accent)] hover:bg-[#111]"
          >
            <div className="flex items-center gap-3">
              <LogoMark />
              <div>
                <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--text-primary)]">
                  PROXY
                </div>
                <div className="mt-1 text-[10px] uppercase text-[var(--text-secondary)] font-mono">
                  SYS.TERMINAL.01
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-[10px] uppercase font-mono text-[var(--text-muted)] border-t border-[var(--border-soft)] pt-3">
              <div className="flex items-center justify-between gap-3">
                <span>OP_MODE</span>
                <span className="text-[var(--accent)] bg-[#221a00] px-1 font-bold">LIVE</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>LAST_SYNC</span>
                <span className="text-[var(--positive)]">{shortTime(lastRunAt)} UTC</span>
              </div>
            </div>
          </Link>

          <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
            {[
              { label: "CMND_SURFACE", items: primaryNavigation },
              { label: "SYS_SURFACE", items: secondaryNavigation },
            ].map((section) => (
              <div key={section.label}>
                <div className="px-2 text-[10px] bg-[#111] border-b border-[var(--border-soft)] py-1 font-mono uppercase text-[var(--text-muted)]">
                  {section.label}
                </div>
                <div className="mt-2 space-y-0 text-sm font-mono tracking-tight">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 border-l-2 px-3 py-1.5 transition-none",
                          active
                            ? "border-[var(--accent)] bg-[var(--background-panel-strong)] text-[var(--accent)] font-bold"
                            : "border-transparent bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[#111] hover:text-[var(--text-primary)]",
                        )}
                      >
                        <span className={cn("flex items-center justify-center")}>
                          <Icon className="h-[14px] w-[14px] stroke-[2.5]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div>{item.label.toUpperCase()}</div>
                        </div>
                        {active && <span className="text-[10px]">_</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border border-[var(--border-soft)] bg-[var(--background-panel)] p-3">
            <div className="text-[10px] uppercase font-mono border-b border-[var(--border-soft)] pb-1 mb-2 text-[var(--accent)]">
              &gt; STATUS_MATRIX
            </div>
            <div className="mt-2 grid gap-1">
              <MiniStat label="AGENTS_UP" value={String(stats.activeAgents)} isHighlight />
              <MiniStat label="NEG_LIVE" value={String(stats.negotiationsLive)} />
              <MiniStat label="DEALS_SETTLED" value={String(stats.acceptedDeals)} />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 relative flex flex-col">
          <header className="sticky top-0 z-20 border-b border-[var(--border-soft)] bg-[var(--background)] mx-0 mt-0 mb-4 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4">
                <Link
                  href="/overview"
                  className="flex items-center gap-3 border border-[var(--border-soft)] bg-[var(--background-panel)] px-2 py-1 lg:hidden"
                >
                  <LogoMark size={24} />
                  <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">
                    PROXY
                  </span>
                </Link>
                <div className="hidden lg:flex lg:flex-row lg:items-center gap-4">
                  <div className="bg-[var(--accent)] text-black px-2 py-0.5 text-xs font-bold uppercase font-mono tracking-tight">
                    {currentSurface.section} / {currentSurface.label}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-mono flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-[var(--positive)] block animate-pulse" />
                    DATA NODE CONNECTED
                  </div>
                </div>
                <div className="lg:hidden text-xs font-mono uppercase text-[var(--text-muted)]">
                  <div>{currentSurface.section} / {currentSurface.label}</div>
                  <div className="mt-1 text-[var(--positive)]">&gt; OP_MODE: LIVE</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="hidden grid-cols-3 gap-0 border border-[var(--border-soft)] bg-[var(--background-panel-strong)] sm:grid divide-x divide-[var(--border-soft)]">
                  <TopMetric label="AGENTS" value={stats.activeAgents} />
                  <TopMetric label="LIVE" value={stats.negotiationsLive} />
                  <TopMetric label="STLD" value={stats.acceptedDeals} />
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
                    "shrink-0 border px-3 py-1 text-[10px] font-mono uppercase transition-none cursor-pointer",
                    isActive(item.href)
                      ? "border-[var(--accent)] bg-[#221a00] text-[var(--accent)] font-bold"
                      : "border-[var(--border-soft)] bg-transparent text-[var(--text-secondary)]",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </header>

          <main className="px-4 pb-12 sm:px-6 lg:px-8 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, isHighlight }: { label: string; value: string; isHighlight?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between font-mono text-[11px] uppercase border border-[var(--border-soft)] px-2 py-1", isHighlight ? "bg-[#111]" : "bg-transparent")}>
      <span className={cn(isHighlight ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-muted)]")}>{label}</span>
      <span className={cn(isHighlight ? "text-[var(--accent)] font-bold" : "text-[var(--text-primary)]")}>{value}</span>
    </div>
  );
}

function TopMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[var(--background-panel)] px-4 py-1 text-center cursor-default font-mono">
      <div className="text-[9px] uppercase text-[var(--text-muted)]">{label}</div>
      <div className="text-[12px] font-bold text-[var(--text-primary)]">{value}</div>
    </div>
  );
}
