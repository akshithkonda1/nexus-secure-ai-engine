import { useMemo, useState } from "react";
import { PRICES } from "@/config/pricing";
import { isLocked } from "@/shared/lib/lock";
import { Button } from "@/shared/ui/components/button";
import { cn } from "@/shared/lib/cn";

type BillingInterval = "monthly" | "annual" | "semester";

const BILLING_OPTIONS: { value: BillingInterval; label: string; caption?: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual", caption: "2 months free" },
  { value: "semester", label: "Semester", caption: "4 months" },
];

const PLAN_DEFINITIONS = [
  {
    key: "academic" as const,
    name: "Academic",
    headline: "For focused learners who demand clarity and retention.",
    ribbon: "Most popular",
    cta: "Choose Academic",
    features: [
      "40 study credits per day",
      "10 card packs per deck",
      "100 test cards over 7 days",
      "Study cadence analytics",
    ],
  },
  {
    key: "premium" as const,
    name: "Premium",
    headline: "Accuracy-obsessed analysts and product teams.",
    cta: "Choose Premium",
    features: [
      "Model comparison studio",
      "Audit summary timelines",
      "Workflow automations",
      "Shared prompt library",
    ],
  },
  {
    key: "pro" as const,
    name: "Pro",
    headline: "Regulated teams that need provable, multi-seat control.",
    cta: "Choose Pro",
    features: [
      "Realtime API access",
      "Batch knowledge pipeline",
      "Event webhooks",
      "SAML + granular roles",
      "Audit log exports",
    ],
  },
];

export default function PricingPage() {
  const { locked, untilISO } = isLocked();
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  const intervalLabel = useMemo(() => {
    switch (interval) {
      case "annual":
        return "/year";
      case "semester":
        return "/semester";
      default:
        return "/month";
    }
  }, [interval]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-16 pt-10">
      <header className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <span className="rounded-full border border-app bg-card px-4 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Proof-first intelligence
        </span>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
          Ryuzen.ai — Where AIs debate, verify, and agree on the truth.
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Encrypted. Auditable. Vendor-neutral. Because accuracy deserves proof.
        </p>
      </header>

      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-app bg-card px-2 py-1">
          {BILLING_OPTIONS.map((option) => {
            const isActive = interval === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setInterval(option.value)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition",
                  isActive ? "bg-foreground text-background shadow-ambient" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{option.label}</span>
                {option.caption ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">{option.caption}</span>
                ) : null}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Toggle how you want to pay. Switch plans anytime — upgrades take effect instantly.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {PLAN_DEFINITIONS.map((plan) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            interval={interval}
            intervalLabel={intervalLabel}
            locked={locked}
            untilISO={untilISO}
          />
        ))}
      </section>

      <footer className="mx-auto max-w-3xl space-y-4 text-center text-sm text-muted-foreground">
        <p>
          Need volume pricing or governance reviews? Email <a className="underline" href="mailto:accuracy@ryuzen.ai">accuracy@ryuzen.ai</a>{" "}
          and our compliance team will reach out within one business day.
        </p>
        <p>All paid plans include accuracy receipts, model provenance, and red-team regression tracking.</p>
      </footer>
    </div>
  );
}

type PlanDefinition = (typeof PLAN_DEFINITIONS)[number];

function PlanCard({
  plan,
  interval,
  intervalLabel,
  locked,
  untilISO,
}: {
  plan: PlanDefinition;
  interval: BillingInterval;
  intervalLabel: string;
  locked: boolean;
  untilISO: string;
}) {
  const table = PRICES[plan.key] as Partial<Record<BillingInterval, number>>;
  const price = table[interval];
  const priceLabel = typeof price === "number" ? formatUSD(price) : "Coming soon";
  const disabled = locked || typeof price !== "number";

  return (
    <article
      className={cn(
        "relative flex h-full flex-col gap-6 rounded-3xl border border-app bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg",
        plan.ribbon ? "ring-2 ring-violet-400/50" : null,
      )}
    >
      {plan.ribbon ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-[rgb(var(--on-accent))] shadow-ambient">
          {plan.ribbon}
        </span>
      ) : null}

      <header className="space-y-2 text-center md:text-left">
        <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{plan.name}</div>
        <div className="text-4xl font-bold">
          {priceLabel}
          <span className="ml-1 text-base font-medium text-muted-foreground">{priceLabel !== "Coming soon" ? intervalLabel : ""}</span>
        </div>
        <p className="text-sm text-muted-foreground">{plan.headline}</p>
      </header>

      <ul className="flex flex-1 flex-col gap-3 text-sm">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CheckIcon className="mt-1 size-4 text-violet-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full rounded-full"
        variant={plan.ribbon ? "default" : "outline"}
        disabled={disabled}
        title={disabled && untilISO ? `Upgrades unlock on ${new Date(untilISO).toLocaleDateString()}` : undefined}
      >
        {plan.cta}
      </Button>
    </article>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
    >
      <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 ? 2 : 0,
  }).format(value);
}
