export const PRICES = Object.freeze({
  free: { monthly: 0 },
  academic: { monthly: 9.99, annual: 99, semester: 35 },
  premium: { monthly: 19, annual: 190 },
  pro: { monthly: 99, annual: 990 },
});

export type PlanKey = keyof typeof PRICES;
