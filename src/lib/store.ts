import {
  AgentProfile,
  Deal,
  Intent,
  Listing,
  NegotiationEvent,
} from "@/types/domain";
import { seedAgents, seedDeals, seedEvents, seedIntents, seedListings } from "@/lib/mock-data";

interface ProxyStore {
  intents: Intent[];
  agents: AgentProfile[];
  listings: Listing[];
  deals: Deal[];
  events: NegotiationEvent[];
  lastRunAt?: string;
}

declare global {
  var __proxyStore__: ProxyStore | undefined;
}

export function getStore(): ProxyStore {
  if (!globalThis.__proxyStore__) {
    globalThis.__proxyStore__ = {
      intents: structuredClone(seedIntents),
      agents: structuredClone(seedAgents),
      listings: structuredClone(seedListings),
      deals: structuredClone(seedDeals),
      events: structuredClone(seedEvents),
      lastRunAt: undefined,
    };
  }

  return globalThis.__proxyStore__;
}
