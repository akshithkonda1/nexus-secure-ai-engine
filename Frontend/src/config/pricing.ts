import { PRICES as RAW_PRICES, PRICING_LOCK as RAW_LOCK, PRICING_VERSION } from "../../config/pricing";
import LIMIT_DATA from "../../config/limits.json";

export type PricingTierId = keyof typeof RAW_PRICES;

export type BillingCadence = "monthly" | "annual" | "semester";

export type PricingTier = {
  id: PricingTierId;
  name: string;
  description: string;
  badge?: string;
  price: (typeof RAW_PRICES)[PricingTierId];
  perks: string[];
  highlight?: boolean;
};

const formatLimit = {
  free: () => [
    `${LIMIT_DATA.free.decksPerDay} deck per day`,
    `${LIMIT_DATA.free.cardsPerDeck} cards maximum`,
    "No exports until upgrade"
  ],
  academic: () => [
    `${LIMIT_DATA.academic.studyCreditsPerDay} study credits daily`,
    `${LIMIT_DATA.academic.cardsPerDeck} cards per deck`,
    `${LIMIT_DATA.academic.examBurstPerDay} ExamBurst credits / ${LIMIT_DATA.academic.examBurstDays} days`,
    `${LIMIT_DATA.academic.concurrency} concurrent automations`
  ],
  premium: () => [
    "Advanced prompt studio",
    "Model comparison workspace",
    "Confidence scoring",
    "Priority routing"
  ],
  pro: () => [
    "Realtime API access",
    "Compliance webhooks",
    `${LIMIT_DATA.pro.teamSeatsMin}-${LIMIT_DATA.pro.teamSeatsMax} seats baseline`,
    "Signed audit log exports"
  ]
} as const;

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Starter access with daily limits and community support.",
    price: RAW_PRICES.free,
    perks: formatLimit.free()
  },
  {
    id: "academic",
    name: "Academic",
    description: "Guided study for students and educators with proof-first AI.",
    badge: "Included",
    price: RAW_PRICES.academic,
    perks: formatLimit.academic(),
    highlight: true
  },
  {
    id: "premium",
    name: "Premium",
    description: "Analyst-grade insights for high velocity product teams.",
    price: RAW_PRICES.premium,
    perks: formatLimit.premium()
  },
  {
    id: "pro",
    name: "Pro",
    description: "Governed collaboration with export controls and APIs.",
    badge: "Teams",
    price: RAW_PRICES.pro,
    perks: formatLimit.pro()
  }
];

export const PRICES = RAW_PRICES;
export const PRICING_LOCK = RAW_LOCK;

export { PRICING_VERSION };

export type PricingLockConfig = typeof RAW_LOCK & { version: typeof PRICING_VERSION };

export const PRICING_LOCK_CONFIG: PricingLockConfig = {
  ...RAW_LOCK,
  version: PRICING_VERSION
};
