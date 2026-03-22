import { EmptyState, MetricCard, PageHeader, Panel, StatusBadge, TableShell } from "@/components/console-ui";
import { getConsoleData } from "@/lib/console-data";
import { labelize } from "@/lib/formatters";
import { toneForUrgency } from "@/lib/presentation";
import { compactNumber } from "@/lib/formatters";
import { currency, percent } from "@/lib/utils";

export default function MatchesPage() {
  const data = getConsoleData();
  const uncovered = data.intentRows.filter((row) => row.matchCount === 0).length;
  const averageScore =
    data.matchRows.length > 0
      ? data.matchRows.reduce((sum, row) => sum + row.score, 0) / data.matchRows.length
      : 0;
  const averageGap =
    data.matchRows.length > 0
      ? data.matchRows.reduce((sum, row) => sum + row.priceGap, 0) / data.matchRows.length
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Matches"
        title="Supply coverage"
        description="A sober matching surface: which listings are credible against each intent, how far they sit from budget, and where coverage is still thin."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          label="Candidate rows"
          value={compactNumber(data.matchRows.length)}
          detail="Top listings currently mapped to active intents."
          tone="accent"
        />
        <MetricCard
          label="Uncovered intents"
          value={String(uncovered)}
          detail="Objectives that still need a supply source."
          tone={uncovered > 0 ? "warning" : "positive"}
        />
        <MetricCard
          label="Average score"
          value={percent(averageScore)}
          detail="A rough ranking signal from age, competition, and price fit."
        />
        <MetricCard
          label="Average price gap"
          value={currency(averageGap)}
          detail="Positive means listings are still above target budget."
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="Matching surface"
          description="The best current supply options across all active intents."
        >
          {data.matchRows.length ? (
            <TableShell>
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[rgba(255,255,255,0.02)] text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Intent</th>
                    <th className="px-4 py-3 font-medium">Listing</th>
                    <th className="px-4 py-3 font-medium">Fit</th>
                    <th className="px-4 py-3 font-medium">Ask</th>
                    <th className="px-4 py-3 font-medium">Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-soft)]">
                  {data.matchRows.map((row) => (
                    <tr key={`${row.intent.id}-${row.listing.id}`} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-medium text-[var(--text-primary)]">{row.intent.item}</div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <StatusBadge tone={toneForUrgency(row.intent.urgency)}>
                            {row.intent.urgency}
                          </StatusBadge>
                          <span className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            {row.intent.location}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[var(--text-secondary)]">
                        <div className="text-[var(--text-primary)]">{row.listing.title}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                          {row.listing.category}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[var(--text-primary)]">{percent(row.score)}</div>
                        <div className="mt-1 text-xs text-[var(--text-secondary)]">
                          Competition {percent(row.listing.competition)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[var(--text-primary)]">
                        {currency(row.listing.price)}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge tone={row.priceGap <= 0 ? "success" : "warning"}>
                          {row.priceGap <= 0 ? "inside band" : labelize("over budget")}
                        </StatusBadge>
                        <div className="mt-2 text-xs text-[var(--text-secondary)]">
                          {currency(Math.abs(row.priceGap))} {row.priceGap <= 0 ? "under" : "over"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          ) : (
            <EmptyState
              title="No supply matches yet"
              description="Add intents or enrich inventory before trying to work a negotiation."
            />
          )}
        </Panel>

        <Panel title="Coverage gaps" description="Intents that still need viable listings.">
          <div className="space-y-3">
            {data.intentRows.filter((row) => row.matchCount === 0).length ? (
              data.intentRows
                .filter((row) => row.matchCount === 0)
                .map((row) => (
                  <div
                    key={row.intent.id}
                    className="rounded-2xl border border-[var(--border-soft)] bg-[var(--background-panel-soft)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-[var(--text-primary)]">{row.intent.item}</div>
                      <StatusBadge tone="danger">uncovered</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      {row.intent.location} at {currency(row.intent.max_price)} with a{" "}
                      {row.agent.negotiation_strategy} strategy.
                    </p>
                  </div>
                ))
            ) : (
              <EmptyState
                title="Coverage looks healthy"
                description="Every active intent has at least one candidate listing in the current seed data."
              />
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
