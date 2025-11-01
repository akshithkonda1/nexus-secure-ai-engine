import { PRICES } from "@/config/pricing";
import { isLocked } from "@/shared/lib/lock";
export default function PricingPage() {
  const { locked, untilISO } = isLocked();
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-semibold">Nexus.ai — Where AIs debate, verify, and agree on the truth.</h1>
      <p className="text-muted-foreground">Encrypted. Auditable. Vendor-neutral. Because accuracy deserves proof.</p>
      <div className="grid gap-6 md:grid-cols-3">
        <PlanCard name="Free" price="$0" features={["1 trial deck/day","≤ 25 cards","No exports","Watermarked audits"]} locked={true} />
        <PlanCard name="Academic" price={`$${PRICES.academic.monthly}`} features={["40 study credits/day","100 cards/deck","90 ExamBurst over 7 days"]} locked={locked} untilISO={untilISO}/>
        <PlanCard name="Premium" price={`$${PRICES.premium.monthly}`} features={["Advanced prompt studio","Model comparison view","Confidence scoring","NO Study Pack generation"]} locked={locked} untilISO={untilISO}/>
        <PlanCard name="Pro" price={`$${PRICES.pro.monthly}`} features={["Realtime API access","Batch pipeline","Event webhooks","Audit log exports","3–5 seats","Educator-verified: may generate class packs"]} locked={locked} untilISO={untilISO}/>
      </div>
    </div>
  );
}
function PlanCard({name, price, features, locked, untilISO}:{name:string; price:string; features:string[]; locked:boolean; untilISO?:string}) {
  return (
    <div className="rounded-2xl border p-6 space-y-4">
      <div className="text-xl font-semibold">{name}</div>
      <div className="text-3xl font-bold">{price}<span className="text-sm font-normal text-muted-foreground"> /mo</span></div>
      <ul className="text-sm space-y-1">{features.map((f)=> <li key={f}>• {f}</li>)}</ul>
      <button className="btn w-full" disabled={name!="Free" && locked} title={name!="Free" && locked ? `Upgrades open on ${new Date(untilISO!).toLocaleDateString()}` : ""}>
        {name==="Free" ? "Current plan" : "Choose " + name}
      </button>
    </div>
  );
}
