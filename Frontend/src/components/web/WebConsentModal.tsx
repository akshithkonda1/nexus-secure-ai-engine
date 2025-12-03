import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";

export type WebConsentModalProps = {
  open: boolean;
  pageTitle: string;
  url: string;
  purpose: string;
  risk?: string;
  loading?: boolean;
  onAllowOnce: () => void;
  onAllowSession: () => void;
  onDeny: () => void;
};

export default function WebConsentModal({
  open,
  pageTitle,
  url,
  purpose,
  risk = "Low",
  loading = false,
  onAllowOnce,
  onAllowSession,
  onDeny,
}: WebConsentModalProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onDeny}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-bgElevated/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-4 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-borderLight/10 bg-[var(--panel-bg)] p-6 text-left shadow-2xl ring-1 ring-white/10">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="pointer-events-none absolute -inset-px bg-gradient-to-br from-[rgba(0,255,255,0.12)] via-[rgba(121,80,255,0.16)] to-[rgba(0,0,0,0)] blur-2xl"
                />

                <div className="relative space-y-4">
                  <Dialog.Title className="text-lg font-semibold text-[var(--text-primary)]">
                    Requesting Web Access
                  </Dialog.Title>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Toron needs your approval to view a public webpage in a read-only sandbox. No scripts will execute and links will not be followed.
                  </p>

                  <div className="rounded-xl border border-borderLight/10 bg-bgPrimary/5 p-4 dark:bg-bgPrimary/5">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{pageTitle || "Untitled page"}</div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                        Risk: {risk}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">{url}</div>
                    <div className="mt-3 rounded-lg bg-bgElevated/30 p-3 text-xs text-[var(--text-secondary)] shadow-inner dark:bg-bgPrimary/5">
                      <div className="text-[var(--text-primary)]">Purpose</div>
                      <div className="text-[var(--text-secondary)]">{purpose}</div>
                      <div className="mt-2 text-[var(--text-primary)]">Scope</div>
                      <div className="text-[var(--text-secondary)]">Read-only extraction</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={onAllowOnce}
                      disabled={loading}
                      className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 shadow-[0_10px_30px_rgba(16,185,129,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Preparing..." : "Allow Once"}
                    </button>
                    <button
                      onClick={onAllowSession}
                      disabled={loading}
                      className="rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 to-indigo-500/25 px-4 py-2 text-sm font-semibold text-cyan-50 shadow-[0_10px_30px_rgba(6,182,212,0.3)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Preparing..." : "Allow This Session"}
                    </button>
                    <button
                      onClick={onDeny}
                      className="rounded-xl border border-borderLight/10 bg-bgPrimary/5 px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-0.5"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
