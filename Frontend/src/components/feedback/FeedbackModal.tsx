import { type FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { encryptWithAesGcm } from "@/lib/crypto/aes";
import { FeedbackResponse } from "@/types/feedback";
import { useFeedback } from "@/state/feedback";

const MAX_LENGTH = 20000;
const FEEDBACK_KEY = import.meta.env.VITE_FEEDBACK_AES_KEY ?? "";

export function FeedbackModal() {
  const { open, closeModal } = useFeedback();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "";
    };
  }, [open, closeModal]);

  const remaining = useMemo(() => MAX_LENGTH - message.length, [message.length]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) {
      toast.error("Please add feedback before submitting.");
      return;
    }

    if (!FEEDBACK_KEY) {
      toast.error("Feedback encryption key is not configured.");
      return;
    }

    try {
      setSubmitting(true);
      const encrypted = await encryptWithAesGcm(message, FEEDBACK_KEY);

      const response = await fetch("/api/v1/feedback/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          algorithm: encrypted.algorithm,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          length: message.length,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit feedback (${response.status})`);
      }

      const result = (await response.json()) as FeedbackResponse;
      toast.success(
        `Feedback sent! Sentiment: ${result.sentiment} • Category: ${result.category} • Priority: ${result.priority}`,
        {
          description: result.message ?? "Thanks for helping us improve Ryuzen.",
        },
      );
      setMessage("");
      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit feedback right now.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        />

        <motion.form
          onSubmit={handleSubmit}
          initial={{ y: 24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 210, damping: 26 } }}
          exit={{ y: 16, opacity: 0, scale: 0.98, transition: { duration: 0.18 } }}
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-[color-mix(in_srgb,var(--border-soft)_70%,transparent)] bg-[color-mix(in_srgb,var(--panel-elevated)_85%,transparent)] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-4 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">Anonymous Feedback</p>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Tell us how we can improve</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Your feedback is encrypted end-to-end with AES-256-GCM before it leaves your device.
              </p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_80%,transparent)] text-[var(--text-secondary)] transition hover:-translate-y-[1px] hover:text-[var(--text-primary)]"
              aria-label="Close feedback modal"
            >
              <span className="text-lg font-bold leading-none group-hover:scale-105">×</span>
            </button>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Feedback</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, MAX_LENGTH))}
              maxLength={MAX_LENGTH}
              placeholder="Share any thoughts, ideas, or issues. Include as much detail as you like."
              className="mt-3 h-64 w-full resize-none rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_78%,transparent)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-inner shadow-black/20 transition focus:border-[color-mix(in_srgb,var(--accent-primary)_55%,transparent)] focus:outline-none focus:ring-1 focus:ring-[color-mix(in_srgb,var(--accent-primary)_40%,transparent)]"
            />
          </label>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-[color-mix(in_srgb,var(--accent-secondary)_70%,transparent)]" />
              <span>Encrypted and stored without identifiers.</span>
            </div>
            <span>
              {message.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()} ({remaining.toLocaleString()} left)
            </span>
          </div>

          <div className="mt-6 flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={closeModal}
              className="w-full rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_80%,transparent)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-[1px] hover:text-[var(--text-primary)] sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="w-full rounded-2xl bg-[color-mix(in_srgb,var(--accent-primary)_80%,var(--panel-strong))] px-6 py-3 text-sm font-semibold text-[rgb(var(--on-accent))] shadow-[0_14px_45px_rgba(124,93,255,0.38)] transition hover:-translate-y-[2px] hover:shadow-[0_18px_55px_rgba(124,93,255,0.45)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {submitting ? "Sending..." : "Send feedback securely"}
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
