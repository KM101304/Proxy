import { MetricCard, PageHeader, Panel } from "@/components/console-ui";
import { getConsoleData } from "@/lib/console-data";
import { compactNumber } from "@/lib/formatters";
import { currency, percent } from "@/lib/utils";

export default function AnalyticsPage() {
  const data = getConsoleData();
  const totalBookValue = data.dealRows.reduce((sum, row) => sum + row.deal.current_offer, 0);
  const liveProbability =
    data.liveDeals.reduce((sum, row) => sum + row.deal.acceptance_probability, 0) /
    Math.max(1, data.liveDeals.length);
  const pipeline = [
    {
      label: "Searching",
      count: data.intentRows.filter((row) => !row.bestListing).length,
    },
    {
      label: "Negotiating",
      count: data.dealRows.filter(({ deal }) => deal.status === "negotiating").length,
    },
    {
      label: "Near close",
      count: data.dealRows.filter(({ deal }) => deal.status === "close_to_accept").length,
    },
    {
      label: "Settled",
      count: data.settledDeals.length,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Operational analytics"
        description="A restrained analytics pass: pipeline shape, exposure, and live confidence without pretending the seed data is a real BI warehouse."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          label="Deal book value"
          value={currency(totalBookValue)}
          detail="Current quoted value across all deals."
          tone="accent"
        />
        <MetricCard
          label="Live confidence"
          value={percent(liveProbability)}
          detail="Average acceptance probability in live threads."
        />
        <MetricCard
          label="Inventory records"
          value={compactNumber(data.inventoryRows.length)}
          detail="Listings available to the matching engine."
        />
        <MetricCard
          label="Captured savings"
          value={currency(data.snapshot.stats.capturedSavings)}
          detail="Gross value protected for buyers."
          tone="positive"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Pipeline distribution" description="Stage counts across the current workspace.">
          <div className="space-y-3">
            {pipeline.map((item) => {
              const width = Math.max(12, (item.count / Math.max(1, data.intentRows.length)) * 100);

              return (
                <div key={item.label} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--background-panel-soft)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{item.label}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{item.count}</div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.04)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Exposure by intent" description="Current expected savings and settlement pressure.">
          <div className="space-y-3">
            {data.intentRows.map((row) => (
              <div
                key={row.intent.id}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--background-panel-soft)] p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{row.intent.item}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      {row.intent.location}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    Best price {row.bestDeal ? currency(row.bestDeal.current_offer) : "No active quote"}
                  </div>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--background-panel-strong)] px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Savings
                    </div>
                    <div className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                      {currency(row.bestDeal?.savings_amount ?? 0)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--background-panel-strong)] px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Match count
                    </div>
                    <div className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                      {row.matchCount}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--background-panel-strong)] px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Confidence
                    </div>
                    <div className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                      {percent(row.bestDeal?.acceptance_probability ?? 0.12)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
