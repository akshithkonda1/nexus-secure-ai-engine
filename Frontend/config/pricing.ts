export const PRICING_VERSION = "2025-10-30" as const;

export const PRICES = Object.freeze({
  free: { monthly: 0 },
  academic: { monthly: 9.99, annual: 99, semester: 35 },
  premium: { monthly: 19, annual: 190 },
  pro: { monthly: 99, annual: 990 }
} as const);

export const PRICING_LOCK = Object.freeze({
  durationDays: 30,
  anchorISO: "2025-10-30"
} as const);
