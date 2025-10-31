import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PRICES } from "@/config/pricing";
import limits from "@/config/limits";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/components/tabs";
import { Separator } from "@/shared/ui/components/separator";
import { logEvent } from "@/shared/lib/audit";

const formatInteger = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const formatDecimal = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

type BillingCycle = "monthly" | "annual" | "semester";

const CYCLES: BillingCycle[] = ["monthly", "annual", "semester"];

const cycleLabel: Record<BillingCycle, string> = {
  monthly: "Monthly",
  annual: "Annual (2 months free)",
  semester: "Semester (4 months)"
};

const getDefaultCycle = (): BillingCycle => {
  const month = new Date().getMonth();
  return month === 0 || month === 7 ? "semester" : "monthly";
};

const academicBenefits = [
  `${limits.academic.studyCreditsPerDay} study credits per day`,
  `${limits.academic.cardsPerDeck} cards per deck`,
  `${limits.academic.examBurstPerDay} ExamBurst credits over ${limits.academic.examBurstDays} days`
];

const premiumBenefits = [
  limits.premium.advancedPrompts ? "Advanced prompt studio" : "",
  limits.premium.modelCompare ? "Model comparison view" : "",
  limits.premium.confidenceScores ? "Confidence scoring" : "",
  "NO Study Pack generation"
].filter(Boolean);

const proBenefits = [
  limits.pro.api ? "Realtime API access" : "",
  limits.pro.batch ? "Batch pipeline" : "",
  limits.pro.webhooks ? "Event webhooks" : "",
  limits.pro.logExports ? "Audit log exports" : "",
  limits.pro.teamSeatsMin && limits.pro.teamSeatsMax
    ? `${limits.pro.teamSeatsMin}-${limits.pro.teamSeatsMax} seats included`
    : "",
  "Educator-verified may generate class packs"
].filter(Boolean);

const plans = [
  {
    id: "academic",
    name: "Academic",
    blurb: "For focused learners who demand clarity and retention.",
    badge: "Most popular",
    benefits: academicBenefits
  },
  {
    id: "premium",
    name: "Premium",
    blurb: "Accuracy-obsessed analysts and product teams.",
    badge: undefined,
    benefits: premiumBenefits
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "Regulated teams that need provable, multi-seat control.",
    badge: "For teams",
    benefits: proBenefits
  }
] as const;

const formatPrice = (value: number) => (Number.isInteger(value) ? formatInteger.format(value) : formatDecimal.format(value));

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>(getDefaultCycle);

  const cyclePrices = useMemo(() => {
    return plans.map((plan) => {
      const price = PRICES[plan.id as keyof typeof PRICES];
      if (plan.id === "academic") {
        return {
          id: plan.id,
          value: cycle === "semester" ? price.semester : price[cycle as "monthly" | "annual"]
        };
      }
      return {
        id: plan.id,
        value: price[cycle === "semester" ? "monthly" : cycle]
      };
    });
  }, [cycle]);

  const renderPrice = (planId: string) => {
    const priceEntry = cyclePrices.find((item) => item.id === planId);
    if (!priceEntry) return null;
    return <span className="text-4xl font-semibold">{formatPrice(priceEntry.value)}</span>;
  };

  return (
    <div className="space-y-12">
      <section className="space-y-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-semibold tracking-tight"
        >
          Nexus.ai — Where AIs debate, verify, and agree on the truth.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-lg text-muted"
        >
          Encrypted. Auditable. Vendor-neutral. Because accuracy deserves proof.
        </motion.p>
      </section>

      <Tabs value={cycle} onValueChange={(value: string) => {
        const next = value as BillingCycle;
        setCycle(next);
        logEvent("pricing.cycle", { cycle: next });
      }}>
        <TabsList className="mx-auto flex w-fit gap-2">
          {CYCLES.map((value) => (
            <TabsTrigger key={value} value={value} className="px-4">
              {cycleLabel[value]}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={cycle} className="border-none bg-transparent p-0 shadow-none">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card
                  data-testid={`plan-${plan.id}`}
                  className={`relative flex h-full flex-col gap-6 ${
                    plan.id === "academic" ? "border-2 border-accent-student shadow-lg" : ""
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-6 inline-flex rounded-full bg-accent-nexus px-3 py-1 text-xs text-white shadow-ambient">
                      {plan.badge}
                    </span>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.blurb}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <div className="space-y-1">
                      {renderPrice(plan.id)}
                      <p className="text-sm text-muted">{cycleLabel[cycle]}</p>
                    </div>
                    <Separator />
                    <ul className="space-y-2 text-sm text-app">
                      {plan.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent-nexus" aria-hidden="true" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto">
                      <Button className="w-full" variant={plan.id === "academic" ? "default" : "subtle"}>
                        Choose {plan.name}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
