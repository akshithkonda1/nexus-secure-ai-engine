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

const glassPanelClass =
  "relative bg-glass backdrop-blur-2xl border border-glassBorder shadow-glass rounded-3xl px-6 py-5 transition-all duration-300 before:absolute before:inset-0 before:rounded-3xl before:bg-glassInner before:blur-xl before:pointer-events-none hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong hover:scale-[1.01]";

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
    <div className={`${glassPanelClass} flex flex-col gap-4`}>
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
              className="rounded-full border border-glassBorder px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-textPrimary transition hover:border-glassBorderStrong"
            >
              Close
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className={`${glassPanelClass} p-4 shadow-none`}>
            <div className="text-sm font-semibold text-textPrimary">Live signals</div>
            <div className="mt-2 space-y-2 text-xs text-textMuted">
              {signals.slice(-4).map((signal) => (
                <div key={signal.id} className="flex items-center justify-between rounded-xl border border-glassBorder bg-glass px-3 py-2">
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
            <div className={`${glassPanelClass} p-3 shadow-none`}>
              <div className="text-xs uppercase text-textMuted">Lists</div>
              <div className="text-xl font-semibold">{aggregated.lists}</div>
            </div>
            <div className={`${glassPanelClass} p-3 shadow-none`}>
              <div className="text-xs uppercase text-textMuted">Tasks</div>
              <div className="text-xl font-semibold">{aggregated.tasks}</div>
            </div>
            <div className={`${glassPanelClass} p-3 shadow-none`}>
              <div className="text-xs uppercase text-textMuted">Connectors</div>
              <div className="text-xl font-semibold">{aggregated.connectors}</div>
            </div>
            <div className={`${glassPanelClass} p-3 shadow-none`}>
              <div className="text-xs uppercase text-textMuted">Calendar</div>
              <div className="text-xl font-semibold">{aggregated.events}</div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl border border-purple-400/30 bg-purple-500/10 p-4 shadow-inner">
            <label className="text-xs uppercase text-purple-900 dark:text-purple-100">Analyze with Toron</label>
            <textarea
              className="mt-2 h-28 w-full rounded-2xl border border-glassBorder bg-glass px-3 py-2 text-sm text-textPrimary focus:border-glassBorderStrong focus:outline-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className="mt-3 rounded-full bg-[#6d4aff] px-4 py-2 text-sm font-semibold text-textPrimary shadow-glass transition hover:scale-[1.01]"
              onClick={runAnalysis}
            >
              Generate insight
            </button>
          </div>
          <div className={`${glassPanelClass} p-4 shadow-none`}>
            <div className="text-sm font-semibold text-textPrimary">Toron response</div>
            <p className="mt-2 text-sm text-textMuted">{analysis}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToronPromptPanel;
