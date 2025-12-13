import { useCallback, useEffect, useMemo, useState } from "react";

import { ToronHeader } from "@/components/toron/ToronHeader";
import { safeMessage, safeString } from "@/shared/lib/toronSafe";
import { useToronStore } from "@/state/toron/toronStore";
import type { ToronAttachment, ToronMessage } from "@/state/toron/toronSessionTypes";

import { ComposerBar } from "./ComposerBar";
import { MessageList } from "./MessageList";
import { SessionSidebar } from "./SessionSidebar";
import { useComposerStateMachine } from "./useComposerStateMachine";

const API_CHAT = "/api/v1/toron/chat";

interface ToronChatShellProps {
  onOpenProjects?: () => void;
  onSaveToProject?: (content: string) => void;
}

export function ToronChatShell({ onOpenProjects, onSaveToProject }: ToronChatShellProps) {
  const composer = useComposerStateMachine();
  const { sessions, activeSessionId, createSession, switchSession, addMessage, removeMessage, getActiveSession } =
    useToronStore();
  const [inputValue, setInputValue] = useState("");
  const [attachments, setAttachments] = useState<ToronAttachment[]>([]);
  const [browsing, setBrowsing] = useState(false);
  const [agentMode, setAgentMode] = useState(false);
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [githubRepo, setGithubRepo] = useState("");
  const [githubPath, setGithubPath] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessions.length) {
      const newId = createSession("New Toron Session");
      switchSession(newId);
    }
  }, [sessions.length, createSession, switchSession]);

  const session = useMemo(() => getActiveSession(), [getActiveSession, sessions, activeSessionId]);
  const sessionId = session?.sessionId ?? activeSessionId;

  useEffect(() => {
    composer.updateInputs(inputValue, attachments);
  }, [attachments, composer, inputValue]);

  const handleAddAttachments = useCallback((files: File[], source: "upload" | "drive" | "github" = "upload") => {
    setAttachments((prev) => {
      const mapped = files.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name || (source === "drive" ? "Drive file" : "Attachment"),
        type: file.type ? file.type.split("/")[0] : "file",
        size: file.size,
        source,
      }));
      const next = [...prev, ...mapped];
      composer.updateInputs(inputValue, next);
      return next;
    });
  }, [composer, inputValue]);

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const next = prev.filter((file) => file.id !== id);
      composer.updateInputs(inputValue, next);
      return next;
    });
  }, [composer, inputValue]);

  const handleSend = useCallback(async () => {
    if (!sessionId) return;
    if (!composer.canSend) return;
    const trimmed = safeString(inputValue, "").trim();
    if (!trimmed && attachments.length === 0) return;
    composer.startSending();

    const userMessage: ToronMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      model: "user",
      timestamp: new Date().toISOString(),
      attachments,
      meta: { browsing, agentMode, editedFromId: editingMessageId ?? undefined },
    };

    if (editingMessageId) {
      removeMessage(editingMessageId, sessionId);
    }

    addMessage(userMessage, sessionId);
    setInputValue("");
    setAttachments([]);
    setEditingMessageId(null);
    composer.updateInputs("", []);

    try {
      const res = await fetch(API_CHAT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: trimmed,
          attachments,
          browsing,
          agent_mode: agentMode,
        }),
      });
      if (!res.ok) throw new Error("Toron chat unavailable");
      const data = await res.json().catch(() => ({ messages: [] }));
      composer.startResponding();
      const assistantMessages: ToronMessage[] = Array.isArray(data.messages)
        ? data.messages.map((m: unknown) =>
            safeMessage({
              ...m,
              role: "assistant",
              attachments: m?.attachments ?? [],
              meta: { browsing, agentMode },
            }),
          )
        : [];
      if (!assistantMessages.length) {
        assistantMessages.push({
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Noted. Ready to continue when you are.",
          model: "assistant",
          timestamp: new Date().toISOString(),
          meta: { browsing, agentMode },
        });
      }
      assistantMessages.forEach((msg) => addMessage(msg, sessionId));
      composer.reset();
    } catch (error) {
      composer.setError((error as Error).message);
      addMessage(
        safeMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I hit an error while sending that. Please retry.",
          model: "system",
          timestamp: new Date().toISOString(),
        }),
        sessionId,
      );
    }
  }, [addMessage, agentMode, attachments, browsing, composer, editingMessageId, inputValue, removeMessage, sessionId]);

  const handleEditMessage = useCallback(
    (message: ToronMessage) => {
      setEditingMessageId(message.id);
      setInputValue(message.content);
      setAttachments(message.attachments ?? []);
      composer.updateInputs(message.content, message.attachments ?? []);
    },
    [composer],
  );

  const handleGithubAttach = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!githubRepo.trim()) return;
      const file = new File([""], githubPath || "Repository" + ".md", { type: "text/plain" });
      handleAddAttachments([file], "github");
      setGithubModalOpen(false);
      setGithubPath("");
      setGithubRepo("");
    },
    [githubPath, githubRepo, handleAddAttachments],
  );

  const activeMessages = useMemo(() => session?.messages ?? [], [session]);

  return (
    <div className="relative flex h-full min-h-screen bg-[var(--panel-main)] text-[var(--text-primary)]">
      <div className="flex min-h-screen flex-1 flex-col px-3 pt-3 sm:px-6 sm:pt-5">
        <ToronHeader
          title={session?.title ?? "Toron"}
          onNewChat={() => switchSession(createSession("New Toron Session"))}
          onOpenProjects={onOpenProjects}
        />
        <MessageList messages={activeMessages} onEditMessage={handleEditMessage} onSaveToProject={onSaveToProject} />
        <div className="fixed bottom-4 left-0 right-0 flex justify-start px-4 sm:px-6 lg:px-10">
          <div className="w-full max-w-5xl">
            <ComposerBar
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSend}
              attachments={attachments}
              onAddAttachments={handleAddAttachments}
              onRemoveAttachment={handleRemoveAttachment}
              composer={composer}
              browsing={browsing}
              agentMode={agentMode}
              onToggleAgent={() => setAgentMode((prev) => !prev)}
              onToggleBrowsing={() => setBrowsing((prev) => !prev)}
              onOpenDriveModal={() => setDriveModalOpen(true)}
              onOpenGithubModal={() => setGithubModalOpen(true)}
            />
          </div>
        </div>
      </div>
      <div className="hidden w-72 border-l border-white/5 bg-[color-mix(in_srgb,var(--panel-elevated)_85%,transparent)]/60 lg:block">
        <SessionSidebar onNewSession={() => switchSession(createSession("New Toron Session"))} />
      </div>

      {driveModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[color-mix(in_srgb,var(--panel-elevated)_95%,transparent)] p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Google Drive not configured</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Connect Drive to import documents. Until then, use file upload to add references.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDriveModalOpen(false)}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-white/15"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {githubModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <form
            className="w-full max-w-md rounded-2xl bg-[color-mix(in_srgb,var(--panel-elevated)_95%,transparent)] p-6 shadow-2xl backdrop-blur-xl"
            onSubmit={handleGithubAttach}
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Attach from GitHub</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Provide a repo URL and optional file path.</p>
            <label className="mt-4 block text-sm text-[var(--text-secondary)]">
              Repository URL
              <input
                type="url"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
                placeholder="https://github.com/org/repo"
                required
              />
            </label>
            <label className="mt-3 block text-sm text-[var(--text-secondary)]">
              File or path (optional)
              <input
                type="text"
                value={githubPath}
                onChange={(e) => setGithubPath(e.target.value)}
                className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
                placeholder="src/index.ts"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setGithubModalOpen(false)}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_32%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-[0_12px_30px_rgba(56,189,248,0.4)]"
              >
                Add to tray
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ToronChatShell;
