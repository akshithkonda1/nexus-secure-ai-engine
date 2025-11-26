import { memo } from "react";

import { safeRender } from "@/shared/lib/safeRender";
import { safeArray, safeString } from "@/shared/lib/toronSafe";
import type { MicroAgentResult } from "../toronTypes";

interface MicroAgentRunnerProps {
  results?: MicroAgentResult[];
}

const Runner = ({ results }: MicroAgentRunnerProps) =>
  safeRender(
    () => (
      <div className="space-y-2 rounded-lg border border-[var(--border-strong)] bg-[var(--panel-strong)] p-4" data-testid="micro-agent-runner">
        <h4 className="text-sm font-semibold text-[var(--text-primary)]">Micro Agents</h4>
        <ul className="space-y-1 text-sm text-[var(--text-primary)]">
          {safeArray(results, []).map((result, idx) => (
            <li key={safeString(result.action, String(idx))} className="rounded border border-[var(--border-soft)] bg-[var(--panel-soft)] px-2 py-1">
              <span className="font-semibold">{safeString(result.action, "action")}</span> · {safeString(result.status, "pending")}
              {result.error && <span className="ml-2 text-[var(--text-secondary)]">{safeString(result.error)}</span>}
            </li>
          ))}
          {safeArray(results, []).length === 0 && (
            <li className="rounded border border-dashed border-[var(--border-soft)] bg-[var(--panel-soft)] px-2 py-1 text-xs text-[var(--text-secondary)]">
              No agents running.
            </li>
          )}
        </ul>
      </div>
    ),
    <div className="rounded border border-[var(--border-soft)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--text-secondary)]">
      Micro agents unavailable.
    </div>,
  );

export const MicroAgentRunner = memo(Runner);

export default MicroAgentRunner;
