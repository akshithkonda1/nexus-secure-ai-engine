import { useParams, useNavigate } from "react-router-dom";
import { sessionStore } from "@/store/sessionStore";
import { ArrowLeft } from "lucide-react";

export function SessionConsole() {
  const { id } = useParams();
  const nav = useNavigate();
  const { getById, updateTitle } = sessionStore.use();
  const session = id ? getById(id) : undefined;

  if (!session) {
    return (
      <div className="p-6">
        <div className="text-[rgba(var(--subtle),0.7)]">Session not found.</div>
        <button
          className="btn btn-ghost underline text-[rgb(var(--text))] hover:text-[rgb(var(--brand))]"
          onClick={() => nav("/sessions")}
        >
          Back to sessions
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <button
        className="btn btn-ghost inline-flex items-center gap-2 text-sm text-[rgba(var(--subtle),0.85)] hover:text-[rgb(var(--text))]"
        onClick={() => nav("/sessions")}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <input
        className="input w-full rounded-lg border border-[rgba(var(--border),0.45)] bg-[rgba(var(--panel),0.4)] px-3 py-2 text-[rgb(var(--text))] placeholder:text-[rgba(var(--subtle),0.7)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--brand),0.4)]"
        value={session.title}
        onChange={(e) => updateTitle(session.id, e.target.value)}
      />

      <div className="panel panel--glassy panel--hover rounded-xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.55)] p-6 text-sm text-[rgba(var(--subtle),0.85)]">
        Session console stub — plug your debate UI here or route to <code>/chat</code>.
      </div>
    </div>
  );
}
