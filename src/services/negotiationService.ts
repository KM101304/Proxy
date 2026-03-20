import { clamp, roundCurrency } from "@/lib/utils";
import { AgentProfile, Deal, Intent, Listing, NegotiationEvent, Urgency } from "@/types/domain";

function urgencyModifier(urgency: Urgency) {
  if (urgency === "high") return 0.08;
  if (urgency === "medium") return 0.04;
  return 0;
}

function strategyModifier(strategy: AgentProfile["negotiation_strategy"]) {
  if (strategy === "aggressive") return -0.07;
  if (strategy === "conservative") return 0.04;
  return -0.02;
}

function createMessage(offer: number, intent: Intent) {
  const timing = intent.urgency === "high" ? "immediate settlement" : "pickup today";
  return `Execution ready. I can close at $${offer} with ${timing}.`;
}

export const negotiationService = {
  generateOpeningOffer(intent: Intent, listing: Listing, agent: AgentProfile) {
    const agedDiscount = clamp(listing.age_of_listing / 100, 0.03, 0.14);
    const competitionPenalty = listing.competition * 0.08;
    const floorRate =
      1 -
      agedDiscount -
      urgencyModifier(intent.urgency) -
      strategyModifier(agent.negotiation_strategy) +
      competitionPenalty;

    const offer = roundCurrency(
      Math.min(intent.max_price, Math.max(listing.price * clamp(floorRate, 0.74, 0.98), listing.price * 0.65)),
    );

    return {
      amount: offer,
      message: createMessage(offer, intent),
    };
  },

  evaluateResponse(intent: Intent, listing: Listing, deal: Deal) {
    const offerRatio = deal.current_offer / listing.price;
    const agedBoost = clamp(listing.age_of_listing / 40, 0, 0.32);
    const urgencyBoost = urgencyModifier(intent.urgency);
    const competitionPenalty = listing.competition * 0.28;
    const acceptProbability = clamp(
      offerRatio - 0.62 + agedBoost + urgencyBoost - competitionPenalty,
      0.08,
      0.94,
    );

    if (acceptProbability > 0.78) {
      return {
        type: "accept" as const,
        probability: acceptProbability,
        amount: deal.current_offer,
        message: "Accepted. Seller is ready to settle at the current offer.",
      };
    }

    if (acceptProbability > 0.46) {
      const counterAmount = roundCurrency((listing.price + deal.current_offer) / 2);
      return {
        type: "counter" as const,
        probability: acceptProbability,
        amount: Math.min(counterAmount, intent.max_price),
        message: `Counter received at $${Math.min(counterAmount, intent.max_price)}.`,
      };
    }

    return {
      type: "reject" as const,
      probability: acceptProbability,
      amount: undefined,
      message: "Seller rejected the offer and needs stronger pricing to continue.",
    };
  },

  createEvent(dealId: string, type: NegotiationEvent["type"], actor: NegotiationEvent["actor"], message: string, amount?: number): NegotiationEvent {
    return {
      id: `event-${Math.random().toString(36).slice(2, 10)}`,
      deal_id: dealId,
      type,
      actor,
      message,
      amount,
      created_at: new Date().toISOString(),
    };
  },
};
