import { getStore } from "@/lib/store";
import { clamp } from "@/lib/utils";
import { agentService } from "@/services/agentService";
import { listingService } from "@/services/listingService";
import {
  AgentProfile,
  DashboardSnapshot,
  Deal,
  Intent,
  Listing,
  NegotiationEvent,
} from "@/types/domain";

export interface IntentRow {
  intent: Intent;
  agent: AgentProfile;
  bestDeal: Deal | null;
  bestListing: Listing | null;
  activity: NegotiationEvent[];
  matches: Listing[];
  matchCount: number;
  budgetGap: number | null;
  operationalState: "monitor" | "needs-coverage" | "ready" | "stalled";
}

export interface MatchRow {
  intent: Intent;
  agent: AgentProfile;
  listing: Listing;
  score: number;
  priceGap: number;
}

export interface DealRow {
  deal: Deal;
  intent: Intent | null;
  listing: Listing | null;
  activity: NegotiationEvent[];
  spreadToAsk: number | null;
}

export interface NotificationRow {
  event: NegotiationEvent;
  deal: Deal | null;
  intent: Intent | null;
  listing: Listing | null;
}

export interface InventoryRow {
  listing: Listing;
  linkedIntentCount: number;
  activeDealCount: number;
}

export interface PolicyRow {
  intent: Intent;
  agent: AgentProfile;
  operatingMode: string;
  guardrailLabel: string;
  escalationLabel: string;
}

export interface IntegrationRow {
  name: string;
  status: "configured" | "simulation" | "available" | "missing";
  detail: string;
  value?: string;
}

export interface ConsoleData {
  snapshot: DashboardSnapshot;
  lastRunAt?: string;
  intentRows: IntentRow[];
  matchRows: MatchRow[];
  dealRows: DealRow[];
  notificationRows: NotificationRow[];
  inventoryRows: InventoryRow[];
  policyRows: PolicyRow[];
  integrationRows: IntegrationRow[];
  liveDeals: DealRow[];
  settledDeals: DealRow[];
  stalledDeals: DealRow[];
}

function intentPriority(intent: Intent) {
  if (intent.urgency === "high") return 3;
  if (intent.urgency === "medium") return 2;
  return 1;
}

function calculateMatchScore(intent: Intent, listing: Listing) {
  const priceDelta = Math.abs(listing.price - intent.max_price) / intent.max_price;
  const ageBoost = clamp(listing.age_of_listing / 40, 0.02, 0.3);
  const competitionPenalty = listing.competition * 0.35;

  return clamp(1 - priceDelta * 0.62 + ageBoost - competitionPenalty, 0.08, 0.98);
}

function getOperationalState(bestDeal: Deal | null, bestListing: Listing | null): IntentRow["operationalState"] {
  if (!bestListing) return "needs-coverage";
  if (!bestDeal) return "monitor";
  if (bestDeal.status === "close_to_accept" || bestDeal.status === "accepted") return "ready";
  if (bestDeal.status === "expired") return "stalled";
  return "monitor";
}

export function getConsoleData(): ConsoleData {
  const snapshot = agentService.getDashboardSnapshot();
  const store = getStore();

  const listingById = new Map(store.listings.map((listing) => [listing.id, listing]));
  const intentById = new Map(store.intents.map((intent) => [intent.id, intent]));
  const dealById = new Map(store.deals.map((deal) => [deal.id, deal]));

  const intentRows = snapshot.agents
    .map((item) => {
      const matches = listingService.findMatches(item.intent);

      return {
        ...item,
        matches,
        matchCount: matches.length,
        budgetGap: item.bestListing ? item.bestListing.price - item.intent.max_price : null,
        operationalState: getOperationalState(item.bestDeal, item.bestListing),
      };
    })
    .sort((left, right) => {
      return (
        intentPriority(right.intent) - intentPriority(left.intent) ||
        Number(right.bestDeal?.acceptance_probability ?? 0) -
          Number(left.bestDeal?.acceptance_probability ?? 0)
      );
    });

  const matchRows = intentRows.flatMap(({ intent, agent, matches }) =>
    matches.slice(0, 4).map((listing) => ({
      intent,
      agent,
      listing,
      score: calculateMatchScore(intent, listing),
      priceGap: listing.price - intent.max_price,
    })),
  );

  const dealRows = store.deals
    .map((deal) => {
      const listing = listingById.get(deal.listing_id) ?? null;
      const intent = intentById.get(deal.intent_id) ?? null;

      return {
        deal,
        listing,
        intent,
        activity: store.events.filter((event) => event.deal_id === deal.id).slice(0, 8),
        spreadToAsk: listing ? listing.price - deal.current_offer : null,
      };
    })
    .sort((left, right) => {
      return (
        new Date(right.deal.updated_at).getTime() - new Date(left.deal.updated_at).getTime() ||
        new Date(right.deal.created_at).getTime() - new Date(left.deal.created_at).getTime()
      );
    });

  const notificationRows = store.events.slice(0, 24).map((event) => {
    const deal = dealById.get(event.deal_id) ?? null;
    const listing = deal ? (listingById.get(deal.listing_id) ?? null) : null;
    const intent = deal ? (intentById.get(deal.intent_id) ?? null) : null;

    return { event, deal, listing, intent };
  });

  const inventoryRows = store.listings
    .map((listing) => ({
      listing,
      linkedIntentCount: store.intents.filter((intent) =>
        listingService.findMatches(intent).some((match) => match.id === listing.id),
      ).length,
      activeDealCount: store.deals.filter(
        (deal) => deal.listing_id === listing.id && deal.status !== "expired",
      ).length,
    }))
    .sort((left, right) => left.listing.price - right.listing.price);

  const policyRows = intentRows.map(({ intent, agent }) => ({
    intent,
    agent,
    operatingMode:
      agent.price_curve === "urgent"
        ? "Tight approval band"
        : agent.price_curve === "start_low"
          ? "Price discovery"
          : "Measured pursuit",
    guardrailLabel: intent.agent_permissions.canIncreaseOffer
      ? "Auto-advance offers"
      : "Manual escalation only",
    escalationLabel: intent.agent_permissions.canCloseInstantly
      ? "Can settle inside band"
      : "Escalate before close",
  }));

  const integrationRows: IntegrationRow[] = [
    {
      name: "Supabase",
      status:
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? "configured"
          : "missing",
      detail:
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? "Environment variables are present for a browser client."
          : "No browser persistence is configured yet.",
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
    {
      name: "Market ingestion",
      status: "simulation",
      detail: "Listings are currently seeded from local mock inventory.",
    },
    {
      name: "Agent runner",
      status: "available",
      detail: "Execution cycles can be advanced from the shell or via POST /api/agents/run.",
    },
  ];

  return {
    snapshot,
    lastRunAt: store.lastRunAt,
    intentRows,
    matchRows,
    dealRows,
    notificationRows,
    inventoryRows,
    policyRows,
    integrationRows,
    liveDeals: dealRows.filter(
      ({ deal }) => deal.status === "negotiating" || deal.status === "close_to_accept",
    ),
    settledDeals: dealRows.filter(({ deal }) => deal.status === "accepted"),
    stalledDeals: dealRows.filter(({ deal }) => deal.status === "expired"),
  };
}

export function getDealDetail(dealId: string) {
  return getConsoleData().dealRows.find(({ deal }) => deal.id === dealId) ?? null;
}
