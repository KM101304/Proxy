import { getStore } from "@/lib/store";
import { logger } from "@/lib/logger";
import { withRetry } from "@/lib/retry";
import { titleToSlug } from "@/lib/utils";
import { agentService } from "@/services/agentService";
import { AgentProfile, Intent, Urgency } from "@/types/domain";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ intents: getStore().intents });
}

export async function POST(request: NextRequest) {
  try {
    const body = await withRetry(() => request.json());
    const item = String(body.item ?? "").trim();
    const location = String(body.location ?? "").trim();
    const maxPrice = Number(body.max_price);
    const urgency = String(body.urgency ?? "medium") as Urgency;
    const flexibility = Number(body.flexibility ?? 10);

    if (!item || !location || Number.isNaN(maxPrice) || maxPrice <= 0) {
      return NextResponse.json(
        { error: "item, location, and max_price are required." },
        { status: 400 },
      );
    }

    const intent: Intent = {
      id: `intent-${titleToSlug(item)}-${Math.random().toString(36).slice(2, 7)}`,
      user_id: "user-demo",
      item,
      location,
      max_price: maxPrice,
      urgency,
      flexibility,
      agent_permissions: {
        canNegotiate: true,
        canIncreaseOffer: body.agent_permissions?.canIncreaseOffer ?? true,
        canCloseInstantly: body.agent_permissions?.canCloseInstantly ?? false,
      },
      status: "active",
      created_at: new Date().toISOString(),
    };

    const strategy: AgentProfile["negotiation_strategy"] =
      urgency === "high" ? "aggressive" : urgency === "low" ? "conservative" : "balanced";

    const agent: AgentProfile = {
      intent_id: intent.id,
      negotiation_strategy: strategy,
      price_curve: urgency === "high" ? "urgent" : urgency === "low" ? "start_low" : "steady",
      timing_interval: urgency === "high" ? 3 : urgency === "low" ? 7 : 5,
      max_actions_per_day: urgency === "high" ? 24 : 14,
      actions_taken_today: 0,
    };

    const store = getStore();
    store.intents.unshift(intent);
    store.agents.unshift(agent);
    logger.info("Intent created", { intentId: intent.id, item, location });

    const snapshot = await agentService.runCycle();

    return NextResponse.json({ intent, agent, snapshot }, { status: 201 });
  } catch (error) {
    logger.error("Failed to create intent", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ error: "Unable to create intent." }, { status: 500 });
  }
}
