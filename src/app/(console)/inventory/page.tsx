import { MetricCard, PageHeader, Panel, StatusBadge, TableShell } from "@/components/console-ui";
import { getConsoleData } from "@/lib/console-data";
import { compactNumber } from "@/lib/formatters";
import { currency, percent } from "@/lib/utils";

export default function InventoryPage() {
  const data = getConsoleData();
  const averageAsk =
    data.inventoryRows.reduce((sum, row) => sum + row.listing.price, 0) /
    Math.max(1, data.inventoryRows.length);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Listing inventory"
        description="The seeded listing book currently available to the matching and negotiation services."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          label="Listings"
          value={compactNumber(data.inventoryRows.length)}
          detail="Current supply records in the seed inventory."
          tone="accent"
        />
        <MetricCard
          label="Markets"
          value={String(new Set(data.inventoryRows.map((row) => row.listing.location)).size)}
          detail="Distinct geographic clusters."
        />
        <MetricCard
          label="Average ask"
          value={currency(averageAsk)}
          detail="Mean listing price across the seed set."
        />
        <MetricCard
          label="Attached deals"
          value={String(data.inventoryRows.reduce((sum, row) => sum + row.activeDealCount, 0))}
          detail="Non-expired deals currently attached to inventory."
        />
      </div>

      <Panel title="Inventory table" description="Current supply with demand linkage and pricing pressure.">
        <TableShell>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[rgba(255,255,255,0.02)] text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Listing</th>
                <th className="px-4 py-3 font-medium">Market</th>
                <th className="px-4 py-3 font-medium">Ask</th>
                <th className="px-4 py-3 font-medium">Competition</th>
                <th className="px-4 py-3 font-medium">Demand linkage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)]">
              {data.inventoryRows.map((row) => (
                <tr key={row.listing.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="font-medium text-[var(--text-primary)]">{row.listing.title}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      {row.listing.category}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[var(--text-secondary)]">{row.listing.location}</td>
                  <td className="px-4 py-4 text-[var(--text-primary)]">{currency(row.listing.price)}</td>
                  <td className="px-4 py-4 text-[var(--text-primary)]">
                    {percent(row.listing.competition)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone={row.linkedIntentCount > 0 ? "info" : "neutral"}>
                        {row.linkedIntentCount} intents
                      </StatusBadge>
                      <StatusBadge tone={row.activeDealCount > 0 ? "warning" : "neutral"}>
                        {row.activeDealCount} live deals
                      </StatusBadge>
                    </div>
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
