import { notFound } from "next/navigation";
import { KeyValueGrid, PageHeader, Panel, StatusBadge, Timeline } from "@/components/console-ui";
import { getDealDetail } from "@/lib/console-data";
import { labelize, shortDate } from "@/lib/formatters";
import { toneForDealStatus } from "@/lib/presentation";
import { currency, percent } from "@/lib/utils";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const { dealId } = await params;
  const row = getDealDetail(dealId);

  if (!row) {
    notFound();
  }

  const approvalRatio =
    row.intent && row.intent.max_price > 0 ? row.deal.current_offer / row.intent.max_price : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deal Detail"
        title={row.intent?.item ?? row.deal.id}
        description={
          row.listing
            ? `Negotiating against ${row.listing.title} in ${row.intent?.location ?? "the current market"}.`
            : "Inspect the pricing path and event history for this thread."
        }
        actions={
          <StatusBadge tone={toneForDealStatus(row.deal.status)}>{labelize(row.deal.status)}</StatusBadge>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Thread timeline" description="Recent event history for this deal.">
          <Timeline
            items={row.activity.map((event) => ({
              id: event.id,
              eyebrow: event.actor,
              title: `${event.type}${event.amount ? ` · ${currency(event.amount)}` : ""}`,
              detail: event.message,
              meta: shortDate(event.created_at),
            }))}
          />
        </Panel>

        <Panel title="Deal inspector" description="Pricing posture, spread, and operator guardrails.">
          <KeyValueGrid
            columns={2}
            items={[
              { label: "Current offer", value: currency(row.deal.current_offer) },
              { label: "Ask price", value: row.listing ? currency(row.listing.price) : "No listing" },
              { label: "Savings", value: currency(row.deal.savings_amount) },
              {
                label: "Acceptance probability",
                value: percent(row.deal.acceptance_probability),
              },
              {
                label: "Approval band",
                value: approvalRatio ? percent(approvalRatio) : "No intent ceiling",
              },
              {
                label: "Offers / counters",
                value: `${row.deal.offers_sent} / ${row.deal.counters_received}`,
              },
            ]}
          />

          <div className="mt-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--background-panel-soft)] p-4">
            <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Last message
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {row.deal.last_message ?? "No recent event message."}
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Execution context" description="Listing, policy, and settlement details.">
        <KeyValueGrid
          columns={3}
          items={[
            { label: "Listing", value: row.listing?.title ?? "No linked listing" },
            { label: "Listing URL", value: row.listing?.listing_url ?? "Unavailable" },
            { label: "Competition", value: row.listing ? percent(row.listing.competition) : "Unknown" },
            { label: "Intent urgency", value: row.intent ? labelize(row.intent.urgency) : "Unknown" },
            {
              label: "Instant close",
              value: row.intent?.agent_permissions.canCloseInstantly ? "Enabled" : "Disabled",
            },
            {
              label: "Updated",
              value: shortDate(row.deal.updated_at),
            },
          ]}
        />
      </Panel>
    </div>
  );
}
