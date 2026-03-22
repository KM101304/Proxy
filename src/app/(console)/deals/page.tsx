import Link from "next/link";
import { MetricCard, PageHeader, Panel, StatusBadge, TableShell } from "@/components/console-ui";
import { getConsoleData } from "@/lib/console-data";
import { labelize, shortDate } from "@/lib/formatters";
import { toneForDealStatus } from "@/lib/presentation";
import { currency, percent } from "@/lib/utils";

export default function DealsPage() {
  const data = getConsoleData();
  const totalSavings = data.dealRows.reduce((sum, row) => sum + row.deal.savings_amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deals"
        title="Deal registry"
        description="A single source of truth for every negotiation thread, not just the ones currently in motion."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          label="All deals"
          value={String(data.dealRows.length)}
          detail="Every created negotiation thread."
          tone="accent"
        />
        <MetricCard
          label="Settled"
          value={String(data.settledDeals.length)}
          detail="Accepted settlements."
          tone="positive"
        />
        <MetricCard
          label="Stalled"
          value={String(data.stalledDeals.length)}
          detail="Expired threads without a close."
          tone={data.stalledDeals.length ? "warning" : "neutral"}
        />
        <MetricCard
          label="Gross savings"
          value={currency(totalSavings)}
          detail="Aggregate savings exposure across the deal book."
        />
      </div>

      <Panel title="Deal book" description="Open a thread to inspect its pricing path and event history.">
        <TableShell>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[rgba(255,255,255,0.02)] text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Deal</th>
                <th className="px-4 py-3 font-medium">Listing</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Savings</th>
                <th className="px-4 py-3 font-medium">Probability</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)]">
              {data.dealRows.map((row) => (
                <tr key={row.deal.id} className="align-top">
                  <td className="px-4 py-4">
                    <Link href={`/deals/${row.deal.id}`} className="font-medium hover:text-[var(--accent)]">
                      {row.intent?.item ?? row.deal.id}
                    </Link>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      {row.intent?.location ?? "Unknown market"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[var(--text-secondary)]">
                    {row.listing?.title ?? "No listing attached"}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge tone={toneForDealStatus(row.deal.status)}>
                      {labelize(row.deal.status)}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-4 text-[var(--text-primary)]">
                    {currency(row.deal.savings_amount)}
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
    </div>
  );
}
