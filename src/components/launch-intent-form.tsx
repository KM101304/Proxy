"use client";

import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function LaunchIntentForm() {
  const router = useRouter();
  const [isPending, startRefresh] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
          urgency: formData.get("urgency"),
          flexibility: Number(formData.get("flexibility")),
          agent_permissions: {
            canIncreaseOffer: formData.get("can_increase_offer") === "on",
            canCloseInstantly: formData.get("close_instantly") === "on",
          },
        }),
      });

      const payload = (await response.json()) as { error?: string; intent?: { item: string } };
      if (!response.ok) {
        setError(payload.error ?? "Unable to launch the intent.");
        return;
      }

      form.reset();
      setSuccess(`Intent launched for ${payload.intent?.item ?? "the new target"}.`);
      startRefresh(() => router.refresh());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="item" className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Target item
        </label>
        <input
          id="item"
          name="item"
          required
          placeholder="Brompton folding bike"
          className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--background-panel-strong)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[rgba(199,160,106,0.35)]"
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="location"
          className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
        >
          Market
        </label>
        <input
          id="location"
          name="location"
          required
          placeholder="Chicago"
          className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--background-panel-strong)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[rgba(199,160,106,0.35)]"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label
            htmlFor="max_price"
            className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
          >
            Max budget
          </label>
          <input
            id="max_price"
            name="max_price"
            type="number"
            min="1"
            required
            placeholder="1600"
            className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--background-panel-strong)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[rgba(199,160,106,0.35)]"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="flexibility"
            className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
          >
            Flexibility %
          </label>
          <input
            id="flexibility"
            name="flexibility"
            type="number"
            min="0"
            max="50"
            defaultValue="10"
            className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--background-panel-strong)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[rgba(199,160,106,0.35)]"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="urgency"
          className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
        >
          Urgency
        </label>
        <select
          id="urgency"
          name="urgency"
          defaultValue="medium"
          className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--background-panel-strong)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[rgba(199,160,106,0.35)]"
        >
          <option value="low">Low urgency</option>
          <option value="medium">Medium urgency</option>
          <option value="high">High urgency</option>
        </select>
      </div>

      <div className="rounded-[20px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] p-4">
        <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">
          Execution permissions
        </div>
        <div className="mt-3 grid gap-3">
          <label className="flex items-start gap-3 rounded-[18px] border border-[var(--border-soft)] bg-[var(--background-panel-soft)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
            <input
              name="can_increase_offer"
              type="checkbox"
              defaultChecked
              className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--background-panel-strong)] accent-[var(--accent-strong)]"
            />
            <span>Allow the agent to advance pricing within the approved budget.</span>
          </label>

          <label className="flex items-start gap-3 rounded-[18px] border border-[var(--border-soft)] bg-[var(--background-panel-soft)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
            <input
              name="close_instantly"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--background-panel-strong)] accent-[var(--accent-strong)]"
            />
            <span>Permit immediate settlement when the offer enters the approval band.</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Launch creates an explicit instruction, not a hidden autonomous loop.
        </div>
        <button
          type="submit"
          disabled={isBusy}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--text-primary)] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isBusy ? "Launching" : "Launch Intent"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      {success ? <p className="text-sm text-[var(--positive)]">{success}</p> : null}
    </form>
  );
}
