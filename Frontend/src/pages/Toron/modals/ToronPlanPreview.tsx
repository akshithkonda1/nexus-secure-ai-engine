import { memo } from "react";

import { safeRender } from "@/shared/lib/safeRender";
import { safeArray, safeString } from "@/shared/lib/toronSafe";
import type { DecisionBlock } from "../toronTypes";

interface ToronPlanPreviewProps {
  plan?: DecisionBlock | null;
}

const PlanPreview = ({ plan }: ToronPlanPreviewProps) =>
  safeRender(
    () => {
      if (!plan) {
        return (
          <div className="rounded-lg border border-dashed border-[var(--border-soft)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--text-secondary)]">
            No plan available yet.
          </div>
        );
      }

      return (
        <div className="space-y-2 rounded-lg border border-[var(--border-strong)] bg-[var(--panel-strong)] p-4 shadow">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">{safeString(plan.plan_name, "Plan")}</h4>
            <span className="text-xs text-[var(--text-secondary)]">Risk: {safeString(plan.risk, "n/a")}</span>
          </div>
          <ol className="space-y-1 text-sm text-[var(--text-primary)]">
            {safeArray(plan.steps, []).map((step) => (
              <li key={safeString(step.action)} className="rounded border border-[var(--border-soft)] bg-[var(--panel-soft)] px-2 py-1">
                <span className="font-semibold">{safeString(step.action)}</span> — step {step.index ?? 0}
              </li>
            ))}
          </ol>
        </div>
      );
    },
    <div className="rounded border border-[var(--border-soft)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--text-secondary)]">
      Plan preview unavailable.
    </div>,
  );

export const ToronPlanPreview = memo(PlanPreview);

export default ToronPlanPreview;
