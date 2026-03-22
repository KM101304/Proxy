import { KeyValueGrid, PageHeader, Panel, StatusBadge, TableShell } from "@/components/console-ui";
import { getConsoleData } from "@/lib/console-data";
import { toneForUrgency } from "@/lib/presentation";

export default function PoliciesPage() {
  const data = getConsoleData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Policies"
        title="Execution policies"
        description="Intent-level governance for pricing movement, settlement authority, and agent operating style."
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Policy registry" description="The policy envelope wrapped around each active intent.">
          <TableShell>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[rgba(255,255,255,0.02)] text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Intent</th>
                  <th className="px-4 py-3 font-medium">Urgency</th>
                  <th className="px-4 py-3 font-medium">Mode</th>
                  <th className="px-4 py-3 font-medium">Guardrail</th>
                  <th className="px-4 py-3 font-medium">Escalation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {data.policyRows.map((row) => (
                  <tr key={row.intent.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-[var(--text-primary)]">{row.intent.item}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        {row.intent.location}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge tone={toneForUrgency(row.intent.urgency)}>
                        {row.intent.urgency}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-4 text-[var(--text-secondary)]">{row.operatingMode}</td>
                    <td className="px-4 py-4 text-[var(--text-secondary)]">{row.guardrailLabel}</td>
                    <td className="px-4 py-4 text-[var(--text-secondary)]">{row.escalationLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </Panel>

        <Panel title="Policy notes" description="How the current seed logic should be interpreted.">
          <KeyValueGrid
            items={[
              {
                label: "Current state",
                value: "Policies are evaluated in local memory, which is acceptable for the simulation layer but not for production execution.",
              },
              {
                label: "Direction",
                value: "Keep guardrails explicit, attach them to intents, and surface settlement authority in every detail view.",
              },
              {
                label: "Deletion rule",
                value: "No extra wrappers, fake approvals, or generic AI summaries should be added unless they create real operational value.",
              },
              {
                label: "Next step",
                value: "Persist these policies in a real store and attach audit logs before claiming production readiness.",
              },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}
