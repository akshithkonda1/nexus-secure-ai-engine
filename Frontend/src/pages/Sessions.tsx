import { useNavigate } from "react-router-dom";
import { sessionStore } from "@/store/sessionStore";
import { Plus, Trash2 } from "lucide-react";

export function Sessions() {
  const nav = useNavigate();
  const { sessions, createSession, removeSession } = sessionStore.use();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sessions</h1>
        <button onClick={() => { const id = createSession({ title: "New session" }); nav(`/sessions/${id}`); }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm">
          <Plus className="h-4 w-4" /> New session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sessions.map(s => (
          <div key={s.id} className="rounded-xl border border-white/10 bg-[var(--nexus-card)] p-4 flex items-start justify-between">
            <div><div className="font-medium">{s.title}</div><div className="text-xs text-gray-400">Updated {new Date(s.updatedAt).toLocaleString()}</div></div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded-md bg-white/10 border border-white/10 hover:bg-white/20 text-sm" onClick={() => nav(`/sessions/${s.id}`)}>Open</button>
              <button className="p-2 rounded-md bg-red-500/10 hover:bg-red-500/20 border border-red-500/20" onClick={() => removeSession(s.id)} title="Delete">
                <Trash2 className="h-4 w-4 text-red-300" />
              </button>
            </div>
          </div>
        ))}
        {sessions.length === 0 && <div className="text-sm text-gray-400">No sessions yet.</div>}
      </div>
    </div>
  );
}
