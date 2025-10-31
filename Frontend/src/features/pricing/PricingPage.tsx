import { PRICES } from "@/config/pricing";
import { isLocked } from "@/shared/lib/lock";

const PlanCard = ({
  name,
  price,
  features,
}: {
  name: string;
  price: string;
  features: string[];
}) => {
  const { locked, untilISO } = isLocked();
  return (
    <div className="rounded-2xl border p-6 flex flex-col gap-4">
      <h3 className="text-xl font-semibold">{name}</h3>
      <div className="text-3xl font-bold">{price}</div>
      <ul className="text-sm text-muted-foreground space-y-2">
        {features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
      <button
        className="mt-auto px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        disabled={locked}
        title={locked ? `Upgrades open ${new Date(untilISO).toLocaleDateString()}` : ""}
      >
        {locked ? "Upgrade (locked)" : `Choose ${name}`}
      </button>
    </div>
  );
};

export function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-semibold mb-2">
        Nexus.ai — Where AIs debate, verify, and agree on the truth.
      </h1>
      <p className="text-muted-foreground mb-8">
        Encrypted. Auditable. Vendor-neutral. Because accuracy deserves proof.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlanCard
          name="Free"
          price="$0"
          features={["1 trial deck/day", "≤25 cards/deck", "Watermarked audit", "No exports"]}
        />
        <PlanCard
          name="Academic"
          price={`$${PRICES.academic.monthly}`}
          features={["40 study credits/day", "100 cards/deck", "90 ExamBurst credits over 7 days"]}
        />
        <PlanCard
          name="Premium"
          price={`$${PRICES.premium.monthly}`}
          features={["Advanced prompt studio", "Model comparison", "Confidence scoring", "NO Study Pack generation"]}
        />
        <PlanCard
          name="Pro"
          price={`$${PRICES.pro.monthly}`}
          features={[
            "Realtime API access",
            "Batch pipeline",
            "Webhooks",
            "Audit log exports",
            "3–5 seats",
            "Educator-verified class packs",
          ]}
        />
      </div>
    </div>
  );
}
