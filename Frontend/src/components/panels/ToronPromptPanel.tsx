import React, { useEffect, useMemo, useState } from "react";
import { Bot, Signal } from "lucide-react";
import { CalendarEvent, ToronSignal, WorkspaceConnector, WorkspaceList, WorkspaceSchedule } from "@/types/workspace";

interface ToronPromptPanelProps {
  lists: WorkspaceList[];
  events: CalendarEvent[];
  connectors: WorkspaceConnector[];
  schedule: WorkspaceSchedule[];
}

const ToronPromptPanel: React.FC<ToronPromptPanelProps> = ({ lists, events, connectors, schedule }) => {
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
    <div className="rounded-[32px] border border-black/10 bg-black/5 p-6 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-black/70 dark:text-white/70">
          <Bot className="h-4 w-4" /> Toron Prompt Panel
        </div>
        <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs text-purple-800 dark:text-purple-100">Listening</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-2xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="text-sm font-semibold text-black/80 dark:text-white/80">Live signals</div>
            <div className="mt-2 space-y-2 text-xs text-black/70 dark:text-white/70">
              {signals.slice(-4).map((signal) => (
                <div key={signal.id} className="flex items-center justify-between rounded-xl bg-black/10 px-3 py-2 dark:bg-white/10">
                  <span className="flex items-center gap-2">
                    <Signal className="h-3.5 w-3.5" />
                    {Object.keys(signal.payload).join(", ") || "payload"}
                  </span>
                  <span className="text-[10px] uppercase text-black/50 dark:text-white/50">
                    {new Date(signal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
              {!signals.length && <p className="text-black/60 dark:text-white/60">Waiting for toron-signal events.</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-black/80 dark:text-white/80">
            <div className="rounded-2xl border border-black/10 bg-black/5 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase text-black/60 dark:text-white/60">Lists</div>
              <div className="text-xl font-semibold">{aggregated.lists}</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-black/5 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase text-black/60 dark:text-white/60">Tasks</div>
              <div className="text-xl font-semibold">{aggregated.tasks}</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-black/5 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase text-black/60 dark:text-white/60">Connectors</div>
              <div className="text-xl font-semibold">{aggregated.connectors}</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-black/5 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase text-black/60 dark:text-white/60">Calendar</div>
              <div className="text-xl font-semibold">{aggregated.events}</div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl border border-purple-400/30 bg-purple-500/10 p-4 shadow-inner">
            <label className="text-xs uppercase text-purple-800 dark:text-purple-100">Analyze with Toron</label>
            <textarea
              className="mt-2 h-28 w-full rounded-2xl border border-black/10 bg-black/5 p-3 text-sm text-black/80 focus:outline-none dark:border-white/10 dark:bg-white/10 dark:text-white/80"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className="mt-3 rounded-full bg-[#6d4aff] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_18px_rgba(0,0,0,0.18)] transition hover:scale-[1.01]"
              onClick={runAnalysis}
            >
              Generate insight
            </button>
          </div>
          <div className="rounded-2xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="text-sm font-semibold text-black/80 dark:text-white/80">Toron response</div>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">{analysis}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToronPromptPanel;
