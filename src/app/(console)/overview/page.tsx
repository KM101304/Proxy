import Link from "next/link";
import { ArrowRight, ShieldCheck, Target } from "lucide-react";
import { MetricCard, PageHeader, Panel, StatusBadge, TableShell, Timeline } from "@/components/console-ui";
import { getConsoleData } from "@/lib/console-data";
import { labelize, relativeTime, shortDate } from "@/lib/formatters";
import { toneForDealStatus, toneForOperationalState } from "@/lib/presentation";
import { currency, percent } from "@/lib/utils";

export default function OverviewPage() {
  const data = getConsoleData();
  const coverageByMarket = Array.from(
    data.intentRows.reduce((map, row) => {
      const next = map.get(row.intent.location) ?? { intents: 0, liveDeals: 0 };
      next.intents += 1;
      if (row.bestDeal && row.bestDeal.status !== "expired") {
        next.liveDeals += 1;
      }
      map.set(row.intent.location, next);
      return map;
    }, new Map<string, { intents: number; liveDeals: number }>()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Operational posture"
        description="A live control surface for mandate coverage, negotiation pressure, and settlement readiness across the current book."
        actions={
          <Link
            href="/intent-flow"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(199,160,106,0.22)] bg-[var(--accent-soft)] px-4 py-2.5 text-sm text-[var(--text-primary)] transition hover:border-[rgba(199,160,106,0.34)]"
          >
            Open intent desk
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          label="Active Intents"
          value={String(data.snapshot.stats.activeAgents)}
          detail="Buyer objectives currently in the system."
          tone="accent"
        />
        <MetricCard
          label="Negotiations Live"
          value={String(data.snapshot.stats.negotiationsLive)}
          detail="Threads with active pricing movement."
          tone="warning"
        />
        <MetricCard
          label="Captured Savings"
          value={currency(data.snapshot.stats.capturedSavings)}
          detail="Value already protected for buyers."
          tone="positive"
        />
        <MetricCard
          label="Execution Revenue"
          value={currency(data.snapshot.stats.executionRevenue)}
          detail="Recognized only from accepted settlements."
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel
          title="Operator queue"
          description="What needs attention first: missing coverage, close-to-accept negotiations, and stalled threads."
        >
          <div className="space-y-3">
            {data.intentRows.map((row) => (
              <div
                key={row.intent.id}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--background-panel-soft)] p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                      {row.intent.location}
                    </div>
                    <div className="mt-1 text-lg font-medium text-[var(--text-primary)]">
                      {row.intent.item}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      Budget {currency(row.intent.max_price)}. {row.matchCount} candidate{" "}
                      {row.matchCount === 1 ? "listing" : "listings"} on file. Last activity{" "}
                      {relativeTime(row.activity[0]?.created_at ?? row.intent.created_at)}.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone={toneForOperationalState(row.operationalState)}>
                      {labelize(row.operationalState)}
                    </StatusBadge>
                    <StatusBadge tone={toneForDealStatus(row.bestDeal?.status)}>
                      {labelize(row.bestDeal?.status ?? "searching")}
                    </StatusBadge>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-sm text-[var(--text-secondary)]">
                  <span>Strategy {row.agent.negotiation_strategy}</span>
                  <span>Actions {row.agent.actions_taken_today}/{row.agent.max_actions_per_day}</span>
                  <span>
                    Best price {row.bestDeal ? currency(row.bestDeal.current_offer) : "No active quote"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Recent thread activity"
          description="Latest negotiation messages and system state changes across the workspace."
        >
          <Timeline
            items={data.notificationRows.slice(0, 6).map((row) => ({
              id: row.event.id,
              eyebrow: row.intent?.item ?? row.event.actor,
              title: `${row.event.actor} ${row.event.type}`,
              detail: row.event.message,
              meta: shortDate(row.event.created_at),
            }))}
          />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel
          title="Active negotiations"
          description="The live book of deals that still have pricing movement."
          action={
            <Link
              href="/negotiations"
              className="text-sm text-[var(--accent)] transition hover:text-[var(--text-primary)]"
            >
              Open full desk
            </Link>
          }
        >
          <TableShell>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[rgba(255,255,255,0.02)] text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Intent</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Current offer</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {data.liveDeals.map((row) => (
                  <tr key={row.deal.id} className="align-top">
                    <td className="px-4 py-4">
                      <Link href={`/deals/${row.deal.id}`} className="font-medium hover:text-[var(--accent)]">
                        {row.intent?.item ?? row.deal.id}
                      </Link>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        {row.intent?.location ?? "Unknown market"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge tone={toneForDealStatus(row.deal.status)}>
                        {labelize(row.deal.status)}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-4 text-[var(--text-primary)]">
                      {currency(row.deal.current_offer)}
                    </td>
                    <td className="px-4 py-4 text-[var(--text-primary)]">
                      {percent(row.deal.acceptance_probability)}
                    </td>
                    <td className="px-4 py-4 text-[var(--text-secondary)]">
                      {shortDate(row.deal.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </Panel>

        <Panel title="Coverage posture" description="Market-level coverage and settlement pressure.">
          <div className="space-y-3">
            {coverageByMarket.map(([market, counts]) => (
              <div
                key={market}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--background-panel-soft)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{market}</div>
                  <StatusBadge tone={counts.liveDeals > 0 ? "info" : "danger"}>
                    {counts.liveDeals > 0 ? "covered" : "thin"}
                  </StatusBadge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-[var(--text-secondary)]">
                  <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--background-panel-strong)] px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Intents
                    </div>
                    <div className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                      {counts.intents}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--background-panel-strong)] px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Live deals
                    </div>
                    <div className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                      {counts.liveDeals}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--background-panel-soft)] p-4">
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                  <Target className="h-4 w-4 text-[var(--accent)]" />
                  <span className="text-sm font-medium">Intent pressure</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {data.intentRows.filter((row) => row.operationalState === "needs-coverage").length} intents
                  still lack credible supply coverage.
                </p>
              </div>

              <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--background-panel-soft)] p-4">
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                  <ShieldCheck className="h-4 w-4 text-[var(--positive)]" />
                  <span className="text-sm font-medium">Approval readiness</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {data.liveDeals.filter((row) => row.deal.status === "close_to_accept").length} negotiations
                  are inside the likely approval band.
                </p>
              </div>
            </div>

            <div className="rounded-[18px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-primary)]">Desk note:</span> advance a cycle to
              refresh the book, then move into matches or negotiations to resolve thin coverage and near-close
              threads.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
