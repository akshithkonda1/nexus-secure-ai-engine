import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { LIMITS } from "@/config/limits";
import { PRICES, PRICING_TIERS } from "@/config/pricing";
import { Separator } from "@/shared/ui/components/separator";
import { useSessionStore } from "@/shared/state/session";
import { isLocked } from "@/shared/lib/lock";

const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function BillingSettings() {
  const plan = useSessionStore((state) => state.plan);
  const lockedUntilISO = useSessionStore((state) => state.lockedUntilISO);
  const locked = isLocked(lockedUntilISO);

  const activeTier = PRICING_TIERS.find((tier) => tier.id === plan) ?? PRICING_TIERS[1];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>Your Nexus workspace is locked to this plan until pricing unlocks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">{activeTier.name}</p>
              <p className="text-sm text-muted">
                {activeTier.id === "free"
                  ? "Free tier"
                  : `${formatter.format(PRICES[activeTier.id].monthly)} billed monthly`}
              </p>
            </div>
            <span className="rounded-full bg-app/60 px-3 py-1 text-xs uppercase tracking-wide text-muted">
              {locked ? `Locked until ${new Date(lockedUntilISO).toLocaleDateString()}` : "Unlocked"}
            </span>
          </div>
          <Separator />
          <ul className="grid gap-2 text-sm text-app md:grid-cols-2">
            {activeTier.id === "academic" && (
              <>
                <li>{LIMITS.academic.studyCreditsPerDay} study credits per day</li>
                <li>{LIMITS.academic.cardsPerDeck} cards per deck</li>
                <li>
                  {LIMITS.academic.examBurstPerDay} ExamBurst credits across {LIMITS.academic.examBurstDays} days
                </li>
                <li>{LIMITS.academic.concurrency} concurrent tasks</li>
              </>
            )}
            {activeTier.id === "free" && (
              <>
                <li>{LIMITS.free.decksPerDay} deck per day</li>
                <li>{LIMITS.free.cardsPerDeck} cards per deck</li>
                <li>No exports available</li>
              </>
            )}
            {activeTier.id === "premium" && (
              <>
                <li>Advanced prompt studio</li>
                <li>Model comparison workspace</li>
                <li>Confidence scoring</li>
                <li>Priority routing</li>
              </>
            )}
            {activeTier.id === "pro" && (
              <>
                <li>Realtime API access</li>
                <li>Compliance webhooks</li>
                <li>
                  {LIMITS.pro.teamSeatsMin}-{LIMITS.pro.teamSeatsMax} seats baseline
                </li>
                <li>Signed audit log exports</li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available plans</CardTitle>
          <CardDescription>Compare tiers so you are ready when the pricing lock expires.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {PRICING_TIERS.filter((tier) => tier.id !== activeTier.id).map((tier) => (
            <div key={tier.id} className="rounded-card border border-app/40 bg-app/40 p-4 shadow-press">
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <p className="text-sm text-muted">{tier.description}</p>
              <p className="mt-2 text-sm font-medium">
                {tier.id === "free" ? "Free tier" : `${formatter.format(PRICES[tier.id].monthly)} billed monthly`}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {tier.perks.slice(0, 3).map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
