import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { LIMITS } from "@/config/limits";
import { PRICES } from "@/config/pricing";
import { Separator } from "@/shared/ui/components/separator";

const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function BillingSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>Your Nexus.ai workspace runs on the Academic plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">Academic</p>
              <p className="text-sm text-muted">{formatter.format(PRICES.academic.monthly)}/month</p>
            </div>
            <span className="rounded-full bg-accent-student/10 px-3 py-1 text-sm text-accent-student">Active</span>
          </div>
          <Separator />
          <ul className="grid gap-2 text-sm text-app md:grid-cols-2">
            <li>{LIMITS.academic.studyCreditsPerDay} study credits per day</li>
            <li>{LIMITS.academic.cardsPerDeck} cards per deck</li>
            <li>
              {LIMITS.academic.examBurstPerDay} ExamBurst credits across {LIMITS.academic.examBurstDays} days
            </li>
            <li>{LIMITS.academic.concurrency} concurrent tasks</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade options</CardTitle>
          <CardDescription>Premium unlocks production analytics; Pro adds compliance workflows.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-card border border-app p-4 shadow-press">
            <h3 className="text-lg font-semibold">Premium</h3>
            <p className="text-sm text-muted">{formatter.format(PRICES.premium.monthly)} billed monthly</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Advanced prompt studio</li>
              <li>Model comparison view</li>
              <li>NO Study Pack generation</li>
            </ul>
          </div>
          <div className="rounded-card border border-app p-4 shadow-press">
            <h3 className="text-lg font-semibold">Pro</h3>
            <p className="text-sm text-muted">{formatter.format(PRICES.pro.monthly)} billed monthly</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Audit log exports & webhooks</li>
              <li>{LIMITS.pro.teamSeatsMin}-{LIMITS.pro.teamSeatsMax} seats</li>
              <li>Educator-verified may generate class packs</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
