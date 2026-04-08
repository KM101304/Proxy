import { AgentProfile, Deal, Intent, Listing, NegotiationEvent } from "@/types/domain";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export const negotiationService = {
  async generateOpeningOffer(intent: Intent, listing: Listing, agent: AgentProfile) {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      system: `You are an AI purchasing agent acting on behalf of a buyer.
Your goal is to negotiate the best possible price for an item.
Buyer Intent:
- Item: ${intent.item}
- Max Price: $${intent.max_price}
- Urgency: ${intent.urgency}
- Flexibility: ${intent.flexibility}/10

Agent Strategy: ${agent.negotiation_strategy}

Listing Details:
- Title: ${listing.title}
- Listed Price: $${listing.price}
- Location: ${listing.location}
- Age: ${listing.age_of_listing} days
- Competition Activity: ${listing.competition}/10`,
      prompt: "Formulate an opening offer that is below the listing price but reasonable enough not to be immediately rejected. Consider your strategy, urgency, and the listing's age. Provide a short, persuasive message to the seller to accompany the offer.",
      schema: z.object({
        amount: z.number().describe("The opening offer amount in dollars"),
        message: z.string().describe("The message to send to the seller (keep it concise and professional)"),
      }),
    });

    return object;
  },

  async evaluateResponse(intent: Intent, listing: Listing, deal: Deal) {
    const historyContext = `Initial Offer: $${deal.current_offer}\nOffers sent: ${deal.offers_sent}\nCounters received: ${deal.counters_received}\nLast Message: "${deal.last_message || ''}"`;

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      system: `You are simulating a human seller on a marketplace (like Craigslist or FB Marketplace).
You are selling: ${listing.title} for $${listing.price}.
The listing has been active for ${listing.age_of_listing} days. The competition score is ${listing.competition}/10.

A buyer's AI agent has made an offer.
${historyContext}`,
      prompt: `Evaluate the offer. Will you accept, counter, or reject?
- If the offer is very close to your list price or your listing is old, you might accept.
- If it's somewhat low, you might counter.
- If it's an insulting lowball, you might reject.

Provide your decision, a counter amount (if countering), a short message responding to the agent, and a probability score (0.0 to 1.0) indicating how close you are to accepting.`,
      schema: z.object({
        type: z.enum(["accept", "counter", "reject"]),
        amount: z.number().nullable().describe("The counter-offer amount in dollars (if type is 'counter', otherwise null)"),
        message: z.string().describe("Your response message to the buyer's agent"),
        probability: z.number().describe("A score from 0.0 to 1.0 indicating likelihood of reaching a deal"),
      }),
    });

    return object;
  },

  async generateAgentCounterOffer(intent: Intent, listing: Listing, agent: AgentProfile, deal: Deal, sellerAmount?: number, sellerMessage?: string) {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      system: `You are an AI purchasing agent negotiating for a buyer.
Item: ${intent.item} (Max Budget: $${intent.max_price})
Agent Permissions:
- Can Negotiate: ${intent.agent_permissions.canNegotiate}
- Can Increase Offer: ${intent.agent_permissions.canIncreaseOffer}
- Can Close Instantly: ${intent.agent_permissions.canCloseInstantly}

Current Deal State:
- Your Previous Offer: $${deal.current_offer}
- Offers Sent: ${deal.offers_sent}

The Seller responded:
- Message: "${sellerMessage || ''}"
- Seller Counter Offer Amount: ${sellerAmount ? '$' + sellerAmount : 'None'}`,
      prompt: `Decide your next move:
- "increase": to make a higher counter-offer (must be <= max budget).
- "accept": if the seller's counter is acceptable and within your max budget, and you have permission to close.
- "hold": to maintain your current offer.
- "walk_away": if the seller is demanding too much and won't budge.

Provide your decision, the new amount (if increasing or accepting), and a short message to the seller.`,
      schema: z.object({
        action: z.enum(["increase", "accept", "hold", "walk_away"]),
        amount: z.number().nullable().describe("The new explicit offer or accepted amount (otherwise null)"),
        message: z.string().describe("Your message to the seller"),
      }),
    });

    return object;
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
