import Link from "next/link";
import { EmptyState, PageHeader, Panel, StatusBadge, TableShell, Timeline } from "@/components/console-ui";
import { getConsoleData } from "@/lib/console-data";
import { labelize, shortDate } from "@/lib/formatters";
import { toneForDealStatus } from "@/lib/presentation";
import { currency, percent } from "@/lib/utils";

export default function NegotiationsPage() {
  const data = getConsoleData();
  const escalations = data.dealRows.filter(
    ({ deal }) => deal.status === "close_to_accept" || deal.status === "expired",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Negotiations"
        title="Negotiation desk"
        description="The active execution queue. Quotes, counters, and stalls are visible in a table-first layout instead of a stack of decorative cards."
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="Live negotiation book"
          description="Every thread still moving through the price discovery loop."
        >
          {data.liveDeals.length ? (
            <TableShell>
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[rgba(255,255,255,0.02)] text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Intent</th>
                    <th className="px-4 py-3 font-medium">Quote</th>
                    <th className="px-4 py-3 font-medium">Counters</th>
                    <th className="px-4 py-3 font-medium">Confidence</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-soft)]">
                  {data.liveDeals.map((row) => (
                    <tr key={row.deal.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-medium text-[var(--text-primary)]">
                          {row.intent?.item ?? row.deal.id}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                          {row.listing?.title ?? "No listing"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[var(--text-primary)]">{currency(row.deal.current_offer)}</div>
                        <div className="mt-1 text-xs text-[var(--text-secondary)]">
                          Ask {row.listing ? currency(row.listing.price) : "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[var(--text-primary)]">
                        {row.deal.counters_received} seller counters
                        <div className="mt-1 text-xs text-[var(--text-secondary)]">
                          {row.deal.offers_sent} offers sent
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge tone={toneForDealStatus(row.deal.status)}>
                          {labelize(row.deal.status)}
                        </StatusBadge>
                        <div className="mt-2 text-xs text-[var(--text-secondary)]">
                          {percent(row.deal.acceptance_probability)} probability
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/deals/${row.deal.id}`} className="text-[var(--accent)] hover:text-[var(--text-primary)]">
                          Open thread
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          ) : (
            <EmptyState
              title="No live negotiations"
              description="Run a cycle or add an intent with viable supply coverage to start a thread."
            />
          )}
        </Panel>

        <Panel title="Escalations" description="Threads that need operator attention now.">
          <div className="space-y-3">
            {escalations.length ? (
              escalations.map((row) => (
                <div
                  key={row.deal.id}
                  className="rounded-2xl border border-[var(--border-soft)] bg-[var(--background-panel-soft)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-[var(--text-primary)]">
                      {row.intent?.item ?? row.deal.id}
                    </div>
                    <StatusBadge tone={toneForDealStatus(row.deal.status)}>
                      {labelize(row.deal.status)}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {row.deal.last_message ?? "No recent message."}
                  </p>
                  <div className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Updated {shortDate(row.deal.updated_at)}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No escalations"
                description="The current live book does not have near-close or expired threads that need intervention."
              />
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Thread activity" description="Recent counterparty events across the negotiation desk.">
        <Timeline
          items={data.notificationRows.slice(0, 10).map((row) => ({
            id: row.event.id,
            eyebrow: row.intent?.item ?? row.event.actor,
            title: `${row.event.actor} ${row.event.type}`,
            detail: row.event.message,
            meta: shortDate(row.event.created_at),
          }))}
        />
      </Panel>
    </div>
  );
}
