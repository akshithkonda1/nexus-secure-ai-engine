import React, { useMemo, useState } from "react";
import { PRICES, type PlanKey } from "@/config/pricing";
import limits from "@/config/limits.json";
import { Button } from "@/shared/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/components/tooltip";
import { useSession } from "@/shared/state/session";

type Cycle = "monthly" | "annual" | "semester";

type FeatureMap = Record<PlanKey, string[]>;

const FEATURES: FeatureMap = {
  free: ["1 trial deck per day", "≤ 25 cards per deck", "Browse/remix only", "No exports (watermarked audit)"],
  academic: [
    `Study credits per day: ${limits.academic.studyCreditsPerDay}`,
    `Cards per deck: ${limits.academic.cardsPerDeck}`,
    `ExamBurst: ${limits.academic.examBurstPerDay} over ${limits.academic.examBurstDays} days`,
    `Concurrent sessions: ${limits.academic.concurrency}`,
  ],
  premium: ["Advanced prompt studio", "Model comparison view", "Confidence scoring", "NO Study Pack generation"],
  pro: [
    "Realtime API access",
    "Batch pipeline",
    "Event webhooks",
    "Audit log exports",
    "3–5 seats included",
    "Educator-verified may generate class packs",
  ],
};

export default function PricingPage() {
  const { plan, setPlan } = useSession();
  const [cycle, setCycle] = useState<Cycle>("monthly");

  const cards = useMemo(
    () => [
      { key: "free" as PlanKey, title: "Free" },
      { key: "academic" as PlanKey, title: "Academic" },
      { key: "premium" as PlanKey, title: "Premium" },
      { key: "pro" as PlanKey, title: "Pro" },
    ],
    [],
  );

  const priceFor = (key: PlanKey) => {
    if (key === "free") {
      return "$0";
    }
    const value = PRICES[key] as Record<string, number>;
    if (cycle === "semester" && "semester" in value) {
      return `$${value.semester}`;
    }
    if (cycle === "annual" && "annual" in value) {
      return `$${value.annual}`;
    }
    return `$${value.monthly}`;
  };

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-semibold">
            Nexus.ai — Where AIs debate, verify, and agree on the truth.
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Encrypted. Auditable. Vendor-neutral. Because accuracy deserves proof.
          </p>
          <div className="mt-4 inline-flex rounded-full bg-neutral-100 dark:bg-neutral-800 p-1">
            {(["monthly", "annual", "semester"] as Cycle[]).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={`px-4 py-1 rounded-full text-sm ${
                  cycle === c ? "bg-white dark:bg-neutral-900 shadow" : ""
                }`}
              >
                {c === "annual"
                  ? "Annual (2 months free)"
                  : c === "semester"
                  ? "Semester (4 months)"
                  : "Monthly"}
              </button>
            ))}
          </div>
        </header>

        <div className="grid md:grid-cols-4 gap-6">
          {cards.map(({ key, title }) => (
            <div
              key={key}
              className={`rounded-2xl border p-6 ${
                plan === key ? "border-violet-400" : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              <div className="text-lg font-semibold mb-2">{title}</div>
              <div className="text-4xl font-bold mb-1">{priceFor(key)}</div>
              <div className="text-sm text-neutral-500 mb-4">
                {cycle === "annual" ? "per year" : cycle === "semester" ? "per semester" : "per month"}
              </div>
              <ul className="text-sm space-y-2 mb-6">
                {FEATURES[key].map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="w-full rounded-xl" onClick={() => setPlan(key)}>
                    {key === "free" ? "Start Free" : `Choose ${title}`}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sets your default workspace plan.</TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
