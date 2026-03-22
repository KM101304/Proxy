"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function RunCycleButton() {
  const router = useRouter();
  const [isPending, startRefresh] = useTransition();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isBusy = isRunning || isPending;

  async function handleRunCycle() {
    setError(null);
    setIsRunning(true);

    try {
      const response = await fetch("/api/agents/run", { method: "POST" });
      if (!response.ok) {
        setError("Cycle failed");
        return;
      }

      startRefresh(() => router.refresh());
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleRunCycle}
        disabled={isBusy}
        className="inline-flex items-center gap-2 rounded-full border border-[rgba(199,160,106,0.24)] bg-[rgba(199,160,106,0.12)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[rgba(199,160,106,0.38)] hover:bg-[rgba(199,160,106,0.18)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <RefreshCw className={`h-4 w-4 ${isBusy ? "animate-spin" : ""}`} />
        {isBusy ? "Advancing" : "Advance Cycle"}
      </button>
      {error ? <p className="text-xs text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
