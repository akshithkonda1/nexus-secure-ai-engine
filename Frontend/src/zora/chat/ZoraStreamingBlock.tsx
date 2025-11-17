import React from "react";

type Source = { title?: string; url: string };

type Answer = {
  text: string;
  model?: string;
  sources?: Source[];
};

type Props = {
  firstAnswer?: Answer | null;
  partialAnswer?: Answer | null;
  finalAnswer?: Answer | null;
  streamError?: string | null;
  isStreaming: boolean;
  progressPercent: number;
};

const ZoraStreamingBlock: React.FC<Props> = ({
  firstAnswer,
  partialAnswer,
  finalAnswer,
  streamError,
  isStreaming,
  progressPercent,
}) => {
  return (
    <div
      className="rounded-xl border border-sky-500/40 bg-sky-900/30 p-3 text-xs text-slate-50 shadow-sm backdrop-blur-xl animate-aurora-pulse"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold">Aurora Stream</p>
          <p className="text-[11px] text-slate-200/80">
            Multi-model debate, verification, and synthesis in motion.
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-200/80">
          <span className="font-medium">
            {isStreaming ? "Streaming" : "Complete"}
          </span>
          <span className="ml-1 text-slate-400">· {progressPercent}%</span>
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-900/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {streamError && (
        <p className="mt-2 text-[11px] text-rose-300">{streamError}</p>
      )}
      {firstAnswer && (
        <div className="mt-3 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
            First Glimpse
          </p>
          <p className="whitespace-pre-wrap text-xs text-slate-50">
            {firstAnswer.text}
          </p>
          {firstAnswer.model && (
            <p className="text-[10px] text-slate-300">
              via {firstAnswer.model}
            </p>
          )}
        </div>
      )}
      {partialAnswer && (
        <div className="mt-3 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
            Emerging Harmony
          </p>
          <p className="whitespace-pre-wrap text-xs text-slate-50">
            {partialAnswer.text}
          </p>
        </div>
      )}
      {finalAnswer && (
        <div className="mt-3 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
            Verified Synthesis
          </p>
          <p className="whitespace-pre-wrap text-xs text-slate-50">
            {finalAnswer.text}
          </p>
          {finalAnswer.sources && finalAnswer.sources.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] font-semibold text-slate-300">
                Sources
              </p>
              <div className="space-y-1">
                {finalAnswer.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[11px] text-sky-300 hover:underline"
                  >
                    {source.title || source.url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ZoraStreamingBlock;
