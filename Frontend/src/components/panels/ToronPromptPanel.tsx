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
    <div className="rounded-[32px] border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-6 text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-[var(--border)] dark:bg-[var(--glass)] dark:text-[var(--text)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
          <Bot className="h-4 w-4" /> Toron Prompt Panel
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs text-purple-800 dark:text-purple-100">Listening</span>
          {close && (
            <button
              onClick={close}
              className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-1 text-[11px] uppercase tracking-wide text-[color-mix(in_oklab,var(--text)_70%,transparent)]"
            >
              Close
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-4 dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
            <div className="text-sm font-semibold text-[var(--text)] dark:text-[var(--text)]">Live signals</div>
            <div className="mt-2 space-y-2 text-xs text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
              {signals.slice(-4).map((signal) => (
                <div key={signal.id} className="flex items-center justify-between rounded-xl bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] px-3 py-2 dark:bg-[var(--glass)]">
                  <span className="flex items-center gap-2">
                    <Signal className="h-3.5 w-3.5" />
                    {Object.keys(signal.payload).join(", ") || "payload"}
                  </span>
                  <span className="text-[10px] uppercase text-textPrimary/50 dark:text-textPrimary/50">
                    {new Date(signal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
              {!signals.length && <p className="text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">Waiting for toron-signal events.</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-[var(--text)] dark:text-[var(--text)]">
            <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-3 dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
              <div className="text-xs uppercase text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">Lists</div>
              <div className="text-xl font-semibold">{aggregated.lists}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-3 dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
              <div className="text-xs uppercase text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">Tasks</div>
              <div className="text-xl font-semibold">{aggregated.tasks}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-3 dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
              <div className="text-xs uppercase text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">Connectors</div>
              <div className="text-xl font-semibold">{aggregated.connectors}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-3 dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
              <div className="text-xs uppercase text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">Calendar</div>
              <div className="text-xl font-semibold">{aggregated.events}</div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl border border-purple-400/30 bg-purple-500/10 p-4 shadow-inner">
            <label className="text-xs uppercase text-purple-800 dark:text-purple-100">Analyze with Toron</label>
            <textarea
              className="mt-2 h-28 w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-3 text-sm text-[var(--text)] focus:outline-none dark:border-[var(--border)] dark:bg-[var(--glass)] dark:text-[var(--text)]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className="mt-3 rounded-full bg-[#6d4aff] px-4 py-2 text-sm font-semibold text-textPrimary shadow-[0_4px_18px_rgba(0,0,0,0.18)] transition hover:scale-[1.01]"
              onClick={runAnalysis}
            >
              Generate insight
            </button>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-4 dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
            <div className="text-sm font-semibold text-[var(--text)] dark:text-[var(--text)]">Toron response</div>
            <p className="mt-2 text-sm text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">{analysis}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToronPromptPanel;
