import { LaunchIntentForm } from "@/components/launch-intent-form";
import {
  EmptyState,
  KeyValueGrid,
  PageHeader,
  Panel,
  StatusBadge,
  TableShell,
} from "@/components/console-ui";
import { getConsoleData } from "@/lib/console-data";
import { labelize, shortDate } from "@/lib/formatters";
import { toneForDealStatus, toneForOperationalState, toneForUrgency } from "@/lib/presentation";
import { currency } from "@/lib/utils";

export default function IntentFlowPage() {
  const data = getConsoleData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intent Flow"
        title="Launch and govern buyer intent"
        description="Create a new buying mandate, set the negotiation envelope, and review how each live intent maps to supply and execution."
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel
          title="Launch mandate"
          description="Define the item, budget, and permissions that govern how the agent may negotiate."
        >
          <LaunchIntentForm />
        </Panel>

        <Panel
          title="Control posture"
          description="The desk exposes operating rules directly so the user can see what the system may and may not do."
        >
          <KeyValueGrid
            columns={2}
            items={[
              {
                label: "Runner mode",
                value: "Manual execution cycles keep the simulation honest while we preserve the mock domain layer.",
              },
              {
                label: "Price movement",
                value: "Offers can advance within the approved max budget when `canIncreaseOffer` is enabled.",
              },
              {
                label: "Settlement",
                value: "Immediate close is only allowed if the intent explicitly permits it.",
              },
              {
                label: "Coverage gap",
                value: "Intents with no candidate listings stay visible instead of being hidden behind fake activity.",
              },
            ]}
          />
        </Panel>
      </div>

      <Panel
        title="Intent registry"
        description="Every active objective, its current posture, and the policy envelope operating against it."
      >
        {data.intentRows.length ? (
          <TableShell>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[rgba(255,255,255,0.02)] text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Intent</th>
                  <th className="px-4 py-3 font-medium">Urgency</th>
                  <th className="px-4 py-3 font-medium">Budget</th>
                  <th className="px-4 py-3 font-medium">Coverage</th>
                  <th className="px-4 py-3 font-medium">Execution</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {data.intentRows.map((row) => (
                  <tr key={row.intent.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-[var(--text-primary)]">{row.intent.item}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        {row.intent.location}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge tone={toneForUrgency(row.intent.urgency)}>
                          {row.intent.urgency}
                        </StatusBadge>
                        <StatusBadge tone={toneForOperationalState(row.operationalState)}>
                          {labelize(row.operationalState)}
                        </StatusBadge>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[var(--text-primary)]">
                      <div>{currency(row.intent.max_price)}</div>
                      <div className="mt-1 text-xs text-[var(--text-secondary)]">
                        Flexibility {row.intent.flexibility}%
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[var(--text-secondary)]">
                      <div>{row.matchCount} listings</div>
                      <div className="mt-1 text-xs text-[var(--text-muted)]">
                        {row.bestListing ? row.bestListing.title : "No credible match yet"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge tone={toneForDealStatus(row.bestDeal?.status)}>
                          {labelize(row.bestDeal?.status ?? "searching")}
                        </StatusBadge>
                      </div>
                      <div className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                        {row.agent.negotiation_strategy} strategy.{" "}
                        {row.intent.agent_permissions.canCloseInstantly
                          ? "Can close instantly."
                          : "Escalates before close."}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[var(--text-secondary)]">
                      {shortDate(row.intent.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        ) : (
          <EmptyState
            title="No intents yet"
            description="Launch the first buyer mandate to start building the operating desk."
          />
        )}
      </Panel>
    </div>
  );
}
