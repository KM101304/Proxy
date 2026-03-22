import { getStore } from "@/lib/store";
import { logger } from "@/lib/logger";
import { clamp, roundCurrency } from "@/lib/utils";
import { dealService } from "@/services/dealService";
import { listingService } from "@/services/listingService";
import { negotiationService } from "@/services/negotiationService";
import { AgentProfile, DashboardSnapshot, Deal, Intent, Listing } from "@/types/domain";

function maybeCreateDeal(intent: Intent, agent: AgentProfile, listing: Listing) {
  const store = getStore();
  const existing = store.deals.find(
    (deal) => deal.intent_id === intent.id && deal.listing_id === listing.id && deal.status !== "expired",
  );

  if (existing) {
    return existing;
  }

  const opening = negotiationService.generateOpeningOffer(intent, listing, agent);
  const createdAt = new Date().toISOString();

  const deal: Deal = {
    id: `deal-${Math.random().toString(36).slice(2, 10)}`,
    intent_id: intent.id,
    listing_id: listing.id,
    current_offer: opening.amount,
    status: "negotiating",
    savings_amount: roundCurrency(Math.max(0, listing.price - opening.amount)),
    transaction_fee: 0,
    created_at: createdAt,
    updated_at: createdAt,
    offers_sent: 1,
    counters_received: 0,
    acceptance_probability: 0.35,
    last_message: opening.message,
  };

  store.deals.push(deal);
  store.events.unshift(
    negotiationService.createEvent(deal.id, "offer", "agent", opening.message, opening.amount),
  );

  return deal;
}

function continueDeal(intent: Intent, agent: AgentProfile, listing: Listing, deal: Deal) {
  const store = getStore();
  if (deal.status === "accepted" || deal.status === "expired") {
    return deal;
  }

  const response = negotiationService.evaluateResponse(intent, listing, deal);
  deal.updated_at = new Date().toISOString();
  deal.acceptance_probability = response.probability;

  if (response.type === "accept") {
    const accepted = dealService.updateAcceptedDeal(deal, listing.price, deal.current_offer);
    accepted.last_message = response.message;
    Object.assign(deal, accepted);
    store.events.unshift(
      negotiationService.createEvent(deal.id, "accept", "seller", response.message, deal.current_offer),
    );
    intent.status = "completed";
    agent.best_deal_id = deal.id;
    return deal;
  }

  if (response.type === "counter" && response.amount) {
    deal.status = response.probability > 0.62 ? "close_to_accept" : "negotiating";
    deal.counters_received += 1;
    deal.last_message = response.message;
    store.events.unshift(
      negotiationService.createEvent(deal.id, "counter", "seller", response.message, response.amount),
    );

    if (intent.agent_permissions.canIncreaseOffer) {
      const nextOffer = roundCurrency(
        Math.min(
          intent.max_price,
          deal.current_offer + Math.max(25, (response.amount - deal.current_offer) * 0.6),
        ),
      );

      if (nextOffer > deal.current_offer) {
        deal.current_offer = nextOffer;
        deal.offers_sent += 1;
        deal.savings_amount = roundCurrency(Math.max(0, listing.price - nextOffer));
        deal.last_message = `Agent advanced execution to $${nextOffer}.`;
        store.events.unshift(
          negotiationService.createEvent(
            deal.id,
            "offer",
            "agent",
            `Execution updated. I can settle at $${nextOffer} if we close now.`,
            nextOffer,
          ),
        );
      } else if (deal.status === "close_to_accept" && intent.agent_permissions.canCloseInstantly) {
        const accepted = dealService.updateAcceptedDeal(deal, listing.price, deal.current_offer);
        accepted.last_message = "Seller aligned inside the approval band.";
        Object.assign(deal, accepted);
        store.events.unshift(
          negotiationService.createEvent(
            deal.id,
            "accept",
            "seller",
            "Seller aligned inside the approval band.",
            deal.current_offer,
          ),
        );
        intent.status = "completed";
        agent.best_deal_id = deal.id;
      }
    }

    return deal;
  }

  deal.status = deal.offers_sent > 2 ? "expired" : "searching";
  deal.last_message = response.message;
  store.events.unshift(
    negotiationService.createEvent(deal.id, "reject", "seller", response.message),
  );

  if (deal.status !== "expired" && intent.agent_permissions.canIncreaseOffer) {
    const retryOffer = roundCurrency(
      Math.min(intent.max_price, deal.current_offer + clamp(intent.max_price * 0.03, 30, 95)),
    );

    if (retryOffer > deal.current_offer) {
      deal.current_offer = retryOffer;
      deal.offers_sent += 1;
      deal.status = "negotiating";
      deal.savings_amount = roundCurrency(Math.max(0, listing.price - retryOffer));
      deal.last_message = `Agent re-entered negotiation at $${retryOffer}.`;
      store.events.unshift(
        negotiationService.createEvent(
          deal.id,
          "offer",
          "agent",
          `Updated execution path: $${retryOffer} with flexible pickup.`,
          retryOffer,
        ),
      );
    }
  }

  return deal;
}

export const agentService = {
  runCycle() {
    const store = getStore();
    const now = new Date();
    const activeIntents = store.intents.filter((intent) => intent.status === "active");

    for (const intent of activeIntents) {
      const agent = store.agents.find((candidate) => candidate.intent_id === intent.id);
      if (!agent) continue;
      agent.actions_taken_today = Math.min(agent.actions_taken_today, agent.max_actions_per_day);

      if (agent.actions_taken_today >= agent.max_actions_per_day) {
        continue;
      }

      const matches = listingService.findMatches(intent);
      const selected = matches[0];
      if (!selected) continue;

      const lastActionAt = agent.last_action_at ? new Date(agent.last_action_at) : undefined;
      const secondsSinceLastAction = lastActionAt
        ? (now.getTime() - lastActionAt.getTime()) / 1000
        : agent.timing_interval;

      if (secondsSinceLastAction < agent.timing_interval) {
        continue;
      }

      const deal = maybeCreateDeal(intent, agent, selected);
      continueDeal(intent, agent, selected, deal);
      agent.last_action_at = now.toISOString();
      agent.actions_taken_today += 1;
      agent.best_deal_id = deal.id;
      logger.info("Agent cycle completed", {
        agentId: agent.intent_id,
        dealId: deal.id,
        dealStatus: deal.status,
      });
    }

    store.lastRunAt = now.toISOString();
    store.events = store.events.slice(0, 80);

    return this.getDashboardSnapshot();
  },

  getDashboardSnapshot(): DashboardSnapshot {
    const store = getStore();

    const agents = store.intents.map((intent) => {
      const agent = store.agents.find((candidate) => candidate.intent_id === intent.id)!;
      const bestDeal =
        store.deals
          .filter((deal) => deal.intent_id === intent.id)
          .sort((a, b) => b.acceptance_probability - a.acceptance_probability)[0] ?? null;
      const bestListing =
        bestDeal ? store.listings.find((listing) => listing.id === bestDeal.listing_id) ?? null : null;
      const activity = bestDeal
        ? store.events.filter((event) => event.deal_id === bestDeal.id).slice(0, 4)
        : [];
      const estimatedSavings = bestDeal?.savings_amount ?? 0;
      const completionScore = clamp(bestDeal?.acceptance_probability ?? 0.12, 0.08, 1);

      return {
        intent,
        agent: {
          ...agent,
          actions_taken_today: Math.min(agent.actions_taken_today, agent.max_actions_per_day),
        },
        bestDeal,
        bestListing,
        activity,
        estimatedSavings,
        completionScore,
      };
    });

    const acceptedDeals = store.deals.filter((deal) => deal.status === "accepted");

    return {
      generatedAt: new Date().toISOString(),
      stats: {
        activeAgents: store.intents.filter((intent) => intent.status === "active").length,
        negotiationsLive: store.deals.filter((deal) =>
          deal.status === "negotiating" || deal.status === "close_to_accept",
        ).length,
        acceptedDeals: acceptedDeals.length,
        capturedSavings: roundCurrency(
          acceptedDeals.reduce((sum, deal) => sum + deal.savings_amount, 0),
        ),
        executionRevenue: roundCurrency(
          acceptedDeals.reduce((sum, deal) => sum + deal.transaction_fee, 0),
        ),
      },
      agents,
      recentActivity: store.events.slice(0, 8),
    };
  },
};
