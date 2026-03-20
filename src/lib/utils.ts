export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function titleToSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
