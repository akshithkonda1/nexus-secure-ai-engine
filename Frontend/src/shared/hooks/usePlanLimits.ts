import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const limitsSchema = z.object({
  academic: z.object({
    studyCreditsPerDay: z.number(),
    cardsPerDeck: z.number(),
    examBurstPerDay: z.number(),
    examBurstDays: z.number(),
    concurrency: z.number()
  }),
  premium: z.object({
    priority: z.boolean(),
    advancedPrompts: z.boolean(),
    modelCompare: z.boolean(),
    confidenceScores: z.boolean()
  }),
  pro: z.object({
    api: z.boolean(),
    batch: z.boolean(),
    teamSeatsMin: z.number(),
    teamSeatsMax: z.number(),
    webhooks: z.boolean(),
    logExports: z.boolean()
  })
});

export type PlanLimits = z.infer<typeof limitsSchema>;

const LIMITS_URL = new URL("../../config/limits.json", import.meta.url).href;

export function usePlanLimits() {
  const query = useQuery<PlanLimits>({
    queryKey: ["plan-limits"],
    queryFn: async () => {
      const response = await fetch(LIMITS_URL);
      if (!response.ok) {
        throw new Error("Failed to load plan limits");
      }
      const data = await response.json();
      return limitsSchema.parse(data);
    }
  });

  return {
    limits: query.data,
    isLoading: query.isLoading,
    error: query.error
  };
}
