import { getStore } from "@/lib/store";
import { NextResponse } from "next/server";

export async function GET() {
  const store = getStore();
  return NextResponse.json({
    deals: store.deals,
    events: store.events,
  });
}
