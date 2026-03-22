export function shortTime(value?: string) {
  if (!value) return "Not run";

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function shortDate(value?: string) {
  if (!value) return "No timestamp";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function relativeTime(value?: string) {
  if (!value) return "No activity yet";

  const deltaSeconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

  const ranges = [
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
  ] as const;

  for (const range of ranges) {
    if (Math.abs(deltaSeconds) >= range.seconds) {
      return formatter.format(Math.round(deltaSeconds / range.seconds), range.unit);
    }
  }

  return formatter.format(deltaSeconds, "second");
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
}

export function labelize(value: string) {
  return value.replaceAll("_", " ");
}
