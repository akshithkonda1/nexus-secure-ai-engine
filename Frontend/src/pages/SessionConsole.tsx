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
        <div className="text-gray-400">Session not found.</div>
        <button className="underline" onClick={() => nav("/sessions")}>Back to sessions</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <button className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white" onClick={() => nav("/sessions")}>
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <input className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2"
        value={session.title} onChange={(e) => updateTitle(session.id, e.target.value)} />

      <div className="rounded-xl border border-white/10 bg-[var(--nexus-card)] p-6 text-sm text-gray-300">
        Session console stub — plug your debate UI here or route to <code>/chat</code>.
      </div>
    </div>
  );
}
