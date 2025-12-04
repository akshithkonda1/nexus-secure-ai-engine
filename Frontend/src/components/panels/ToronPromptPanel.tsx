import React, { useEffect, useMemo, useState } from "react";
import { Bot, Signal } from "lucide-react";
import { CalendarEvent, ToronSignal, WorkspaceConnector, WorkspaceList, WorkspaceSchedule } from "@/types/workspace";

interface ToronPromptPanelProps {
  lists: WorkspaceList[];
  events: CalendarEvent[];
  connectors: WorkspaceConnector[];
  schedule: WorkspaceSchedule[];
  close?: () => void;
}

const surfaceClass =
  "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl p-6 z-10";

const ToronPromptPanel: React.FC<ToronPromptPanelProps> = ({ lists, events, connectors, schedule, close }) => {
  const [signals, setSignals] = useState<ToronSignal[]>([]);
  const [prompt, setPrompt] = useState("Analyze intent signals and propose actions.");
  const [analysis, setAnalysis] = useState("Toron is ready to synthesize workspace signals.");

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent;
      setSignals((prev) => [...prev, { id: crypto.randomUUID(), payload: custom.detail, timestamp: Date.now() }]);
    };
    window.addEventListener("toron-signal", handler);
    return () => window.removeEventListener("toron-signal", handler);
  }, []);

  const aggregated = useMemo(
    () => ({
      lists: lists.length,
      tasks: schedule.reduce((acc, block) => acc + block.items.length, 0),
      connectors: connectors.filter((c) => c.status === "connected").length,
      events: events.length,
    }),
    [connectors, events, lists.length, schedule],
  );

  const runAnalysis = () => {
    const summary = `Toron read ${aggregated.lists} lists, ${aggregated.tasks} tasks, ${aggregated.connectors} connectors, and ${aggregated.events} calendar signals. ${prompt}`;
    setAnalysis(summary);
    window.dispatchEvent(new CustomEvent("toron-signal", { detail: { prompt, aggregated } }));
  };

  return (
    <div className={`${surfaceClass} flex flex-col gap-4`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-textSecondary">
          <Bot className="h-4 w-4" /> Toron Prompt Panel
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-900 dark:text-purple-100">
            Listening
          </span>
          {close && (
            <button
              onClick={close}
              className="rounded-full border border-neutral-300/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-textPrimary transition hover:border-neutral-400 dark:border-neutral-700/50 dark:hover:border-neutral-600"
            >
              Close
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className={`${surfaceClass} p-4`}>
            <div className="text-sm font-semibold text-textPrimary">Live signals</div>
            <div className="mt-2 space-y-2 text-xs text-textMuted">
              {signals.slice(-4).map((signal) => (
                <div
                  key={signal.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-300/50 bg-white/85 px-3 py-2 backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85"
                >
                  <span className="flex items-center gap-2 text-textPrimary">
                    <Signal className="h-3.5 w-3.5" />
                    {Object.keys(signal.payload).join(", ") || "payload"}
                  </span>
                  <span className="text-[10px] uppercase text-textMuted">
                    {new Date(signal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
              {!signals.length && <p className="text-textMuted">Waiting for toron-signal events.</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-textPrimary">
            <div className={`${surfaceClass} p-3`}>
              <div className="text-xs uppercase text-textMuted">Lists</div>
              <div className="text-xl font-semibold">{aggregated.lists}</div>
            </div>
            <div className={`${surfaceClass} p-3`}>
              <div className="text-xs uppercase text-textMuted">Tasks</div>
              <div className="text-xl font-semibold">{aggregated.tasks}</div>
            </div>
            <div className={`${surfaceClass} p-3`}>
              <div className="text-xs uppercase text-textMuted">Connectors</div>
              <div className="text-xl font-semibold">{aggregated.connectors}</div>
            </div>
            <div className={`${surfaceClass} p-3`}>
              <div className="text-xs uppercase text-textMuted">Calendar</div>
              <div className="text-xl font-semibold">{aggregated.events}</div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl border border-purple-400/30 bg-purple-500/10 p-4 shadow-inner">
            <label className="text-xs uppercase text-purple-900 dark:text-purple-100">Analyze with Toron</label>
            <textarea
              className="mt-2 h-28 w-full rounded-2xl border border-neutral-300/50 bg-white/85 px-3 py-2 text-sm text-textPrimary focus:border-neutral-400 focus:outline-none backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85 dark:focus:border-neutral-600"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className="mt-3 rounded-full bg-[#6d4aff] px-4 py-2 text-sm font-semibold text-textPrimary shadow-[0_4px_20px_rgba(0,0,0,0.10)] transition hover:scale-[1.01]"
              onClick={runAnalysis}
            >
              Generate insight
            </button>
          </div>
          <div className={`${surfaceClass} p-4`}>
            <div className="text-sm font-semibold text-textPrimary">Toron response</div>
            <p className="mt-2 text-sm text-textMuted">{analysis}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToronPromptPanel;
