import { PageHeader, Panel, Timeline } from "@/components/console-ui";
import { getConsoleData } from "@/lib/console-data";
import { shortDate } from "@/lib/formatters";

export default function NotificationsPage() {
  const data = getConsoleData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Notifications"
        title="Operational event feed"
        description="A clean timeline of seller replies, agent offers, and state changes without decorative filler."
      />

      <Panel title="Event stream" description="Most recent workspace events.">
        <Timeline
          items={data.notificationRows.map((row) => ({
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
