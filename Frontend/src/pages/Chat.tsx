import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mic, Paperclip, Send, Sparkles } from "lucide-react";
import { ConsentModal } from "@/components/ConsentModal";
import { SurveyTooltip } from "@/components/SurveyTooltip";
import { Panel } from "@/shared/ui/Panel";
import { DebateResponse, useDebateStore } from "@/stores/debateStore";

/* ---------------------------
   Score badge color helpers
--------------------------- */
const SCORE_COLORS = {
  high: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 border-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-200 border-amber-500/30",
  low: "bg-rose-500/10 text-rose-700 dark:text-rose-200 border-rose-500/30",
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
    if (!isLink) return <span key={`t-${index}`}>{part}</span>;
    return (
      <a
        key={`a-${index}`}
        href={part}
        target="_blank"
        rel="noreferrer noopener"
        className="text-trustBlue underline decoration-trustBlue/40 underline-offset-2 transition hover:text-trustBlue/80"
      >
        {part}
      </a>
    );
  });
}

/* ---------------------------
   Message bubbles
--------------------------- */
function SystemBubble() {
  return (
    <div className="flex justify-center">
      <div className="max-w-[75ch] rounded-2xl border border-white/10 bg-panel px-4 py-3 text-sm text-ink shadow-sm">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-trustBlue" aria-hidden="true" />
          <div>
            <p className="text-xs uppercase tracking-wide">
              <span className="font-semibold">Beta —</span> Your queries help improve our AI process and your experience.
            </p>
            <p className="mt-2 text-sm text-ink/80">
              Nexus.ai orchestrates a debate between Generative AI models while looking at web results to validate,
              scoring every response and synthesizing a consensus you can trust.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75ch] whitespace-pre-wrap rounded-2xl border border-trustBlue/20 bg-trustBlue/10 px-4 py-3 text-ink shadow-sm">
        {text}
      </div>
    </div>
  );
}

function AssistantConsensus({ text, overallScore }: { text: string; overallScore: number | null }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[75ch] rounded-2xl border border-white/10 bg-panel px-4 py-4 text-ink shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide">Consensus</h2>
        <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">{text}</p>
        {overallScore !== null ? (
          <p className="mt-3 text-xs text-muted">
            Overall confidence score:{" "}
            <span className="font-semibold text-ink dark:text-app-text">{overallScore.toFixed(2)}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ModelBubble({ response }: { response: DebateResponse }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[75ch] rounded-2xl border border-white/10 bg-panel px-4 py-4 text-ink shadow-sm">
        <div className="flex items-center justify-between gap-3 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-trustBlue/10 text-xs uppercase tracking-wide text-trustBlue">
              {response.model.slice(0, 2)}
            </span>
            <span>{response.model}</span>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${getScoreColor(
              response.score,
            )}`}
          >
            Score {response.score.toFixed(2)}
          </span>
        </div>
        <div className="mt-3 text-[15px] leading-relaxed">{renderTextWithLinks(response.text)}</div>
      </div>
    </div>
  );
}

/* ---------------------------
   Sticky bottom composer
--------------------------- */
function Composer({
  value,
  setValue,
  onSend,
  busy,
  onAttachFiles,
}: {
  value: string;
  setValue: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  onAttachFiles: (files: FileList) => void;
}) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // autogrow textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.min(220, Math.max(56, ta.scrollHeight)) + "px";
  }, [value]);

  return (
    <div className="sticky bottom-0 z-10 border-t border-app bg-app-surface/92 backdrop-blur supports-[backdrop-filter]:bg-app-surface/80">
      <div className="mx-auto w-full max-w-3xl px-4 py-3">
        <div className="rounded-2xl border border-app bg-panel shadow-inner">
          <div className="flex items-end gap-2 px-3 pt-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mb-2 inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-app px-2 text-muted transition hover:text-ink"
              title="Attach"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <textarea
              ref={taRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Message Nexus…"
              className="min-h-[56px] max-h-[220px] w-full resize-none bg-transparent px-1 py-2 text-[15px] text-ink outline-none placeholder:text-muted"
            />

            <button
              type="button"
              className="mb-2 inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-app px-2 text-muted transition hover:text-ink"
              title="Voice"
              onClick={() => {
                // just emit; your UserBar voice handler can listen if you keep it
                window.dispatchEvent(new CustomEvent("nexus:voice:recording", { detail: { state: "toggle" } }));
              }}
            >
              <Mic className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onSend}
              disabled={!value.trim() || busy}
              className="mb-2 inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-trustBlue px-3 text-sm font-semibold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-lg disabled:opacity-50"
              title="Send"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-app px-3 py-2">
            <p className="text-xs text-muted">Shift + Enter for new line</p>
            {/* spacer */}
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length) onAttachFiles(e.target.files);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}

/* ---------------------------
   Main Chat (ChatGPT layout)
--------------------------- */
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
  const [lastSent, setLastSent] = useState<string | null>(null);

  // keep store query in sync (debounced)
  useEffect(() => setInputValue(query), [query]);
  useEffect(() => {
    const handler = setTimeout(() => setQuery(inputValue), 250);
    return () => clearTimeout(handler);
  }, [inputValue, setQuery]);

  // survey trigger
  useEffect(() => {
    if (!surveyTriggered && !surveyDismissed && telemetryOptIn && queryCount >= 5) {
      setSurveyTriggered(true);
    }
  }, [queryCount, surveyTriggered, surveyDismissed, telemetryOptIn]);

  // prompt/attach/voice events -> input
  useEffect(() => {
    const onPrompt = (e: Event) => {
      const p = (e as CustomEvent<string>).detail;
      if (typeof p === "string") setInputValue((v) => (v ? v + "\n" : "") + p);
    };
    const onAttach = (e: Event) => {
      const files = (e as CustomEvent<FileList>).detail;
      if (files?.length) {
        const names = Array.from(files).map((f) => f.name).join(", ");
        setInputValue((v) => (v ? v + "\n" : "") + `Attached: ${names}`);
      }
    };
    const onVoice = (e: Event) => {
      const partial = (e as CustomEvent<string>).detail;
      if (partial) setInputValue(partial);
    };
    window.addEventListener("nexus:prompt:insert", onPrompt as EventListener);
    window.addEventListener("nexus:attach", onAttach as EventListener);
    window.addEventListener("nexus:voice:partial", onVoice as EventListener);
    return () => {
      window.removeEventListener("nexus:prompt:insert", onPrompt as EventListener);
      window.removeEventListener("nexus:attach", onAttach as EventListener);
      window.removeEventListener("nexus:voice:partial", onVoice as EventListener);
    };
  }, []);

  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [responses.length, consensus, loading]);

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    if (error) clearError();
    const q = inputValue.trim();
    if (!q) return;
    setLastSent(q);
    void submitQuery(q);
    setInputValue("");
    setQuery("");
    window.dispatchEvent(new CustomEvent("nexus:chat:send", { detail: { text: q } }));
  };

  return (
    <div className="min-h-screen">
      <ConsentModal />

      {/* Messages column (centered) */}
      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-3xl flex-col">
        {/* Scrollable feed */}
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-28">
          <div ref={listRef} className="space-y-4">
            <SystemBubble />

            {/* last sent user question (basic echo so page feels conversational) */}
            {lastSent ? <UserBubble text={lastSent} /> : null}

            {/* loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/10 bg-panel px-4 py-3 text-muted">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Querying models…
                </div>
              </div>
            )}

            {/* error bubble */}
            {!loading && error ? (
              <div className="flex justify-start">
                <div className="max-w-[75ch] rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-200">
                  {error}
                </div>
              </div>
            ) : null}

            {/* consensus + model replies */}
            {!loading && !error && consensus ? (
              <AssistantConsensus text={consensus} overallScore={overallScore} />
            ) : null}

            {!loading && !error && responses.length > 0
              ? responses.map((r) => <ModelBubble key={`${r.model}-${r.score}`} response={r} />)
              : null}

            {/* empty state */}
            {!loading && responses.length === 0 && !error && !lastSent ? (
              <div className="flex justify-center">
                <Panel className="border-dashed p-8 text-center text-sm text-muted">
                  Ask your first question to spark a debate.
                </Panel>
              </div>
            ) : null}
          </div>
        </div>

        {/* Sticky composer */}
        <form onSubmit={handleSubmit}>
          <Composer
            value={inputValue}
            setValue={setInputValue}
            onSend={() => handleSubmit()}
            busy={loading}
            onAttachFiles={(files) => window.dispatchEvent(new CustomEvent("nexus:attach", { detail: files }))}
          />
        </form>
      </div>

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
