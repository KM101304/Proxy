"use client";

import { currency, percent } from "@/lib/utils";
import { DashboardSnapshot, Urgency } from "@/types/domain";
import {
  Activity,
  ArrowRight,
  BadgeDollarSign,
  BrainCircuit,
  CircleDot,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const urgencyAccent: Record<Urgency, string> = {
  low: "from-cyan-400/60 to-emerald-300/30",
  medium: "from-sky-400/60 to-violet-300/30",
  high: "from-amber-300/60 to-rose-400/40",
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</div>
    </div>
  );
}

export function Dashboard({ initialSnapshot }: { initialSnapshot: DashboardSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      await fetch("/api/agents/run", { method: "POST" });
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const nextSnapshot = (await response.json()) as DashboardSnapshot;
      setSnapshot(nextSnapshot);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);

    const response = await fetch("/api/intents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item: formData.get("item"),
        location: formData.get("location"),
        max_price: Number(formData.get("max_price")),
        urgency: formData.get("urgency"),
        flexibility: Number(formData.get("flexibility")),
        agent_permissions: {
          canIncreaseOffer: true,
          canCloseInstantly: formData.get("close_instantly") === "on",
        },
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { snapshot: DashboardSnapshot };
    setSnapshot(payload.snapshot);
    event.currentTarget.reset();
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.18),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] p-7 shadow-2xl shadow-sky-950/30">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-sky-100">
                <Sparkles className="h-3.5 w-3.5" />
                Agent execution layer
              </div>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
                Purchase intent turns into continuous market execution.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Proxy deploys autonomous agents that scan, negotiate, and settle within
                your rules. You define the ceiling once. Execution keeps moving in the
                background.
              </p>
            </div>
            <div className="hidden rounded-[28px] border border-white/10 bg-white/5 p-4 text-right lg:block">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Generated
              </div>
              <div className="mt-2 text-lg font-medium text-white">
                {new Date(snapshot.generatedAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active Agents" value={String(snapshot.stats.activeAgents)} icon={BrainCircuit} />
            <StatCard label="Negotiations Live" value={String(snapshot.stats.negotiationsLive)} icon={Radar} />
            <StatCard label="Accepted Deals" value={String(snapshot.stats.acceptedDeals)} icon={ShieldCheck} />
            <StatCard label="Execution Revenue" value={currency(snapshot.stats.executionRevenue)} icon={BadgeDollarSign} />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[36px] border border-white/10 bg-white/6 p-6 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 text-white">
            <CircleDot className="h-5 w-5 text-cyan-300" />
            <div>
              <h2 className="text-lg font-semibold">Launch a new intent</h2>
              <p className="text-sm text-slate-400">Create the rule set once. A fresh agent starts immediately.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm text-slate-300">
              Item
              <input name="item" required className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-300/40" placeholder="Sony A7 IV body" />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">
              Location
              <input name="location" required className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-300/40" placeholder="Austin" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                Max price
                <input name="max_price" type="number" min="1" required className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-300/40" placeholder="1800" />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Flexibility %
                <input name="flexibility" type="number" min="0" max="50" defaultValue="10" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-300/40" />
              </label>
            </div>
            <label className="grid gap-2 text-sm text-slate-300">
              Urgency
              <select name="urgency" defaultValue="medium" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-300/40">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
              <input name="close_instantly" type="checkbox" className="h-4 w-4 rounded border-white/20 bg-slate-900" />
              Allow immediate settlement if pricing falls inside approved rules
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-200 disabled:opacity-70"
          >
            {isSubmitting ? "Deploying agent..." : "Deploy intent"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[36px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Agent field</h2>
              <p className="mt-1 text-sm text-slate-400">
                Bubble size increases as a deal approaches settlement.
              </p>
            </div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Live every 4s
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {snapshot.agents.map(({ intent, bestDeal, bestListing, estimatedSavings, completionScore, activity }) => {
              const bubbleSize = 180 + completionScore * 90;
              const belowAsk = bestListing ? Math.max(0, (bestListing.price - (bestDeal?.current_offer ?? bestListing.price)) / bestListing.price) : 0;

              return (
                <article
                  key={intent.id}
                  className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/70 p-5"
                >
                  <div className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${urgencyAccent[intent.urgency]} blur-3xl transition duration-700 group-hover:opacity-90`} />
                  <div
                    className="pointer-events-none absolute right-[-1rem] top-[-1rem] rounded-full border border-white/10 bg-white/7 shadow-[0_0_80px_rgba(125,211,252,0.14)] animate-[pulse_5s_ease-in-out_infinite]"
                    style={{ width: bubbleSize, height: bubbleSize }}
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{intent.location}</div>
                        <h3 className="mt-2 max-w-[18rem] text-2xl font-semibold tracking-tight text-white">
                          {intent.item}
                        </h3>
                      </div>
                      <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                        {bestDeal?.status ?? "searching"}
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                        <div className="text-slate-500">Current best deal</div>
                        <div className="mt-2 text-lg font-medium text-white">
                          {bestDeal ? currency(bestDeal.current_offer) : "Scanning"}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                        <div className="text-slate-500">Below asking</div>
                        <div className="mt-2 text-lg font-medium text-white">{percent(belowAsk)}</div>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                        <div className="text-slate-500">Estimated savings</div>
                        <div className="mt-2 text-lg font-medium text-white">{currency(estimatedSavings)}</div>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                        <div className="text-slate-500">Execution confidence</div>
                        <div className="mt-2 text-lg font-medium text-white">{percent(completionScore)}</div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-slate-500">
                        <span>Negotiation stream</span>
                        <span>{bestListing?.title ?? "Awaiting listing"}</span>
                      </div>
                      <div className="space-y-2">
                        {activity.length ? (
                          activity.map((event) => (
                            <div key={event.id} className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-sm text-slate-300">
                              {event.message}
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-white/10 px-3 py-4 text-sm text-slate-500">
                            Agent is scanning local supply and preparing the first execution path.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="rounded-[36px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">Settlement log</h2>
          <p className="mt-1 text-sm text-slate-400">
            Revenue only appears when execution successfully closes.
          </p>

          <div className="mt-6 space-y-3">
            {snapshot.recentActivity.map((event) => (
              <div key={event.id} className="rounded-[24px] border border-white/8 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  <span>{event.actor}</span>
                  <span>{new Date(event.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-200">{event.message}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
