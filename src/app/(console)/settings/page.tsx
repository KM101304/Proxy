import { KeyValueGrid, PageHeader, Panel } from "@/components/console-ui";
import { getConsoleData } from "@/lib/console-data";
import { shortDate, shortTime } from "@/lib/formatters";

export default function SettingsPage() {
  const data = getConsoleData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Current environment state, product constraints, and the operating principles behind this rebuild."
      />

      <Panel title="Workspace profile" description="What this environment is doing right now.">
        <KeyValueGrid
          columns={2}
          items={[
            { label: "Mode", value: "Simulation" },
            { label: "Last cycle", value: shortTime(data.lastRunAt) },
            { label: "Snapshot", value: shortDate(data.snapshot.generatedAt) },
            { label: "Route structure", value: "Multi-surface operational console" },
          ]}
        />
      </Panel>

      <Panel title="Operating principles" description="What the rebuild is optimizing for.">
        <KeyValueGrid
          columns={2}
          items={[
            {
              label: "Design rule",
              value: "Favor dense, readable operational surfaces over oversized hero cards and fake AI theater.",
            },
            {
              label: "Architecture rule",
              value: "Keep domain logic where it helps, but delete dead wrappers and avoid one-file frontend architecture.",
            },
            {
              label: "Product rule",
              value: "Only ship surfaces that answer real operating questions for the user right now.",
            },
            {
              label: "Trust rule",
              value: "Be explicit when data is mocked, simulated, delayed, or not yet wired to a real market.",
            },
          ]}
        />
      </Panel>
    </div>
  );
}
