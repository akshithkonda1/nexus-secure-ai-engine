import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const [name, setName] = useState("Ryuzen Operator");
  const [email] = useState("operator@ryuzen.ai");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (!open) {
      setPassword("");
      setConfirm("");
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-panel w-full max-w-xl rounded-2xl border border-[var(--border-strong)] bg-[var(--panel-elevated)] p-6 shadow-2xl"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.24, ease: "easeOut" } }}
            exit={{ scale: 0.94, opacity: 0, transition: { duration: 0.18 } }}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-[var(--text-secondary)]">Profile</p>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Ryuzen Identity</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_90%,transparent)] p-2 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                aria-label="Close profile modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[160px,1fr]">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_85%,transparent)] p-4">
                <div className="h-24 w-24 overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-gradient-to-br from-cyan-400/40 via-sky-400/30 to-purple-400/35 shadow-lg shadow-cyan-500/25" />
                <label className="cursor-pointer rounded-full border border-[var(--border-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[color-mix(in_srgb,var(--accent-primary)_50%,transparent)]">
                  Change photo
                  <input type="file" className="hidden" aria-label="Upload profile" />
                </label>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Display name</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_85%,transparent)] px-3 py-2 text-[var(--text-primary)] outline-none transition focus:border-[color-mix(in_srgb,var(--accent-primary)_60%,transparent)]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Email</span>
                  <input
                    className="mt-2 w-full cursor-not-allowed rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_70%,transparent)] px-3 py-2 text-[var(--text-secondary)]"
                    value={email}
                    disabled
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">New password</span>
                    <input
                      type="password"
                      className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_85%,transparent)] px-3 py-2 text-[var(--text-primary)] outline-none transition focus:border-[color-mix(in_srgb,var(--accent-primary)_60%,transparent)]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">Confirm</span>
                    <input
                      type="password"
                      className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_85%,transparent)] px-3 py-2 text-[var(--text-primary)] outline-none transition focus:border-[color-mix(in_srgb,var(--accent-primary)_60%,transparent)]"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="button-ghost rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="button-primary rounded-xl px-4 py-2 text-sm font-semibold"
                disabled={!name || password !== confirm}
              >
                Save changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
