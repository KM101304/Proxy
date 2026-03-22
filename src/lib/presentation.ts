import { IntentRow, IntegrationRow } from "@/lib/console-data";
import { DealStatus, Urgency } from "@/types/domain";

export function toneForUrgency(urgency: Urgency) {
  if (urgency === "high") return "danger" as const;
  if (urgency === "medium") return "warning" as const;
  return "neutral" as const;
}

export function toneForDealStatus(status?: DealStatus | null) {
  if (status === "accepted") return "success" as const;
  if (status === "close_to_accept") return "warning" as const;
  if (status === "negotiating") return "info" as const;
  if (status === "expired") return "danger" as const;
  return "neutral" as const;
}

export function toneForOperationalState(state: IntentRow["operationalState"]) {
  if (state === "ready") return "warning" as const;
  if (state === "needs-coverage") return "danger" as const;
  if (state === "stalled") return "danger" as const;
  return "info" as const;
}

export function toneForIntegration(status: IntegrationRow["status"]) {
  if (status === "configured") return "success" as const;
  if (status === "available") return "info" as const;
  if (status === "simulation") return "warning" as const;
  return "danger" as const;
}
