import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const PRICING_VERSION = "2025-10-29" as const;
export const PRICES = Object.freeze({
  academic: { monthly: 9.99, annual: 99, semester: 35 },
  premium: { monthly: 19, annual: 190 },
  pro: { monthly: 99, annual: 990 },
});

type BillingCycle = "monthly" | "annual" | "semester";

type PlanKey = keyof typeof PRICES;

const planDescriptions: Record<PlanKey, string[]> = {
  academic: [
    "Unlimited collaborative study rooms",
    "Multi-agent debates for complex topics",
    "Study pack generation included",
  ],
  premium: [
    "Priority inference lanes",
    "Advanced prompt templates",
    "Compare up to 3 models side-by-side",
  ],
  pro: [
    "Educator-verified packs & lesson planning",
    "Batch workflows with webhook callbacks",
    "Seat management with audit logs",
  ],
};

const planBadges: Record<PlanKey, string> = {
  academic: "For learners and researchers",
  premium: "For analysts and product teams",
  pro: "For institutions & global programs",
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount);
}

export function PricingPage(): JSX.Element {
  const defaultCycle = useMemo<BillingCycle>(() => {
    const month = new Date().getMonth();
    if (month === 0 || month === 7) {
      return "semester";
    }
    return "monthly";
  }, []);

  const [cycle, setCycle] = useState<BillingCycle>(defaultCycle);

  const supplementaryText = (plan: PlanKey) => {
    const parts: string[] = [];
    if (plan === "academic") {
      if (cycle !== "monthly") {
        parts.push(`Monthly ${formatPrice(PRICES.academic.monthly)} / month`);
      }
      if (cycle !== "annual") {
        parts.push(`Annual ${formatPrice(PRICES.academic.annual)} / year`);
      }
      if (cycle !== "semester") {
        parts.push(`Semester ${formatPrice(PRICES.academic.semester)} / semester`);
      }
    } else {
      const displayedCycle: "monthly" | "annual" = cycle === "semester" ? "monthly" : cycle;
      if (displayedCycle !== "monthly") {
        parts.push(`Monthly ${formatPrice(PRICES[plan].monthly)} / month`);
      }
      if (displayedCycle !== "annual") {
        parts.push(`Annual ${formatPrice(PRICES[plan].annual)} / year`);
      }
    }
    return parts.join(" · ");
  };

  const renderPrice = (plan: PlanKey) => {
    if (plan === "academic") {
      if (cycle === "semester") {
        return `${formatPrice(PRICES.academic.semester)} / semester`;
      }
      if (cycle === "annual") {
        return `${formatPrice(PRICES.academic.annual)} / year`;
      }
      return `${formatPrice(PRICES.academic.monthly)} / month`;
    }

    const fallbackCycle: "monthly" | "annual" = cycle === "semester" ? "monthly" : cycle;
    const amount = PRICES[plan][fallbackCycle];
    const suffix = fallbackCycle === "annual" ? " / year" : " / month";
    return `${formatPrice(amount)}${suffix}`;
  };

  return (
    <section className="flex flex-1 flex-col overflow-y-auto bg-app px-6 py-10">
      <header className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">Pricing version {PRICING_VERSION}</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">
          Nexus.ai — Where AIs debate, verify, and agree on the truth.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Encrypted. Auditable. Vendor-neutral. Because accuracy deserves proof.
        </p>
      </header>

      <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-3">
        {(["monthly", "annual", "semester"] as BillingCycle[]).map((option) => (
          <Button
            key={option}
            variant={cycle === option ? "default" : "outline"}
            onClick={() => setCycle(option)}
          >
            {option === "monthly" && "Monthly"}
            {option === "annual" && "Annual (2 months free)"}
            {option === "semester" && "Semester (4 months)"}
          </Button>
        ))}
      </div>

      <div className="mx-auto mt-10 grid w-full max-w-6xl gap-6 md:grid-cols-3">
        {(Object.keys(PRICES) as PlanKey[]).map((planKey) => (
          <Card key={planKey} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl capitalize">{planKey}</CardTitle>
              <CardDescription>{planBadges[planKey]}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-6">
              <div>
                <p className="text-3xl font-bold">{renderPrice(planKey)}</p>
                {planKey === "academic" && cycle === "semester" ? (
                  <p className="mt-2 text-xs text-muted">
                    Semester pricing auto-aligns with academic calendars and includes study pack credits.
                  </p>
                ) : null}
                {planKey !== "academic" && cycle === "semester" ? (
                  <p className="mt-2 text-xs text-muted">
                    {planKey === "premium"
                      ? "Semester billing not available. Displaying monthly pricing."
                      : "Semester billing not available for Pro. Displaying monthly pricing."}
                  </p>
                ) : null}
                {supplementaryText(planKey) ? (
                  <p className="mt-3 text-xs text-muted">{supplementaryText(planKey)}</p>
                ) : null}
              </div>
              <ul className="space-y-2 text-sm">
                {planDescriptions[planKey].map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={planKey === "pro" ? "default" : "secondary"}>
                {planKey === "pro" ? "Start deployment" : "Begin trial"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
