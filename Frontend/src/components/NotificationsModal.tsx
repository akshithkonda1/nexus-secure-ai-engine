import { Dialog, Transition } from "@headlessui/react";
import { Bell, Check, Inbox, ShieldAlert, Sparkles, X } from "lucide-react";
import React, { Fragment } from "react";

import {
  type NotificationItem,
  useNotifications,
} from "@/features/notifications/useNotifications";
import { cn } from "@/shared/lib/cn";

type NotificationsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Tone = NotificationItem["tone"];

const toneIcon: Record<Tone, React.ReactNode> = {
  info: <Inbox className="size-4" aria-hidden="true" />,
  success: <Check className="size-4" aria-hidden="true" />,
  warning: <Sparkles className="size-4" aria-hidden="true" />,
  critical: <ShieldAlert className="size-4" aria-hidden="true" />,
};

const toneStyles: Record<Tone, string> = {
  info: "bg-[rgba(var(--accent-sky),0.12)] text-brand",
  success: "bg-[rgba(var(--accent-emerald),0.16)] text-[rgb(var(--accent-emerald-ink))] dark:text-[rgb(var(--accent-emerald-ink))]",
  warning: "bg-[rgba(var(--accent-amber),0.16)] text-[rgb(var(--accent-amber-ink))] dark:text-[rgb(var(--accent-amber-ink))]",
  critical: "bg-[rgba(var(--accent-rose),0.18)] text-[rgb(var(--accent-rose-ink))] dark:text-[rgb(var(--accent-rose-ink))]",
};

export function NotificationsModal({ open, onOpenChange }: NotificationsModalProps) {
  const notifications = useNotifications();
  const unreadCount = notifications.length;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[110]" onClose={onOpenChange}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0"
            style={{ background: "rgb(var(--bg) / 0.72)" }}
            aria-hidden="true"
          />
        </Transition.Child>

        <div className="fixed inset-0 flex items-start justify-center overflow-y-auto px-4 py-10 sm:items-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-3xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.98)] shadow-[var(--shadow-lift)] backdrop-blur-xl dark:bg-[rgba(var(--panel),0.95)]">
              <header className="flex items-start justify-between border-b border-[rgba(var(--border),0.35)] px-6 py-5">
                <div>
                  <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-[rgb(var(--text))]">
                    <Bell className="size-5" aria-hidden="true" /> Notifications
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-[rgb(var(--subtle))]">
                    {unreadCount} {unreadCount === 1 ? "update" : "updates"} since your last check-in.
                  </Dialog.Description>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex size-9 items-center justify-center rounded-full border border-[rgba(var(--border),0.5)] bg-[rgba(var(--surface),0.9)] text-[rgb(var(--subtle))] transition hover:text-brand dark:bg-[rgba(var(--panel),0.6)]"
                  aria-label="Close notifications"
                >
                  <X className="size-4" />
                </button>
              </header>

              <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
                {notifications.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-[rgba(var(--border),0.4)] bg-[rgba(var(--surface),0.86)] p-4 shadow-sm transition hover:border-[rgba(var(--brand),0.5)] dark:bg-[rgba(var(--panel),0.82)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold",
                            toneStyles[item.tone],
                          )}
                        >
                          {toneIcon[item.tone]}
                        </span>
                        <h3 className="text-sm font-semibold text-[rgb(var(--text))]">{item.title}</h3>
                      </div>
                      <time className="text-xs font-medium text-[rgba(var(--subtle),0.8)]">{item.time}</time>
                    </div>
                    <p className="mt-2 text-sm text-[rgb(var(--subtle))]">{item.description}</p>
                    {item.cta ? (
                      <button
                        type="button"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:underline"
                      >
                        {item.cta}
                      </button>
                    ) : null}
                  </article>
                ))}
                <div className="rounded-2xl border border-dashed border-[rgba(var(--border),0.4)] bg-[rgba(var(--surface),0.6)] p-5 text-center text-sm text-[rgb(var(--subtle))] dark:bg-[rgba(var(--panel),0.7)]">
                  You're all caught up. Production wiring can populate these alerts via the notifications API.
                </div>
              </div>

              <footer className="flex flex-col gap-3 border-t border-[rgba(var(--border),0.35)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(var(--border),0.5)] px-4 py-2 text-sm font-semibold text-[rgb(var(--text))] transition hover:border-brand hover:text-brand"
                  onClick={() => onOpenChange(false)}
                >
                  Dismiss
                </button>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl bg-[rgba(var(--brand),1)] px-4 py-2 text-sm font-semibold text-[rgb(var(--on-accent))] shadow-[0_14px_28px_rgba(46,84,174,0.22)] transition hover:brightness-105"
                  >
                    Mark all read
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl bg-[rgba(var(--panel),0.72)] px-4 py-2 text-sm font-semibold text-brand transition hover:bg-[rgba(var(--panel),0.9)]"
                  >
                    Notification settings
                  </button>
                </div>
              </footer>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
