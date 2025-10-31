import limits from "@/config/limits";

export type PlanTier = keyof typeof limits;

export function usePlanLimits() {
  return limits;
}

export function getLimitsFor<T extends PlanTier>(tier: T) {
  return limits[tier];
}
