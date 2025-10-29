import { useMemo } from "react";
import { z } from "zod";
import limitsJson from "../../config/limits.json";

const limitsSchema = z.object({
  academic: z.object({
    studyCreditsPerDay: z.number().int().positive(),
    cardsPerDeck: z.number().int().positive(),
    examBurstPerDay: z.number().int().positive(),
    examBurstDays: z.number().int().positive(),
    concurrency: z.number().int().positive(),
  }),
  premium: z.object({
    priority: z.boolean(),
    advancedPrompts: z.boolean(),
    modelCompare: z.boolean(),
    confidenceScores: z.boolean(),
  }),
  pro: z.object({
    api: z.boolean(),
    batch: z.boolean(),
    teamSeatsMin: z.number().int().positive(),
    teamSeatsMax: z.number().int().positive(),
    webhooks: z.boolean(),
    logExports: z.boolean(),
  }),
});

export type PlanLimits = z.infer<typeof limitsSchema>;

let cachedLimits: PlanLimits | null = null;

function parseLimits(): PlanLimits {
  if (!cachedLimits) {
    cachedLimits = limitsSchema.parse(limitsJson);
  }
  return cachedLimits;
}

export function usePlanLimits(): PlanLimits {
  return useMemo(() => parseLimits(), []);
}
