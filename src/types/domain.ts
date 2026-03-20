export type Urgency = "low" | "medium" | "high";
export type NegotiationStrategy = "aggressive" | "balanced" | "conservative";
export type DealStatus =
  | "searching"
  | "negotiating"
  | "close_to_accept"
  | "accepted"
  | "expired";
export type IntentStatus = "active" | "paused" | "completed";

export interface AgentPermissions {
  canNegotiate: boolean;
  canIncreaseOffer: boolean;
  canCloseInstantly: boolean;
}

export interface Intent {
  id: string;
  user_id: string;
  item: string;
  location: string;
  max_price: number;
  urgency: Urgency;
  flexibility: number;
  agent_permissions: AgentPermissions;
  status: IntentStatus;
  created_at: string;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  age_of_listing: number;
  seller_id: string;
  listing_url: string;
  competition: number;
  category: string;
}

export interface NegotiationEvent {
  id: string;
  deal_id: string;
  type: "offer" | "counter" | "accept" | "reject" | "status";
  actor: "agent" | "seller" | "system";
  message: string;
  amount?: number;
  created_at: string;
}

export interface Deal {
  id: string;
  intent_id: string;
  listing_id: string;
  current_offer: number;
  status: DealStatus;
  savings_amount: number;
  transaction_fee: number;
  created_at: string;
  updated_at: string;
  offers_sent: number;
  counters_received: number;
  acceptance_probability: number;
  final_price?: number;
  last_message?: string;
}

export interface AgentProfile {
  intent_id: string;
  negotiation_strategy: NegotiationStrategy;
  price_curve: "start_low" | "steady" | "urgent";
  timing_interval: number;
  max_actions_per_day: number;
  actions_taken_today: number;
  best_deal_id?: string;
  last_action_at?: string;
}

export interface DashboardAgent {
  intent: Intent;
  agent: AgentProfile;
  bestDeal: Deal | null;
  bestListing: Listing | null;
  activity: NegotiationEvent[];
  estimatedSavings: number;
  completionScore: number;
}

export interface DashboardSnapshot {
  generatedAt: string;
  stats: {
    activeAgents: number;
    negotiationsLive: number;
    acceptedDeals: number;
    capturedSavings: number;
    executionRevenue: number;
  };
  agents: DashboardAgent[];
  recentActivity: NegotiationEvent[];
}
