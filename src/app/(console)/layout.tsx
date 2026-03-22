import { AppShell } from "@/components/app-shell";
import { getConsoleData } from "@/lib/console-data";

export const dynamic = "force-dynamic";

export default function ConsoleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = getConsoleData();

  return (
    <AppShell
      lastRunAt={data.lastRunAt}
      stats={{
        activeAgents: data.snapshot.stats.activeAgents,
        negotiationsLive: data.snapshot.stats.negotiationsLive,
        acceptedDeals: data.snapshot.stats.acceptedDeals,
      }}
    >
      {children}
    </AppShell>
  );
}
