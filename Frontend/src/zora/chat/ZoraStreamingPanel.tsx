"use client";

import React from "react";

import { DebateAnswer } from "@/hooks/useStreamingDebate";

type Props = {
  firstAnswer: DebateAnswer | null;
  partialAnswer: DebateAnswer | null;
  finalAnswer: DebateAnswer | null;
  progress: number;
  isStreaming: boolean;
  error?: string | null;
};

const Section: React.FC<{ title: string; answer?: DebateAnswer | null }> = ({
  title,
  answer,
}) => (
  <div className="rounded-2xl border border-white/20 bg-white/5 p-4 text-sm text-slate-900 shadow-inner backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/40 dark:text-slate-100">
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {title}
    </p>
    <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
      {answer?.text?.length ? answer.text : "Waiting for signal…"}
    </p>
    {answer?.sources?.length ? (
      <ul className="mt-2 list-inside list-disc text-xs text-slate-500 dark:text-slate-300">
        {answer.sources.slice(0, 4).map((source) => (
          <li key={`${source.url}-${source.title ?? source.snippet}`} className="truncate">
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:underline dark:text-sky-300"
            >
              {source.title ?? source.url}
            </a>
          </li>
        ))}
      </ul>
    ) : null}
  </div>
);

export function ToronStreamingPanel({
  firstAnswer,
  partialAnswer,
  finalAnswer,
  progress,
  isStreaming,
  error,
}: Props) {
  if (!firstAnswer && !partialAnswer && !finalAnswer && !error && !isStreaming) {
    return null;
  }

  const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
  const status = error
    ? "Aurora signal lost"
    : isStreaming
      ? "Aurora streaming"
      : "Aurora complete";

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/10 p-4 text-slate-900 shadow-lg backdrop-blur-2xl dark:border-slate-700/70 dark:bg-slate-900/40 dark:text-slate-50">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        <span>{status}</span>
        <span>{pct}%</span>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-slate-200/40 dark:bg-slate-700/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400"
          style={{ width: `${pct}%`, transition: "width 200ms ease" }}
        />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Section title="First glimpse" answer={firstAnswer} />
        <Section title="Emerging harmony" answer={partialAnswer} />
        <div className="space-y-3">
          <Section title="Final synthesis" answer={finalAnswer} />
          {error ? (
            <p className="rounded-2xl border border-rose-200/70 bg-rose-50/80 p-3 text-xs font-semibold text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-100">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
