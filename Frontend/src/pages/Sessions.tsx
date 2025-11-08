import { useNavigate } from "react-router-dom";
import { PlayCircle } from "lucide-react";
import { sessionStore } from "@/store/sessionStore";
import { useMemo } from "react";

function relativeTime(input: number) {
  const diff = Date.now() - input;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) {
    const mins = Math.round(diff / 60_000);
    return `${mins} min${mins === 1 ? "" : "s"} ago`;
  }
  if (diff < 86_400_000) {
    const hrs = Math.round(diff / 3_600_000);
    return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  }
  const days = Math.round(diff / 86_400_000);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function statusFor(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 90_000) return "active";
  if (diff < 86_400_000) return "paused";
  return "archived";
}

export function Sessions() {
  const navigate = useNavigate();
  const { sessions, createSession } = sessionStore.use();

  const list = useMemo(
    () =>
      sessions.map((s) => ({
        ...s,
        status: statusFor(s.updatedAt),
        updatedLabel: relativeTime(s.updatedAt),
      })),
    [sessions]
  );

  async function onNewSession() {
    const id = createSession({ title: "New session" });
    navigate(`/sessions/${id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sessions</h2>
        <button
          onClick={onNewSession}
          className="h-10 px-4 rounded-xl text-white flex items-center gap-2"
          style={{ backgroundColor: "var(--brand)" }}
        >
          <PlayCircle className="size-4" /> New session
        </button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-[rgb(var(--panel))] p-10 text-center text-sm text-subtle shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
          No sessions yet. Launch your first orchestration run to see it here.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {list.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl bg-[rgb(var(--panel))] border border-border/60 p-6 shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
            >
              <div className="font-medium">{s.title}</div>
              <div className="text-xs text-subtle mt-1">Updated {s.updatedLabel}</div>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-lg border border-border/60 capitalize ${
                    s.status === "active" ? "text-white" : "text-foreground"
                  }`}
                  style={s.status === "active" ? { backgroundColor: "var(--brand)" } : undefined}
                >
                  {s.status}
                </span>
                <button
                  onClick={() => navigate(`/sessions/${s.id}`)}
                  className="ml-auto h-8 px-3 rounded-lg border border-border/60 hover:bg-surface/50"
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Sessions;
