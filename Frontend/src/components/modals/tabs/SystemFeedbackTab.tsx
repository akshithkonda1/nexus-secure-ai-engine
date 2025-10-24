import React, { FormEvent, useCallback, useMemo, useState } from "react";
import {
  sendFeedback,
  SYSTEM_FEEDBACK_CHAR_LIMIT,
} from "../../../lib/feedback";

type StatusTone = "idle" | "success" | "error";

type StatusState = { tone: StatusTone; message: string } | null;

const SystemFeedbackTab: React.FC = () => {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<StatusState>(null);
  const [submitting, setSubmitting] = useState(false);

  const charactersUsed = useMemo(() => message.length, [message]);
  const canSubmit = useMemo(() => message.trim().length > 0, [message]);
  const counterLabel = useMemo(
    () =>
      `${charactersUsed.toLocaleString()} / ${SYSTEM_FEEDBACK_CHAR_LIMIT.toLocaleString()} characters`,
    [charactersUsed],
  );

  const handleSubmit = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (submitting) return;

      const trimmed = message.trim();
      if (!trimmed) {
        setStatus({
          tone: "error",
          message: "Add a few words so we can understand your feedback.",
        });
        return;
      }
      setSubmitting(true);
      setStatus({ tone: "idle", message: "" });
      try {
        const ok = await sendFeedback({
          score: 5,
          note: trimmed,
          route: "system-feedback",
        });
        if (ok) {
          setStatus({
            tone: "success",
            message: "Thanks! Your feedback has been sent.",
          });
          setMessage("");
        } else {
          setStatus({
            tone: "error",
            message: "We couldn’t send your feedback. Please try again.",
          });
        }
      } catch (err) {
        console.error("Failed to submit system feedback", err);
        setStatus({
          tone: "error",
          message: "We couldn’t send your feedback. Please try again.",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [message, submitting],
  );

  return (
    <form
      className="chatgpt-form"
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      onSubmit={handleSubmit}
      noValidate
    >
      <div>
        <h3 style={{ margin: 0 }}>System feedback</h3>
        <p style={{ fontSize: "0.9rem", opacity: 0.75, margin: "0.35rem 0 0" }}>
          Share anything that will help us improve Nexus. There is no daily
          limit — send feedback whenever inspiration strikes.
        </p>
      </div>
      <label
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <span style={{ fontWeight: 600 }}>Feedback</span>
        <textarea
          rows={8}
          maxLength={SYSTEM_FEEDBACK_CHAR_LIMIT}
          value={message}
          aria-describedby="system-feedback-counter"
          aria-invalid={status?.tone === "error"}
          onChange={(event) => {
            setMessage(event.target.value);
            if (status?.tone !== "idle") {
              setStatus(null);
            }
          }}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              void handleSubmit();
            }
          }}
          placeholder="Tell us what’s working well, what needs attention, or what you’d love to see next."
          style={{
            resize: "vertical",
            minHeight: "8rem",
            font: "inherit",
            padding: "0.75rem",
            borderRadius: "0.75rem",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.25)",
            color: "inherit",
          }}
        />
        <small
          id="system-feedback-counter"
          style={{ alignSelf: "flex-end", opacity: 0.6 }}
        >
          {counterLabel}
        </small>
      </label>
      <div
        style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}
      >
        <button
          type="button"
          className="chatgpt-button"
          onClick={() => {
            setMessage("");
            setStatus(null);
          }}
          disabled={!message || submitting}
        >
          Clear
        </button>
        <button
          type="submit"
          className="chatgpt-button primary"
          disabled={!canSubmit || submitting}
          aria-busy={submitting}
        >
          {submitting ? "Sending…" : "Send feedback"}
        </button>
      </div>
      {status && status.tone !== "idle" && (
        <p
          role="status"
          aria-live="polite"
          style={{
            margin: 0,
            fontSize: "0.85rem",
            color: status.tone === "success" ? "#4ade80" : "#f87171",
          }}
        >
          {status.message}
        </p>
      )}
    </form>
  );
};

export default SystemFeedbackTab;
