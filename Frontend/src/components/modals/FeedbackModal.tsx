import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useModal } from "@/state/useModal";

const LIMIT = 20000;

export function FeedbackModal() {
  const { openKey, close } = useModal();
  const open = openKey === "feedback";
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setValue("");
      setSubmitting(false);
    }
  }, [open]);

  async function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    try {
      setSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log("POST /api/feedback", trimmed);
      window.dispatchEvent(new CustomEvent("nexus-feedback-submitted", { detail: trimmed }));
      setValue("");
      close();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(9,11,30,0.55)] backdrop-blur"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-xl rounded-3xl border border-[rgb(var(--border)/0.5)] bg-[rgb(var(--surface)/0.92)] p-8 shadow-card backdrop-blur-lg dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.72)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Share feedback</h2>
                <p className="mt-2 text-sm text-[rgb(var(--text)/0.65)]">
                  Help us tune Nexus.ai. We read everything — privacy safe.
                </p>
              </div>
              <button
                onClick={close}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-white/70 text-[rgb(var(--text))] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] dark:bg-white/10"
                aria-label="Close feedback"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <textarea
              value={value}
              onChange={(event) => {
                if (event.target.value.length <= LIMIT) {
                  setValue(event.target.value);
                }
              }}
              rows={8}
              className="mt-6 w-full resize-none rounded-2xl border border-[color-mix(in_srgb,var(--brand)_20%,transparent)] bg-white/80 px-4 py-3 text-sm leading-relaxed text-[rgb(var(--text))] shadow-inner outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_24%,transparent)] dark:bg-white/10"
              placeholder="Be as specific as possible. What worked? What felt rough?"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-[rgb(var(--text)/0.5)]">
              <span>
                {value.length.toLocaleString()} / {LIMIT.toLocaleString()} characters
              </span>
              <button
                onClick={handleSubmit}
                disabled={!value.trim() || submitting}
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-glow transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Sending…" : "Submit"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
