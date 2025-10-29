import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { cn } from "../../shared/lib/cn";

export const PRICING_VERSION = "2025-10-29";

export const PRICES = Object.freeze({
  academic: { monthly: 9.99, annual: 99, semester: 35 },
  premium: { monthly: 19, annual: 190 },
  pro: { monthly: 99, annual: 990 },
});

type BillingCycle = "monthly" | "annual" | "semester";

const billingLabels: Record<BillingCycle, string> = {
  monthly: "Monthly",
  annual: "Annual",
  semester: "Semester",
};

function formatPrice(value: number): string {
  return value % 1 ? value.toFixed(2) : value.toFixed(0);
}

export function PricingPage() {
  const defaultCycle = useMemo<BillingCycle>(() => {
    const month = new Date().getMonth();
    if (month === 0 || month === 7) {
      return "semester";
    }
    return "monthly";
  }, []);

  const [cycle, setCycle] = useState<BillingCycle>(defaultCycle);

  return (
    <div className="flex w-full flex-col gap-8 p-8">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold">Nexus.ai — Where AIs debate, verify, and agree on the truth.</h1>
        <p className="text-base text-muted">
          Encrypted. Auditable. Vendor-neutral. Because accuracy deserves proof.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-subtle bg-surface/70 p-1">
          {(Object.keys(billingLabels) as BillingCycle[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCycle(option)}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition",
                cycle === option ? "bg-accent-soft text-white" : "text-muted hover:bg-slate-900/10",
              )}
            >
              {billingLabels[option]}
            </button>
          ))}
        </div>
      </header>
      <section className="grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Academic</CardTitle>
            <CardDescription>Perfect for students who need trusted explanations and citations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${formatPrice(
                cycle === "annual" ? PRICES.academic.annual : cycle === "semester" ? PRICES.academic.semester : PRICES.academic.monthly,
              )}
              <span className="text-base font-normal text-muted">/{cycle === "semester" ? "semester" : cycle === "annual" ? "year" : "month"}</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>Study Pack generation for every lecture</li>
              <li>Classroom-safe responses tuned for clarity</li>
              <li>Seamless export to Nexus Library</li>
            </ul>
            <Button className="mt-6 w-full" variant="primary">
              Choose Academic
            </Button>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Premium</CardTitle>
            <CardDescription>Best for analysts and operators verifying critical decisions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${formatPrice(cycle === "annual" ? PRICES.premium.annual : PRICES.premium.monthly)}
              <span className="text-base font-normal text-muted">/{cycle === "annual" ? "year" : "month"}</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>❌ No Study Pack generation (view/remix only)</li>
              <li>Comparative model debates with consensus scoring</li>
              <li>Instant export to SOC2-ready audit trails</li>
            </ul>
            <Button className="mt-6 w-full" variant="outline">
              Switch to Premium
            </Button>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>Run advanced programs across multiple AI teams with controls.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${formatPrice(cycle === "annual" ? PRICES.pro.annual : PRICES.pro.monthly)}
              <span className="text-base font-normal text-muted">/{cycle === "annual" ? "year" : "month"}</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>Educator-verified: may generate class packs.</li>
              <li>Batch orchestration and webhook eventing</li>
              <li>Zero trust controls with SOC-lite compliance</li>
            </ul>
            <Button className="mt-6 w-full" variant="outline">
              Talk to sales
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
