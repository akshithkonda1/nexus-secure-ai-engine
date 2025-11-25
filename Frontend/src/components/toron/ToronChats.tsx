import { AnimatePresence, motion } from "framer-motion";
import { ToronCard } from "./ToronCard";
import { ToronEmptyState } from "./ToronEmptyState";
import type { ToronChat } from "@/state/toron/useToron";
import "@/styles/toron.css";

interface ToronChatsProps {
  chats: ToronChat[];
  onCreate: () => void;
  onRemove: (id: string) => void;
}

export function ToronChats({ chats, onCreate, onRemove }: ToronChatsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Chat Sessions</h2>
          <p className="text-sm text-[var(--text-secondary)]">Persistent orchestration-ready dialogues.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreate}
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--toron-accent)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--toron-accent)]/35 transition hover:bg-[color-mix(in_srgb,var(--toron-accent)_90%,black)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--toron-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]"
        >
          <span className="h-5 w-5 rounded bg-white/60" />
          Create New Chat
        </motion.button>
      </div>

      {chats.length === 0 ? (
        <ToronEmptyState
          title="No chat sessions yet"
          description="Start a new Toron dialogue to orchestrate your agents."
          actionLabel="Start Chat"
          onAction={onCreate}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {chats.map((chat, idx) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 260, damping: 30, delay: idx * 0.03 }}
              >
                <ToronCard
                  title={chat.title}
                  subtitle={`Updated ${chat.updatedAt}`}
                  actions={
                    <button
                      type="button"
                      onClick={() => onRemove(chat.id)}
                      className="rounded-md border border-[var(--border-soft)] px-3 py-1 text-xs text-[var(--text-secondary)] transition hover:bg-[var(--border-soft)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--toron-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]"
                    >
                      Remove
                    </button>
                  }
                >
                  <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-[var(--border-soft)]" />
                      <span>Tags incoming</span>
                    </div>
                    <span className="text-xs font-medium text-[var(--text-primary)]">Long-horizon ready</span>
                  </div>
                </ToronCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default ToronChats;
