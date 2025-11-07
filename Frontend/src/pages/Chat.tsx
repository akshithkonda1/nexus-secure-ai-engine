import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Edit2, Loader2, MessageSquare, Send } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { useCreateSession, useRenameSession, useSessionMessages, useSessions } from "@/queries/sessions";
import type { Message } from "@/types/models";

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: sessionsData } = useSessions();
  const session = useMemo(() => sessionsData?.sessions.find((item) => item.id === id), [sessionsData, id]);
  const { data: messagesData, isLoading } = useSessionMessages(id);
  const [draftMessage, setDraftMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [renameValue, setRenameValue] = useState(session?.title ?? "Untitled session");
  const [editingTitle, setEditingTitle] = useState(false);
  const createSession = useCreateSession();
  const renameSession = useRenameSession();

  useEffect(() => {
    if (session?.title) {
      setRenameValue(session.title);
    }
  }, [session?.title]);

  const messages = useMemo(() => {
    const serverMessages = messagesData?.messages ?? [];
    return [...serverMessages, ...localMessages];
  }, [messagesData, localMessages]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const messageText = draftMessage.trim();
    if (!messageText) {
      return;
    }

    let sessionId = id;

    if (!sessionId) {
      const result = await createSession.mutateAsync({ title: "Draft session" }).catch(() => undefined);
      sessionId = result?.session.id;
      if (!sessionId) {
        return;
      }
      navigate(`/chat/${sessionId}`, { replace: true });
      if (!result?.session.id) {
        return;
      }
      navigate(`/chat/${result.session.id}`, { replace: true });
    }

    const newMessage: Message = {
      id: `local-${Date.now()}`,
      role: "user",
      text: messageText,
      at: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, newMessage]);
    setDraftMessage("");
  };

  const handleRename = async () => {
    if (!id || !renameValue.trim()) {
      return;
    }
    await renameSession.mutateAsync({ id, title: renameValue.trim() });
    setEditingTitle(false);
  };

  const headerTitle = id ? session?.title ?? "Loading session" : "Draft session";
  const headerDescription = id
    ? "Keep the debate running, add new prompts, and inspect every response."
    : "Start a new Nexus.ai session to orchestrate trustworthy AI chats.";

  return (
    <div className="space-y-8 text-white">
      <PageHeader
        title={headerTitle}
        description={headerDescription}
        actions={
          id ? (
            <button
              type="button"
              onClick={() => setEditingTitle((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-muted transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Edit2 className="h-4 w-4" aria-hidden="true" /> Rename
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/sessions")}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-muted transition hover:bg-white/10 hover:text-white"
            >
              Back to sessions
            </button>
          )
        }
      />

      {editingTitle ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleRename();
          }}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-elevated/80 p-4 shadow-card"
        >
          <input
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            className="h-10 flex-1 rounded-lg border border-white/10 bg-surface/70 px-4 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-500"
          >
            Save
          </button>
        </form>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-elevated/80 p-6 shadow-card">
          <h2 className="text-lg font-semibold text-white">Conversation</h2>
          {id ? (
            isLoading ? (
              <div className="space-y-3" aria-busy="true">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 bg-white/5" />
                ))}
              </div>
            ) : messages.length ? (
              <div className="space-y-3">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg border px-4 py-3 text-sm shadow-sm ${
                      message.role === "user"
                        ? "border-primary/40 bg-primary/10 text-white"
                        : "border-white/10 bg-surface/70 text-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted">
                      <span>{message.role}</span>
                      <span>{new Date(message.at).toLocaleTimeString()}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white">{message.text}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No messages yet"
                description="Send a prompt to see responses from your configured providers."
                icon={<MessageSquare className="h-10 w-10" aria-hidden="true" />}
              />
            )
          ) : (
            <EmptyState
              title="Draft session"
              description="Send your first prompt to create a new trusted session."
              icon={<MessageSquare className="h-10 w-10" aria-hidden="true" />}
            />
          )}

          <form onSubmit={handleSend} className="mt-4 space-y-3">
            <textarea
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              rows={3}
              placeholder="Ask Nexus to orchestrate a debate…"
              className="w-full resize-none rounded-xl border border-white/10 bg-surface/80 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted">Shift + Enter to add a new line.</span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!draftMessage.trim() || createSession.isPending}
              >
                {createSession.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                Send
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border border-white/10 bg-elevated/80 p-6 shadow-card">
          <h2 className="text-lg font-semibold text-white">Session details</h2>
          <p className="mt-2 text-sm text-muted">
            High-level context and metadata will live here in a future release. For now, keep the debate flowing.
          </p>
        </div>
      </section>
    </div>
  );
}
