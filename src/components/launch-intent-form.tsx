"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Bot, ShieldAlert, Sparkles, Target, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

export function LaunchIntentForm() {
  const router = useRouter();
  const [isPending, startRefresh] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [urgency, setUrgency] = useState("medium");
  const [canIncrease, setCanIncrease] = useState(true);
  const [canClose, setCanClose] = useState(false);

  const isBusy = isSubmitting || isPending;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: formData.get("item"),
          location: formData.get("location"),
          max_price: Number(formData.get("max_price")),
          urgency,
          flexibility: Number(formData.get("flexibility")),
          agent_permissions: {
            canIncreaseOffer: canIncrease,
            canCloseInstantly: canClose,
          },
        }),
      });

      const payload = (await response.json()) as { error?: string; intent?: { item: string } };
      if (!response.ok) {
        setError(payload.error ?? "Unable to launch the intent.");
        return;
      }

      form.reset();
      setSuccess(`Agent successfully deployed for ${payload.intent?.item ?? "the new target"}.`);
      startRefresh(() => router.refresh());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(56,189,248,0.15)] border border-[rgba(56,189,248,0.3)] shadow-[0_0_10px_rgba(56,189,248,0.2)]">
          <Bot className="h-5 w-5 text-[var(--accent-strong)]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Agent Configuration</h2>
          <p className="text-xs text-[var(--text-secondary)]">Specify target and parameters for deployment</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="item" className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
            <Target className="h-3 w-3 text-[var(--accent)]" /> Target Item
          </label>
          <input
            id="item"
            name="item"
            required
            placeholder="e.g. Brompton folding bike"
            className="rounded-xl border border-[var(--border-strong)] bg-[rgba(15,23,42,0.6)] px-4 py-3 placeholder-[--text-muted] text-sm text-[var(--text-primary)] outline-none transition duration-300 focus:border-[var(--accent-strong)] focus:shadow-[0_0_15px_rgba(56,189,248,0.25)] focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="location" className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Market / Location
          </label>
          <input
            id="location"
            name="location"
            required
            placeholder="e.g. Chicago"
            className="rounded-xl border border-[var(--border-strong)] bg-[rgba(15,23,42,0.6)] px-4 py-3 placeholder-[--text-muted] text-sm text-[var(--text-primary)] outline-none transition duration-300 focus:border-[var(--accent-strong)] focus:shadow-[0_0_15px_rgba(56,189,248,0.25)] focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <label htmlFor="max_price" className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Max Budget ($)
          </label>
          <input
            id="max_price"
            name="max_price"
            type="number"
            min="1"
            required
            placeholder="1600"
            className="rounded-xl border border-[var(--border-strong)] bg-[rgba(15,23,42,0.6)] px-4 py-3 placeholder-[--text-muted] text-sm text-[var(--text-primary)] outline-none transition duration-300 focus:border-[var(--accent-strong)] focus:shadow-[0_0_15px_rgba(56,189,248,0.25)] focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="flexibility" className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Flexibility %
          </label>
          <input
            id="flexibility"
            name="flexibility"
            type="number"
            min="0"
            max="50"
            defaultValue="10"
            className="rounded-xl border border-[var(--border-strong)] bg-[rgba(15,23,42,0.6)] px-4 py-3 placeholder-[--text-muted] text-sm text-[var(--text-primary)] outline-none transition duration-300 focus:border-[var(--accent-strong)] focus:shadow-[0_0_15px_rgba(56,189,248,0.25)] focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Urgency Profile
          </label>
          <div className="flex gap-2">
            {["low", "medium", "high"].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setUrgency(level)}
                className={cn(
                  "flex-1 rounded-xl border text-xs font-medium uppercase py-3 transition duration-300 capitalize",
                  urgency === level
                    ? "border-[var(--accent)] bg-[rgba(56,189,248,0.15)] text-[var(--accent-strong)] shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                    : "border-[var(--border-soft)] bg-[rgba(15,23,42,0.4)] text-[var(--text-muted)] hover:border-[var(--text-muted)] float-hover"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-strong)] bg-[rgba(139,92,246,0.05)] p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(139,92,246,0.1)] rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
          <ShieldAlert className="h-3 w-3 text-[#8b5cf6]" /> Execution Permissions
        </div>
        
        <div className="grid gap-3 sm:grid-cols-2 relative z-10">
          <button
            type="button"
            onClick={() => setCanIncrease(!canIncrease)}
            className={cn(
              "flex flex-col items-start text-left gap-2 rounded-xl border p-4 transition-all duration-300",
              canIncrease
                ? "border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.1)] shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                : "border-[var(--border-soft)] bg-[rgba(15,23,42,0.4)] opacity-70 hover:opacity-100"
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span className={cn("text-xs font-bold uppercase tracking-wider", canIncrease ? "text-[#a78bfa]" : "text-[var(--text-muted)]")}>
                Advance Pricing
              </span>
              <div className={cn("h-3 w-3 rounded-full border", canIncrease ? "bg-[#a78bfa] border-[#a78bfa] shadow-[0_0_5px_#a78bfa]" : "border-gray-500")} />
            </div>
            <span className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
              Allow agent to autonomously increase offer within max budget.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCanClose(!canClose)}
            className={cn(
              "flex flex-col items-start text-left gap-2 rounded-xl border p-4 transition-all duration-300",
              canClose
                ? "border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.1)] shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                : "border-[var(--border-soft)] bg-[rgba(15,23,42,0.4)] opacity-70 hover:opacity-100"
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span className={cn("text-xs font-bold uppercase tracking-wider", canClose ? "text-[#34d399]" : "text-[var(--text-muted)]")}>
                Instant Settle
              </span>
              <div className={cn("h-3 w-3 rounded-full border", canClose ? "bg-[#34d399] border-[#34d399] shadow-[0_0_5px_#34d399]" : "border-gray-500")} />
            </div>
            <span className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
              Permit immediate settlement when seller enters approval band.
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2 border-t border-[rgba(255,255,255,0.05)]">
        <div className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)] flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          Autonomous deployment creates an active agent loop.
        </div>
        <button
          type="submit"
          disabled={isBusy}
          className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--accent-strong)] to-[rgba(139,92,246,1)] px-5 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {isBusy ? (
            <span className="animate-pulse flex items-center gap-2">Deploying <Sparkles className="h-4 w-4 animate-spin" /></span>
          ) : (
            <>Deploy Agent <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
          )}
        </button>
      </div>

      {error ? (
        <div className="p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-red-500 text-sm text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[var(--positive)] text-sm text-[var(--positive)] shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          {success}
        </div>
      ) : null}
    </form>
  );
}
