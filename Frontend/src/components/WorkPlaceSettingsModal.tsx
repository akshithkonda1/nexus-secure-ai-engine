import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export const FEEDBACK_MAX_LENGTH = 15000;
export const FEEDBACK_CATEGORIES = [
  "Product vision",
  "Model quality",
  "Safety & trust",
  "UI polish",
  "Other",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export type FeedbackDraft = {
  message: string;
  category: FeedbackCategory;
  contact?: string;
};

export type FeedbackHistoryEntry = {
  id: string;
  submittedAt: string;
  message: string;
  category: FeedbackCategory;
  contact?: string;
};

export type WorkPlaceSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmitFeedback: (draft: FeedbackDraft) => Promise<void> | void;
  history?: FeedbackHistoryEntry[];
  onDeleteEntry?: (id: string) => void;
};

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {children}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return iso;
  }
}

export default function WorkPlaceSettingsModal({
  open,
  onClose,
  onSubmitFeedback,
  history = [],
  onDeleteEntry,
}: WorkPlaceSettingsModalProps) {
  const titleId = useId();
  const descId = useId();
  const formId = useId();

  const dialogRef = useRef<HTMLElement | null>(null);
  const firstControlRef = useRef<HTMLTextAreaElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const successTimeout = useRef<number | null>(null);
  const isMounted = useRef(false);

  const [draft, setDraft] = useState<FeedbackDraft>(() => ({
    message: "",
    category: FEEDBACK_CATEGORIES[0],
    contact: "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  const trimmedMessage = draft.message.trim();
  const charactersRemaining = FEEDBACK_MAX_LENGTH - draft.message.length;
  const isOverLimit = charactersRemaining < 0;
  const canSubmit = trimmedMessage.length > 0 && !isOverLimit && !submitting;

  const sortedHistory = useMemo(
    () =>
      [...history].sort((a, b) =>
        a.submittedAt < b.submittedAt ? 1 : a.submittedAt > b.submittedAt ? -1 : 0
      ),
    [history]
  );

  const categoryCounts = useMemo(() => {
    const base = FEEDBACK_CATEGORIES.reduce(
      (acc, category) => ({ ...acc, [category]: 0 }),
      {} as Record<FeedbackCategory, number>
    );
    return sortedHistory.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] ?? 0) + 1;
      return acc;
    }, base);
  }, [sortedHistory]);

  const mostActiveCategory = useMemo(() => {
    if (!sortedHistory.length) return draft.category;
    return FEEDBACK_CATEGORIES.reduce<FeedbackCategory | null>((current, category) => {
      if (!current) return category;
      return categoryCounts[category] > categoryCounts[current] ? category : current;
    }, null) ?? draft.category;
  }, [categoryCounts, draft.category, sortedHistory]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (successTimeout.current !== null) {
        window.clearTimeout(successTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const focusTimer = window.setTimeout(() => {
      firstControlRef.current?.focus();
    }, 0);

    const handleTabTrap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        [
          "button:not([disabled])",
          "input:not([disabled])",
          "textarea:not([disabled])",
          "select:not([disabled])",
          "[href]",
          "[tabindex]:not([tabindex='-1'])",
        ].join(",")
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", handleTabTrap);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleTabTrap);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  const clearStatusLater = useCallback(() => {
    if (successTimeout.current !== null) {
      window.clearTimeout(successTimeout.current);
    }
    successTimeout.current = window.setTimeout(() => {
      if (isMounted.current) {
        setStatus("idle");
      }
    }, 3200);
  }, []);

  const handleCategoryChange = useCallback((category: FeedbackCategory) => {
    setDraft((previous) => ({ ...previous, category }));
  }, []);

  const handleMessageChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = event.target.value;
      if (next.length > FEEDBACK_MAX_LENGTH) {
        setDraft((previous) => ({ ...previous, message: next.slice(0, FEEDBACK_MAX_LENGTH) }));
        return;
      }
      setDraft((previous) => ({ ...previous, message: next }));
    },
    []
  );

  const handleContactChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDraft((previous) => ({ ...previous, contact: event.target.value }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft({ message: "", category: FEEDBACK_CATEGORIES[0], contact: "" });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmitFeedback({
        message: trimmedMessage,
        category: draft.category,
        contact: draft.contact?.trim() ? draft.contact.trim() : undefined,
      });
      if (!isMounted.current) return;
      setStatus("sent");
      resetDraft();
      clearStatusLater();
      firstControlRef.current?.focus();
    } catch (error) {
      console.error("Failed to submit feedback", error);
      if (!isMounted.current) return;
      setStatus("error");
      clearStatusLater();
    } finally {
      if (isMounted.current) {
        setSubmitting(false);
      }
    }
  }, [canSubmit, clearStatusLater, draft.category, draft.contact, onSubmitFeedback, resetDraft, trimmedMessage]);

  useEffect(() => {
    if (!open) return;
    const handleHotkeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (event.shiftKey) {
          resetDraft();
        }
        onClose();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && (event.key.toLowerCase() === "s" || event.key === "Enter")) {
        event.preventDefault();
        handleSubmit();
      }
    };

    document.addEventListener("keydown", handleHotkeys);
    return () => document.removeEventListener("keydown", handleHotkeys);
  }, [handleSubmit, onClose, open, resetDraft]);

  const handleCopy = useCallback((message: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(message).catch(() => {
        console.warn("Clipboard write failed");
      });
      return;
    }
    try {
      const textarea = document.createElement("textarea");
      textarea.value = message;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch (error) {
      console.warn("Clipboard fallback failed", error);
    }
  }, []);

  if (!open) return null;

  const body = (
    <div
      className="modal-backdrop workspace-modal-backdrop"
      onClick={() => {
        onClose();
      }}
    >
      <section
        ref={dialogRef as any}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className={["workspace-modal", prefersReducedMotion ? "rm" : "animate-in"].join(" ")}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="workspace-modal-scroll">
          <header className="workspace-modal-header">
            <div className="workspace-modal-leading">
              <span className="workspace-modal-badge">Feedback studio</span>
              <div>
                <h2 id={titleId} className="workspace-modal-title">
                  System feedback
                </h2>
                <p id={descId} className="workspace-modal-subtitle">
                  Share unfiltered insights with the Nexus team. We review every note to shape the roadmap.
                </p>
              </div>
            </div>
            <div className="workspace-modal-header-actions">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-disabled={!canSubmit}
                className="workspace-modal-save"
                type="button"
              >
                Send feedback
              </button>
              <button
                onClick={onClose}
                aria-label="Close system feedback"
                className="workspace-modal-close"
                type="button"
                title="Close"
              >
                ×
              </button>
            </div>
          </header>

          <div className="workspace-modal-body">
            <section className="feedback-hero" style={{ minWidth: 840 }}>
              <article className="feedback-hero-card">
                <span className="feedback-hero-label">Total submissions</span>
                <span className="feedback-hero-value">{sortedHistory.length}</span>
                <span className="feedback-hero-hint">Unlimited sends · we welcome all feedback</span>
              </article>
              <article className="feedback-hero-card">
                <span className="feedback-hero-label">Most active channel</span>
                <span className="feedback-hero-value">{mostActiveCategory}</span>
                <span className="feedback-hero-hint">Choose a lens to help triage quickly</span>
              </article>
              <article className="feedback-hero-card">
                <span className="feedback-hero-label">Last sent</span>
                <span className="feedback-hero-value">
                  {sortedHistory.length ? formatDate(sortedHistory[0].submittedAt) : "–"}
                </span>
                <span className="feedback-hero-hint">We respond within one business day</span>
              </article>
            </section>

            <section className="workspace-section feedback-compose" style={{ minWidth: 840 }}>
              <header className="workspace-section-header">
                <div>
                  <p className="workspace-section-kicker">Compose</p>
                  <h3 className="workspace-section-title">What should we know?</h3>
                </div>
                <p className="workspace-section-subtitle">
                  Tell us what feels magical or what needs refinement. Attach context, links, or reproduction steps.
                </p>
              </header>

              <div className="feedback-category-row" role="radiogroup" aria-label="Feedback category">
                {FEEDBACK_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    role="radio"
                    aria-checked={draft.category === category}
                    className={`workspace-chip ${draft.category === category ? "is-active" : ""}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <label htmlFor={formId} className="feedback-label">
                Feedback
                <VisuallyHidden>
                  Maximum {FEEDBACK_MAX_LENGTH} characters. {charactersRemaining} remaining.
                </VisuallyHidden>
              </label>
              <textarea
                id={formId}
                ref={firstControlRef}
                className="feedback-textarea"
                value={draft.message}
                onChange={handleMessageChange}
                maxLength={FEEDBACK_MAX_LENGTH}
                placeholder="Stream your thoughts…"
                aria-describedby={`${descId}-counter`}
              />
              <div className="feedback-meta">
                <span id={`${descId}-counter`} className={isOverLimit ? "feedback-limit feedback-limit-error" : "feedback-limit"}>
                  {Math.max(charactersRemaining, 0)} characters left
                </span>
                <div className="feedback-actions">
                  <button
                    type="button"
                    className="workspace-modal-reset"
                    onClick={resetDraft}
                    disabled={!draft.message && !draft.contact}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className="workspace-modal-save"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                  >
                    {submitting ? "Sending…" : "Send now"}
                  </button>
                </div>
              </div>

              <label htmlFor={`${formId}-contact`} className="feedback-label">
                Optional contact
              </label>
              <input
                id={`${formId}-contact`}
                type="email"
                inputMode="email"
                placeholder="Leave an email or Slack handle if we can follow up"
                className="feedback-input"
                value={draft.contact ?? ""}
                onChange={handleContactChange}
              />
              {status === "sent" && <div className="feedback-status success">Thank you — feedback sent.</div>}
              {status === "error" && <div className="feedback-status error">Something went wrong. Try again.</div>}
            </section>

            <section className="workspace-section feedback-history" style={{ minWidth: 840 }}>
              <header className="workspace-section-header">
                <div>
                  <p className="workspace-section-kicker">History</p>
                  <h3 className="workspace-section-title">Your recent notes</h3>
                </div>
                <p className="workspace-section-subtitle">
                  Everything stays on this device until the Nexus team reaches out. Remove any note if it no longer applies.
                </p>
              </header>
              <div className="feedback-history-track">
                {sortedHistory.length === 0 && (
                  <div className="feedback-history-empty">Your future insights will appear here.</div>
                )}
                {sortedHistory.map((entry) => (
                  <article key={entry.id} className="feedback-history-card">
                    <div className="feedback-history-meta">
                      <span className="feedback-history-tag">{entry.category}</span>
                      <time dateTime={entry.submittedAt}>{formatDate(entry.submittedAt)}</time>
                    </div>
                    <p className="feedback-history-message">{entry.message}</p>
                    {entry.contact && (
                      <p className="feedback-history-contact">Follow-up: {entry.contact}</p>
                    )}
                    <div className="feedback-history-actions">
                      <button type="button" onClick={() => handleCopy(entry.message)}>
                        Copy
                      </button>
                      {onDeleteEntry && (
                        <button type="button" onClick={() => onDeleteEntry(entry.id)}>
                          Remove
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
        <footer className="workspace-modal-footer">
          <div className="workspace-modal-status" aria-live="polite" aria-atomic="true">
            {submitting ? "Sending feedback…" : status === "sent" ? "Feedback delivered" : "Ready for your ideas"}
          </div>
          <div className="workspace-modal-actions">
            <button className="workspace-modal-reset" type="button" onClick={resetDraft}>
              Reset form
            </button>
            <button className="workspace-modal-save" type="button" onClick={handleSubmit} disabled={!canSubmit}>
              Share feedback
            </button>
          </div>
        </footer>
      </section>
    </div>
  );

  return createPortal(body, document.body);
}

export type SystemFeedbackDraft = FeedbackDraft;
export type SystemFeedbackHistoryEntry = FeedbackHistoryEntry;
