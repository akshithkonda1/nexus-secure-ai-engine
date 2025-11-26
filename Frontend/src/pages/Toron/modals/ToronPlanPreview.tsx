import { motion, AnimatePresence } from "framer-motion";

import { DecisionBlock } from "../toronTypes";

type ToronPlanPreviewProps = {
  open: boolean;
  plan: DecisionBlock | null;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
};

export default function ToronPlanPreview({ open, plan, onApprove, onReject, onClose }: ToronPlanPreviewProps) {
  if (!plan) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900/70"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            style={{ backdropFilter: "blur(16px) saturate(140%)" }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white hover:bg-white/30"
            >
              Close
            </button>
            <div className="mb-4 text-sm uppercase tracking-wide text-cyan-200">Proposed Plan</div>
            <h2 className="mb-1 text-2xl font-semibold text-white">{plan.plan_name}</h2>
            <p className="mb-4 text-sm text-slate-200">User intent: {plan.user_instructions}</p>
            <div className="mb-4 flex items-center gap-3 text-sm text-white">
              <span className="rounded-full bg-green-500/20 px-3 py-1 font-semibold text-green-100">Safety: {plan.risk}</span>
              <span className="rounded-full bg-blue-500/20 px-3 py-1 font-semibold text-blue-100">
                Reversible: {plan.reversible ? "Yes" : "No"}
              </span>
            </div>
            <div className="grid gap-3 rounded-xl bg-white/5 p-4 text-white">
              {plan.steps.map((step) => (
                <div
                  key={step.index}
                  className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-sm font-bold text-white">
                    {step.index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold uppercase tracking-wide text-cyan-100">{step.action}</div>
                    <pre className="mt-1 whitespace-pre-wrap text-xs text-slate-200">
                      {JSON.stringify(step.params, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-white">
              {Object.entries(plan.model_votes ?? {}).map(([model, vote]) => (
                <div key={model} className="rounded-lg bg-white/5 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-200">{model}</div>
                  <div className="mt-1 h-2 w-full rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" style={{ width: "80%" }} />
                  </div>
                  <div className="mt-1 text-sm font-semibold">{String(vote)}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={onReject}
                className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30"
              >
                Approve & Execute
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

