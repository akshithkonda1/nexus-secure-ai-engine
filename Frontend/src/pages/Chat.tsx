import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, History, Loader2, Sparkles } from "lucide-react";
import { ConsentModal } from "@/components/ConsentModal";
import { SurveyTooltip } from "@/components/SurveyTooltip";
import { DebateResponse, useDebateStore } from "@/stores/debateStore";

const SCORE_COLORS = {
  high: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  medium: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  low: "bg-rose-500/20 text-rose-200 border-rose-500/40",
} as const;

function getScoreColor(score: number) {
  if (score >= 0.8) return SCORE_COLORS.high;
  if (score >= 0.5) return SCORE_COLORS.medium;
  return SCORE_COLORS.low;
}

function renderTextWithLinks(text: string) {
  const parts = text.split(/(https?:\/\/\S+)/g);
  return parts.map((part, index) => {
    const isLink = part.startsWith("http");
    if (!isLink) {
      return (
        <span key={`part-${index}`}>
          {part}
        </span>
      );
    }
    return (
      <a
        key={`link-${index}`}
        href={part}
        target="_blank"
        rel="noreferrer noopener"
        className="text-slate-200 underline decoration-slate-400 underline-offset-2 hover:text-white"
      >
        {part}
      </a>
    );
  });
}

function ResponseCard({ response }: { response: DebateResponse }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs uppercase tracking-wide">
            {response.model.slice(0, 2)}
          </span>
          <span>{response.model}</span>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getScoreColor(
            response.score,
          )}`}
        >
          Score {response.score.toFixed(2)}
        </span>
      </header>
      <p className="mt-4 text-sm leading-relaxed text-slate-200">
        {renderTextWithLinks(response.text)}
      </p>
    </article>
  );
}

export default function Chat() {
  const {
    responses,
    consensus,
    overallScore,
    loading,
    error,
    query,
    queryCount,
    telemetryOptIn,
    history,
    submitQuery,
    setQuery,
    clearError,
    logSurveyFeedback,
  } = useDebateStore((state) => ({
    responses: state.responses,
    consensus: state.consensus,
    overallScore: state.overallScore,
    loading: state.loading,
    error: state.error,
    query: state.query,
    queryCount: state.queryCount,
    telemetryOptIn: state.telemetryOptIn,
    history: state.history,
    submitQuery: state.submitQuery,
    setQuery: state.setQuery,
    clearError: state.clearError,
    logSurveyFeedback: state.logSurveyFeedback,
  }));

  const [inputValue, setInputValue] = useState(query);
  const [surveyTriggered, setSurveyTriggered] = useState(false);
  const [surveyDismissed, setSurveyDismissed] = useState(false);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setQuery(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue, setQuery]);

  useEffect(() => {
    if (!surveyTriggered && !surveyDismissed && telemetryOptIn && queryCount >= 5) {
      setSurveyTriggered(true);
    }
  }, [queryCount, surveyTriggered, surveyDismissed, telemetryOptIn]);

  const lastQueries = useMemo(() => history.slice(0, 5), [history]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (error) {
      clearError();
    }
    void submitQuery(inputValue);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
      <ConsentModal />
      <section aria-labelledby="chat-panel" className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-xl">
          <div className="flex flex-wrap items-center gap-3">
            <Sparkles className="h-5 w-5 text-slate-200" aria-hidden="true" />
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-200">
             Beta — Your Queries Help Improve our AI process and your experience! Please give us your feedback so we can improve our user experience.
            </p>
          </div>
          <p className="mt-3 text-sm text-slate-300">
             Nexus.ai orchestrates a debate between Generative AI models while looking at web results to validate, it even scores every response and semantically synthesizes a consensus
            you can trust.
            Nexus is zero bias. Nexus is accessible and uses the most secure methods to make sure that your requests are handled properly. 
            We believe that AI should be transparent and secure and that information and consensus should belong to the people.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <label htmlFor="chat-input" className="sr-only">
            Ask Nexus.ai a question
          </label>
          <textarea
            id="chat-input"
            name="chat"
            rows={3}
            required
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            aria-describedby={error ? "chat-error" : undefined}
            className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-base text-slate-100 shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
            placeholder=" Ask anything....."
          />
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Shift + Enter for new line</span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 disabled:opacity-60"
              disabled={loading || inputValue.trim().length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Querying models…
                </>
              ) : (
                <>
                  Submit
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
          {error ? (
            <p id="chat-error" className="mt-2 text-sm text-rose-300">
              {error}
            </p>
          ) : null}
        </form>

        <div
          className="space-y-6"
          aria-live="polite"
          aria-busy={loading}
          aria-label="Debate responses"
        >
          {loading ? (
            <div className="space-y-4" role="status">
              {[0, 1, 2].map((item) => (
                <div key={item} className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 rounded bg-slate-700/70" />
                    <div className="h-3 w-20 rounded-full bg-slate-700/70" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded bg-slate-700/60" />
                    <div className="h-3 w-11/12 rounded bg-slate-700/60" />
                    <div className="h-3 w-9/12 rounded bg-slate-700/60" />
                  </div>
                </div>
              ))}
              <span className="sr-only">Loading responses…</span>
            </div>
          ) : null}

          {!loading && responses.length === 0 && !error ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
              Ask your first question to spark a debate.
            </div>
          ) : null}

          {responses.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Consensus</h2>
                <p className="mt-3 text-base text-slate-100">{consensus}</p>
                {overallScore !== null ? (
                  <p className="mt-3 text-xs text-slate-400">
                    Overall confidence score: <span className="font-semibold text-slate-200">{overallScore.toFixed(2)}</span>
                  </p>
                ) : null}
              </div>
              <div className="space-y-4">
                {responses.map((response) => (
                  <ResponseCard key={`${response.model}-${response.score}`} response={response} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <aside className="space-y-6" aria-label="Recent queries">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-300" aria-hidden="true" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Recent queries</h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {lastQueries.length === 0 ? (
              <li className="text-slate-500">No history yet. Your last five questions will appear here.</li>
            ) : (
              lastQueries.map((item) => (
                <li key={item.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <p
                    className="text-xs leading-snug text-slate-200"
                    style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                  >
                    {item.query}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-500">
                    Score {item.overallScore !== null ? item.overallScore.toFixed(2) : "—"}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </aside>

      <SurveyTooltip
        open={surveyTriggered && !surveyDismissed}
        onSubmit={async (feedback) => {
          await logSurveyFeedback(feedback);
        }}
        onDismiss={() => setSurveyDismissed(true)}
      />
    </div>
  );
}
