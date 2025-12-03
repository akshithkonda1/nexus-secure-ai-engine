import React, { useMemo } from "react";
import { BellRing, CheckCircle2, Clock } from "lucide-react";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

const notifications = [
  { id: "n1", title: "Toron surfaced a new insight", time: "Just now", type: "signal" },
  { id: "n2", title: "Canvas sync completed", time: "5m ago", type: "success" },
  { id: "n3", title: "Meta connector unstable", time: "18m ago", type: "warning" },
];

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ open, onClose }) => {
  const classes = useMemo(
    () =>
      `fixed inset-x-4 bottom-4 z-40 transform transition-all duration-300 ${
        open ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`,
    [open],
  );

  return (
    <div className={classes}>
      <div className="rounded-[32px] border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-4 text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-[var(--border)] dark:bg-[var(--glass)] dark:text-[var(--text)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="mb-3 flex items-center justify-between text-[var(--text)] dark:text-[var(--text)]">
          <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em]">
            <BellRing className="h-4 w-4" /> Notifications
          </div>
          <button
            className="rounded-full bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] px-3 py-1 text-xs text-[color-mix(in_oklab,var(--text)_70%,transparent)] transition hover:bg-bgElevated/20 dark:bg-[var(--glass)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:hover:bg-[color-mix(in_oklab,var(--glass)_85%,transparent)]"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="space-y-2">
          {notifications.map((note) => (
            <div key={note.id} className="flex items-center justify-between rounded-2xl bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] px-3 py-2 text-sm text-[var(--text)] dark:bg-[var(--glass)] dark:text-[var(--text)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] text-[var(--text)] dark:bg-[var(--glass)] dark:text-[var(--text)]">
                  {note.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-medium text-textPrimary dark:text-textPrimary">{note.title}</p>
                  <p className="flex items-center gap-1 text-xs text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">
                    <Clock className="h-3 w-3" /> {note.time}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] px-3 py-1 text-[11px] uppercase tracking-wide text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:bg-[var(--glass)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">{note.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
