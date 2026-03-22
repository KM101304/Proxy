# Proxy

Proxy is a rebuilt operational console for autonomous commerce execution. The current environment is intentionally honest about its limits: the UI now behaves like a routed command center, while the backend data layer still runs on seeded in-memory simulation services.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Local mock domain services for listings, negotiation, deals, and agent execution

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Product surfaces

- `/overview`
  - operator queue, live negotiation desk, and market posture
- `/intent-flow`
  - launch new intents and review guardrails
- `/matches`
  - supply coverage and price fit
- `/negotiations`
  - active negotiation book and escalations
- `/deals`
  - full deal registry with detail pages
- `/inventory`
  - listing inventory and demand linkage
- `/policies`
  - intent-level execution rules
- `/analytics`
  - restrained operational analytics for the current simulation
- `/integrations`
  - explicit integration readiness and gaps
- `/notifications`
  - timeline of event activity
- `/settings`
  - workspace mode and operating principles

## API routes

- `POST /api/intents`
  - create a new intent and seed its agent policy
- `POST /api/agents/run`
  - advance one execution cycle in the simulation
- `GET /api/dashboard`
  - retrieve the current snapshot
- `GET /api/deals`
  - retrieve deals and events

## Current honesty layer

- Listings are seeded from `src/lib/mock-data.ts`
- State is stored in-memory via `src/lib/store.ts`
- The console exposes manual cycle advancement instead of pretending the simulation is a live market feed

## Next backend steps

1. Persist intents, deals, events, and agent policies.
2. Replace seeded listings with real ingestion connectors.
3. Add authenticated operator actions and audit history.
4. Move settlement and approval rules into durable workflows.
