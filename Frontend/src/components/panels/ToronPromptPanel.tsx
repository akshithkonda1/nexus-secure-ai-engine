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
    <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#141827]/90 via-[#0f172a]/90 to-[#0b1220]/90 p-6 text-white shadow-[0_8px_32px_rgba(0,0,0,0.38)] backdrop-blur-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
          <Bot className="h-4 w-4" /> Toron Prompt Panel
        </div>
        <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-100">Listening</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white/80">Live signals</div>
            <div className="mt-2 space-y-2 text-xs text-white/70">
              {signals.slice(-4).map((signal) => (
                <div key={signal.id} className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2">
                  <span className="flex items-center gap-2">
                    <Signal className="h-3.5 w-3.5" />
                    {Object.keys(signal.payload).join(", ") || "payload"}
                  </span>
                  <span className="text-[10px] uppercase text-white/40">
                    {new Date(signal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
              {!signals.length && <p className="text-white/50">Waiting for toron-signal events.</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-white/80">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase text-white/50">Lists</div>
              <div className="text-xl font-semibold">{aggregated.lists}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase text-white/50">Tasks</div>
              <div className="text-xl font-semibold">{aggregated.tasks}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase text-white/50">Connectors</div>
              <div className="text-xl font-semibold">{aggregated.connectors}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase text-white/50">Calendar</div>
              <div className="text-xl font-semibold">{aggregated.events}</div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl border border-purple-400/30 bg-purple-500/10 p-4 shadow-inner">
            <label className="text-xs uppercase text-white/60">Analyze with Toron</label>
            <textarea
              className="mt-2 h-28 w-full rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-white/80 focus:outline-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className="mt-3 rounded-full bg-purple-500/80 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-500"
              onClick={runAnalysis}
            >
              Generate insight
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white/80">Toron response</div>
            <p className="mt-2 text-sm text-white/70">{analysis}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToronPromptPanel;
