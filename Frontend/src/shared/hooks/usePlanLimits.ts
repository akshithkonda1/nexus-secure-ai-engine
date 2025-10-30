import limitsConfig from "@/config/limits.json";

type PlanKey = keyof typeof limitsConfig;

export type PlanLimits = (typeof limitsConfig)[PlanKey];

export function usePlanLimits<TPlan extends PlanKey>(plan: TPlan): (typeof limitsConfig)[TPlan] {
  return limitsConfig[plan];
}

export function listPlans(): PlanKey[] {
  return Object.keys(limitsConfig) as PlanKey[];
}
