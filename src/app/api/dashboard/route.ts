import { logger } from "@/lib/logger";
import { withRetry } from "@/lib/retry";
import { agentService } from "@/services/agentService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json(await withRetry(() => agentService.getDashboardSnapshot()));
  } catch (error) {
    logger.error("Failed to load dashboard", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ error: "Unable to load dashboard." }, { status: 500 });
  }
}
