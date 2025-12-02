import React, { useState } from "react";
import { Bot, Signal } from "lucide-react";

const ToronPromptPanel: React.FC = () => {
  const [prompt, setPrompt] = useState("Analyze workspace signals and propose my next three moves.");
  const [response, setResponse] = useState("Toron is online. Ready to synthesize your pages, notes, boards, and flows.");

  const handleAnalyze = () => {
    const next = `Toron pulled liquid nodes, mapped intents, and is drafting aligned actions. Prompt: ${prompt}`;
    setResponse(next);
    window.dispatchEvent(new CustomEvent("toron-signal", { detail: { prompt } }));
  };

  return (
    <div className="fade-in scale-in mx-auto max-w-3xl rounded-[32px] border border-white/15 bg-gradient-to-br from-[#1b1f30]/90 via-[#13192a]/90 to-[#0c1222]/90 p-8 text-white shadow-[0_12px_48px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
          <Bot className="h-4 w-4" /> Analyze with Toron
        </div>
        <span className="rounded-full bg-[#6d4aff]/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white">Listening</span>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80">
            <div className="text-xs uppercase tracking-[0.2em] text-white/60">Live Signals</div>
            <div className="mt-3 space-y-2 text-sm">
              {["Pages", "Notes", "Boards", "Flows"].map((signal) => (
                <div key={signal} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-3 py-2 text-white/80">
                  <div className="flex items-center gap-2">
                    <Signal className="h-4 w-4 text-white/60" />
                    {signal} sync
                  </div>
                  <span className="text-[11px] uppercase tracking-wide text-white/50">live</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <div className="text-xs uppercase tracking-[0.2em] text-white/60">Last action</div>
            <p className="mt-2 text-white/70">Filed actionable tasks in your Boards and updated Flow orchestration.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="text-xs uppercase tracking-[0.2em] text-white/60">Prompt Toron</label>
            <textarea
              className="mt-2 h-32 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white/80 focus:outline-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className="mt-3 w-full rounded-full bg-[#6d4aff] px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(109,74,255,0.4)] transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleAnalyze}
            >
              Generate insight
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80">
            <div className="text-xs uppercase tracking-[0.2em] text-white/60">Toron response</div>
            <p className="mt-2 text-sm text-white/70">{response}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToronPromptPanel;
