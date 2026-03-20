import { logger } from "@/lib/logger";
import { withRetry } from "@/lib/retry";
import { agentService } from "@/services/agentService";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const snapshot = await withRetry(() => agentService.runCycle());
    logger.info("Agent cycle completed", {
      activeAgents: snapshot.stats.activeAgents,
      negotiationsLive: snapshot.stats.negotiationsLive,
    });
    return NextResponse.json({ ran: true, snapshot });
  } catch (error) {
    logger.error("Failed to run agents", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ error: "Unable to run agents." }, { status: 500 });
  }
}
