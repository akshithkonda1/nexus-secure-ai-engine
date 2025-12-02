import React from "react";
import { BellRing, CheckCircle2, Clock } from "lucide-react";

const notifications = [
  { id: "n1", title: "Toron surfaced a new insight", time: "Just now", type: "signal" },
  { id: "n2", title: "Canvas sync completed", time: "5m ago", type: "success" },
  { id: "n3", title: "Meta connector unstable", time: "18m ago", type: "warning" },
];

const NotificationsPanel: React.FC = () => {
  return (
    <div className="fade-in scale-in mx-auto max-w-3xl rounded-[32px] border border-white/15 bg-white/5 p-8 text-white shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
        <BellRing className="h-4 w-4" /> Notifications
      </div>
      <p className="mt-3 text-sm text-white/70">Workspace alerts stream here. Only one panel is active at a time.</p>

      <div className="mt-6 space-y-3">
        {notifications.map((note) => (
          <div key={note.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/90 transition duration-200 ease-out hover:bg-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white/80">
                {note.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-semibold text-white">{note.title}</p>
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
  );
};

export default NotificationsPanel;
