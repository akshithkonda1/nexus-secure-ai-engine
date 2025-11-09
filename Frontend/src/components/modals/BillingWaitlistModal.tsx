import { useModal } from "@/state/useModal";
import { useForm } from "react-hook-form";

type FormValues = {
  whyNexus: string;
  whyPlatform: string;
  useCase: string;
  email?: string;
};

export function BillingWaitlistModal() {
  const { openKey, close } = useModal();
  const open = openKey === "billing-waitlist";
  const { register, handleSubmit, reset } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "billing", ...values })
      });
      alert("Thanks! You’re on the billing waitlist.");
      reset();
      close();
    } catch (error) {
      console.error("Failed to reach waitlist endpoint", error);
      localStorage.setItem("nexus_waitlist_billing", JSON.stringify(values));
      alert("Saved locally. We’ll sync when online.");
      reset();
      close();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40">
      <div className="w-full max-w-xl rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-2xl">
        <h3 className="text-xl font-semibold">Billing & usage is almost ready</h3>
        <p className="mt-1 text-[color:rgba(var(--text)/.75)]">
          We’re finishing subscriptions, invoices, and usage analytics. Join the waitlist:
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm">1) Why did you choose Nexus?</span>
            <textarea
              {...register("whyNexus", { required: true })}
              rows={3}
              className="mt-1 w-full rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] p-3"
              placeholder="e.g., trust layer, multi-model orchestration, privacy…"
            />
          </label>

          <label className="block">
            <span className="text-sm">2) Why did you decide Nexus was the AI platform for you?</span>
            <textarea
              {...register("whyPlatform", { required: true })}
              rows={3}
              className="mt-1 w-full rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] p-3"
            />
          </label>

          <label className="block">
            <span className="text-sm">3) What are you using Nexus for?</span>
            <textarea
              {...register("useCase", { required: true })}
              rows={3}
              className="mt-1 w-full rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] p-3"
              placeholder="e.g., audits, research briefs, analytics, support…"
            />
          </label>

          <label className="block">
            <span className="text-sm">Contact email (optional)</span>
            <input
              {...register("email")}
              type="email"
              className="mt-1 w-full rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] p-3"
              placeholder="you@company.com"
            />
          </label>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="rounded-xl border border-[color:rgba(var(--border))] px-4 py-2"
            >
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-brand px-4 py-2 text-white">
              Join waitlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
