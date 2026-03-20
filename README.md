# Proxy

Proxy is a production-style MVP for an agent-native marketplace execution layer. Users define purchase intent once, autonomous agents continuously negotiate on their behalf, and Proxy only earns revenue when a deal successfully settles.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Supabase-ready client scaffolding
- Modular Node-style services for listings, negotiation, deals, and agent execution

## Local Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Included MVP Surfaces

- Intent registry via `POST /api/intents`
- Continuous agent execution via `POST /api/agents/run`
- Deal and activity feed via `GET /api/deals`
- Live dashboard snapshot via `GET /api/dashboard`
- Agent-centric dashboard with live polling and intent creation

## Service Architecture

- `src/services/listingService.ts`
  - abstracts listing ingestion with mock data today and real integrations later
- `src/services/negotiationService.ts`
  - generates offer messages, simulates seller outcomes, and tracks acceptance probability
- `src/services/dealService.ts`
  - calculates savings and transaction fees only on successful execution
- `src/services/agentService.ts`
  - runs the execution loop, advances negotiations, and composes dashboard state

## Supabase Readiness

The MVP ships with a lightweight client helper in `src/lib/supabase/client.ts`. To connect a real project, define:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Suggested tables for persistence:

### `intents`

- `id`
- `user_id`
- `item`
- `location`
- `max_price`
- `urgency`
- `flexibility`
- `status`

### `deals`

- `id`
- `intent_id`
- `listing_id`
- `current_offer`
- `status`
- `savings_amount`
- `transaction_fee`
- `created_at`

## Revenue Logic

On accepted settlement:

- `savings = asking_price - final_price`
- if `savings > 0`, `transaction_fee = savings * 0.10`
- otherwise, `transaction_fee = final_price * 0.02`

Proxy only recognizes revenue on successful deals.
