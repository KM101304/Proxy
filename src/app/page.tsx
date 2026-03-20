import { Dashboard } from "@/components/dashboard";
import { agentService } from "@/services/agentService";

export const dynamic = "force-dynamic";

export default function Home() {
  const snapshot = agentService.getDashboardSnapshot();

  return <Dashboard initialSnapshot={snapshot} />;
}
