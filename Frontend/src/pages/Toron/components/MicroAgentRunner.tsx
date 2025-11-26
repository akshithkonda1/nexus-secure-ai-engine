import { useMemo } from "react";

import { MicroAgentResult } from "../toronTypes";

type RunnerProps = {
  results: MicroAgentResult[];
  running: boolean;
};

const statusClass = {
  pending: "bg-yellow-500/20 text-yellow-100",
  running: "bg-blue-500/20 text-blue-100",
  completed: "bg-green-500/20 text-green-100",
  error: "bg-red-500/20 text-red-100",
};

export default function MicroAgentRunner({ results, running }: RunnerProps) {
  const ordered = useMemo(() => [...results].sort((a, b) => a.index - b.index), [results]);

  return (
    <div className="mt-4 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="mb-2 text-sm uppercase tracking-wide text-slate-200">
        Micro-Agent Execution {running ? "(in progress)" : ""}
      </div>
      <div className="space-y-3">
        {ordered.map((step) => (
          <div key={step.index} className="flex items-start gap-3 rounded-lg bg-white/5 p-3">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-sm font-bold text-white">
              {step.index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold uppercase tracking-wide text-cyan-100">{step.action}</span>
                <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusClass[step.status as keyof typeof statusClass] ?? statusClass.completed}`}>
                  {step.status}
                </span>
              </div>
              {step.error ? (
                <div className="mt-1 text-xs text-red-200">{step.error}</div>
              ) : (
                <pre className="mt-1 whitespace-pre-wrap text-xs text-slate-100">
                  {JSON.stringify(step.result ?? {}, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
        {!ordered.length && <div className="text-sm text-slate-200">No steps executed yet.</div>}
      </div>
    </div>
  );
}

