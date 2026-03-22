import { EmptyState, KeyValueGrid, PageHeader, Panel, StatusBadge, TableShell } from "@/components/console-ui";
import { getConsoleData } from "@/lib/console-data";
import { toneForIntegration } from "@/lib/presentation";

export default function IntegrationsPage() {
  const data = getConsoleData();
  const configuredCount = data.integrationRows.filter((row) => row.status === "configured").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Integrations"
        title="Connectivity and system edges"
        description="What is truly connected today, what is still simulated, and what remains missing."
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Integration registry" description="Current system boundaries.">
          <TableShell>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[rgba(255,255,255,0.02)] text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Integration</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {data.integrationRows.map((row) => (
                  <tr key={row.name} className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-[var(--text-primary)]">{row.name}</div>
                      {row.value ? (
                        <div className="mt-1 text-xs text-[var(--text-muted)]">{row.value}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge tone={toneForIntegration(row.status)}>{row.status}</StatusBadge>
                    </td>
                    <td className="px-4 py-4 text-[var(--text-secondary)]">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </Panel>

        <Panel title="Integration notes" description="Current posture and next steps.">
          {configuredCount ? (
            <KeyValueGrid
              items={[
                {
                  label: "Configured today",
                  value: `${configuredCount} integration${configuredCount === 1 ? "" : "s"} have the required environment state.`,
                },
                {
                  label: "Current limitation",
                  value: "Listing ingestion and negotiation history still live in local memory and should move to a persistent backend.",
                },
                {
                  label: "Recommended next step",
                  value: "Persist intents, deals, and events before adding any more UI complexity.",
                },
                {
                  label: "Guardrail",
                  value: "Do not label anything as live market infrastructure until the underlying connector is real.",
                },
              ]}
            />
          ) : (
            <EmptyState
              title="No production integrations"
              description="The rebuilt console is honest about its edges: persistence and marketplace connectors are still waiting to be wired."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
