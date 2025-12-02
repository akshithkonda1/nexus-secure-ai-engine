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
      <div className="rounded-[32px] border border-white/15 bg-white/15 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl">
        <div className="mb-3 flex items-center justify-between text-white/80">
          <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em]">
            <BellRing className="h-4 w-4" /> Notifications
          </div>
          <button
            className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 transition hover:bg-white/20"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="space-y-2">
          {notifications.map((note) => (
            <div key={note.id} className="flex items-center justify-between rounded-2xl bg-black/30 px-3 py-2 text-sm text-white/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white/80">
                  {note.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-medium text-white">{note.title}</p>
                  <p className="flex items-center gap-1 text-xs text-white/60">
                    <Clock className="h-3 w-3" /> {note.time}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-wide text-white/60">{note.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
