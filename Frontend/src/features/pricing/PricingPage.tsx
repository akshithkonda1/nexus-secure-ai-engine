import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PRICING_TIERS, PRICES, type BillingCadence } from "@/config/pricing";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/components/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/components/tooltip";
import { Badge } from "@/shared/ui/components/badge";
import { useSessionStore } from "@/shared/state/session";
import { isLocked } from "@/shared/lib/lock";

const cadences: BillingCadence[] = ["monthly", "annual", "semester"];

const formatCurrency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const getPriceForCadence = (tierId: keyof typeof PRICES, cadence: BillingCadence) => {
  const tier = PRICES[tierId];
  if (cadence in tier) {
    return tier[cadence as keyof typeof tier];
  }
  if (tierId === "free") return 0;
  if (cadence === "semester" && "monthly" in tier) {
    return tier.monthly;
  }
  return tier.monthly;
};

export default function PricingPage() {
  const [cadence, setCadence] = useState<BillingCadence>("monthly");
  const plan = useSessionStore((state) => state.plan);
  const lockedUntilISO = useSessionStore((state) => state.lockedUntilISO);
  const setPlan = useSessionStore((state) => state.setPlan);

  const locked = useMemo(() => isLocked(lockedUntilISO), [lockedUntilISO]);

  const lockMessage = locked
    ? `Upgrades unlock on ${new Date(lockedUntilISO).toLocaleDateString()}.`
    : "Select any plan to update your workspace.";

  return (
    <div className="space-y-12">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 text-center"
      >
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Pricing</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Choose the Nexus rhythm that fits.</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            Pricing remains locked for 30 days after install or until the global lock expires, ensuring stability for regulated teams.
          </p>
        </div>
        <Tabs value={cadence} onValueChange={(value) => setCadence(value as BillingCadence)} className="w-full">
          <TabsList className="mx-auto flex w-fit gap-2 rounded-full bg-app/40 p-1">
            {cadences.map((option) => (
              <TabsTrigger key={option} value={option} className="rounded-full px-4 capitalize">
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.section>

      <motion.div
        className="grid gap-6 lg:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {PRICING_TIERS.map((tier) => {
          const price = getPriceForCadence(tier.id, cadence);
          const isActive = plan === tier.id;
          const disableSelection = locked && !isActive;

          return (
            <motion.div key={tier.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
              <Card
                data-testid={`plan-${tier.id}`}
                className={`flex h-full flex-col justify-between rounded-3xl border border-app/40 bg-app/60 shadow-ambient transition ${
                  tier.highlight ? "ring-2 ring-primary/40" : ""
                } ${isActive ? "border-primary/60" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    {tier.badge && <Badge variant="outline">{tier.badge}</Badge>}
                    {isActive && <Badge variant="secondary">Current</Badge>}
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-3xl font-semibold">
                      {tier.id === "free" ? "Free" : formatCurrency.format(price)}
                    </span>
                    <p className="text-sm text-muted capitalize">{cadence} billing</p>
                  </div>
                  <ul className="space-y-2 text-sm text-muted">
                    {tier.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex w-full">
                        <Button
                          className="w-full rounded-full"
                          variant={isActive ? "default" : "outline"}
                          disabled={disableSelection}
                          onClick={() => {
                            if (disableSelection) return;
                            setPlan(tier.id);
                          }}
                        >
                          {isActive ? "Current plan" : `Choose ${tier.name}`}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {disableSelection && <TooltipContent>{lockMessage}</TooltipContent>}
                  </Tooltip>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
