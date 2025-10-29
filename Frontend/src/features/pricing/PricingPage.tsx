import React, { useMemo, useState } from "react";
import { Button } from "@/shared/ui/components/button";
import { usePlanLimits } from "@/shared/hooks/usePlanLimits";

export const PRICING_VERSION = "2025-10-29";

export const PRICES = Object.freeze({
  academic: { monthly: 9.99, annual: 99, semester: 35 },
  premium: { monthly: 19, annual: 190 },
  pro: { monthly: 99, annual: 990 }
});

type BillingCycle = "monthly" | "annual" | "semester";

const BILLING_CYCLES: BillingCycle[] = ["monthly", "annual", "semester"];

function getDefaultCycle(): BillingCycle {
  const month = new Date().getMonth();
  return month === 0 || month === 7 ? "semester" : "monthly";
}

function formatPrice(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: value % 1 ? 2 : 0, maximumFractionDigits: value % 1 ? 2 : 0 })}`;
}

type PlanKey = keyof typeof PRICES;

const planDescriptions: Record<PlanKey, string[]> = {
  academic: ["Core tools for students and independent researchers.", "Study credits reset daily.", "Semester billing available in January and August."],
  premium: ["Priority routing and advanced prompts.", "❌ No Study Pack generation (view/remix only)."],
  pro: ["Educator-verified: may generate class packs.", "API, batch exports, and team seats included."]
};

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>(getDefaultCycle);
  const { limits, isLoading: limitsLoading } = usePlanLimits();

  const academicPrice = useMemo(() => PRICES.academic[cycle] ?? PRICES.academic.monthly, [cycle]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Nexus.ai — Where AIs debate, verify, and agree on the truth.</h1>
        <p className="text-lg text-muted-foreground">
          Encrypted. Auditable. Vendor-neutral. Because accuracy deserves proof.
        </p>
      </section>

      <section className="flex items-center justify-center gap-2" aria-label="Billing cycle">
        {BILLING_CYCLES.map(option => (
          <Button
            key={option}
            type="button"
            variant={cycle === option ? "default" : "outline"}
            onClick={() => setCycle(option)}
            aria-pressed={cycle === option}
          >
            {option === "annual" ? "Annual" : option === "semester" ? "Semester" : "Monthly"}
          </Button>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="flex flex-col gap-4 rounded-lg border border-border bg-background p-6 shadow-card">
          <header className="space-y-1">
            <h2 className="text-xl font-semibold">Academic</h2>
            <p className="text-sm text-muted-foreground">Optimized for term-long study cohorts.</p>
          </header>
          <div>
            <p className="text-3xl font-bold">{formatPrice(academicPrice)}</p>
            <p className="text-sm text-muted-foreground">
              {cycle === "semester" ? "per semester" : cycle === "annual" ? "per year" : "per month"}
            </p>
          </div>
          <ul className="flex flex-1 flex-col gap-2 text-sm text-foreground">
            {planDescriptions.academic.map(item => (
              <li key={item}>{item}</li>
            ))}
            <li>
              Study credits per day: {limitsLoading ? "…" : limits?.academic.studyCreditsPerDay ?? "–"}
            </li>
            <li>Cards per deck: {limitsLoading ? "…" : limits?.academic.cardsPerDeck ?? "–"}</li>
            <li>Exam burst days: {limitsLoading ? "…" : limits?.academic.examBurstDays ?? "–"}</li>
            <li>Concurrent sessions: {limitsLoading ? "…" : limits?.academic.concurrency ?? "–"}</li>
          </ul>
          <Button type="button">Start Academic</Button>
        </article>

        <article className="flex flex-col gap-4 rounded-lg border border-border bg-background p-6 shadow-card">
          <header className="space-y-1">
            <h2 className="text-xl font-semibold">Premium</h2>
            <p className="text-sm text-muted-foreground">Power features without educator governance.</p>
          </header>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{formatPrice(PRICES.premium.monthly)}</p>
            <p className="text-sm text-muted-foreground">per month</p>
            <p className="text-lg font-semibold">{formatPrice(PRICES.premium.annual)} <span className="text-sm text-muted-foreground">per year</span></p>
          </div>
          <ul className="flex flex-1 flex-col gap-2 text-sm text-foreground">
            {planDescriptions.premium.map(item => (
              <li key={item}>{item}</li>
            ))}
            <li>
              Priority support: {limitsLoading ? "…" : limits?.premium.priority ? "Included" : "–"}
            </li>
            <li>Advanced prompts: {limitsLoading ? "…" : limits?.premium.advancedPrompts ? "Included" : "–"}</li>
            <li>Model compare: {limitsLoading ? "…" : limits?.premium.modelCompare ? "Included" : "–"}</li>
            <li>Confidence scores: {limitsLoading ? "…" : limits?.premium.confidenceScores ? "Included" : "–"}</li>
          </ul>
          <Button type="button" variant="outline">
            Go Premium
          </Button>
        </article>

        <article className="flex flex-col gap-4 rounded-lg border border-border bg-background p-6 shadow-card">
          <header className="space-y-1">
            <h2 className="text-xl font-semibold">Pro</h2>
            <p className="text-sm text-muted-foreground">For teams shipping verified curricula.</p>
          </header>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{formatPrice(PRICES.pro.monthly)}</p>
            <p className="text-sm text-muted-foreground">per month</p>
            <p className="text-lg font-semibold">{formatPrice(PRICES.pro.annual)} <span className="text-sm text-muted-foreground">per year</span></p>
          </div>
          <ul className="flex flex-1 flex-col gap-2 text-sm text-foreground">
            {planDescriptions.pro.map(item => (
              <li key={item}>{item}</li>
            ))}
            <li>API access: {limitsLoading ? "…" : limits?.pro.api ? "Included" : "–"}</li>
            <li>Batch exports: {limitsLoading ? "…" : limits?.pro.batch ? "Included" : "–"}</li>
            <li>
              Team seats: {limitsLoading ? "…" : `${limits?.pro.teamSeatsMin ?? "–"}-${limits?.pro.teamSeatsMax ?? "–"}`}
            </li>
            <li>Webhooks: {limitsLoading ? "…" : limits?.pro.webhooks ? "Included" : "–"}</li>
            <li>Log exports: {limitsLoading ? "…" : limits?.pro.logExports ? "Included" : "–"}</li>
          </ul>
          <Button type="button" variant="outline">
            Contact Sales
          </Button>
        </article>
      </section>

      <footer className="text-center text-sm text-muted-foreground">
        Pricing locked at version {PRICING_VERSION}; changes appear in release notes.
      </footer>
    </div>
  );
}
