import { useToronStore } from "@/state/toron/toronStore";
import { motion } from "framer-motion";

export default function ToronSessionsSidebar() {
  const {
    sessions,
    activeSessionId,
    setActiveSession,
    createSession,
  } = useToronStore();

  return (
    <aside className="h-full w-[270px] border-l border-[var(--border-soft)] bg-[var(--panel-elevated)] flex flex-col">
      <button
        className="m-4 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-semibold shadow-lg hover:opacity-90 transition"
        onClick={() => createSession()}
      >
        + New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-2 px-4 pb-4">
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            onClick={() => setActiveSession(session.id)}
            whileHover={{ scale: 1.02 }}
            className={`p-3 rounded-xl cursor-pointer transition ${
              session.id === activeSessionId
                ? "bg-[var(--accent-secondary)]/30 border border-[var(--accent-secondary)]"
                : "bg-[var(--panel-strong)]"
            }`}
          >
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {session.title}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {new Date(session.updatedAt).toLocaleTimeString()}
            </p>
          </motion.div>
        ))}
      </div>
    </aside>
  );
}
