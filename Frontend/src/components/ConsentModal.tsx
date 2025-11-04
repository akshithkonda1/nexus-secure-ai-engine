import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useDebateStore } from "@/stores/debateStore";

const CONSENT_ACK_KEY = "nexus.telemetryConsentAck";

export function ConsentModal() {
  const telemetryOptIn = useDebateStore((state) => state.telemetryOptIn);
  const setOptIn = useDebateStore((state) => state.setOptIn);
  const [isOpen, setIsOpen] = useState(false);
  const [checked, setChecked] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const acknowledged = localStorage.getItem(CONSENT_ACK_KEY);
    if (!acknowledged) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!telemetryOptIn) {
      setChecked(false);
    }
  }, [telemetryOptIn]);

  const persistAcknowledgement = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CONSENT_ACK_KEY, "true");
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await setOptIn(checked);
      persistAcknowledgement();
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setIsSubmitting(true);
    try {
      await setOptIn(false);
      persistAcknowledgement();
      setChecked(false);
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleDecline} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/70" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center px-4 py-6">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 p-6 text-slate-100 shadow-2xl backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-slate-800 p-2 text-slate-200">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-semibold">Help us improve Nexus.ai</Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-slate-300">
                   Please Opt in to share anonymized telemetry so that we can make the debate engine smarter. This is entirely optional. None of your chats are used and we never store PII and you can
                    change this anytime from Settings.
                  </Dialog.Description>
                  <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm shadow-inner">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-slate-100 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900"
                      checked={checked}
                      onChange={(event) => setChecked(event.target.checked)}
                    />
                    <span>I agree to share anonymized telemetry.</span>
                  </label>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      className="rounded-lg border border-transparent bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
                      onClick={handleDecline}
                      disabled={isSubmitting}
                    >
                      No thanks
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 disabled:opacity-50"
                      onClick={handleConfirm}
                      disabled={!checked || isSubmitting}
                    >
                      {isSubmitting ? "Saving…" : "Share telemetry"}
                    </button>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
