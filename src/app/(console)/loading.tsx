export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-[22px] border border-[var(--border-soft)] bg-[var(--background-panel)]" />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-44 animate-pulse rounded-[22px] border border-[var(--border-soft)] bg-[var(--background-panel)]" />
        <div className="h-44 animate-pulse rounded-[22px] border border-[var(--border-soft)] bg-[var(--background-panel)]" />
        <div className="h-44 animate-pulse rounded-[22px] border border-[var(--border-soft)] bg-[var(--background-panel)]" />
      </div>
    </div>
  );
}
