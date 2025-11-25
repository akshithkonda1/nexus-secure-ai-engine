import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { nanoid } from "nanoid";

import { personaToneMap, useToronStore } from "@/state/toron/toronStore";
import type { PersonaMode } from "./toronTypes";

const applyPersonaMode = (reply: string, personaMode: PersonaMode) => {
  const prefix = personaToneMap[personaMode] ?? "";
  return `${prefix}${reply}`;
};

export default function ToronInputBar() {
  const {
    addMessage,
    appendToMessage,
    loading,
    setLoading,
    projects,
    activeProjectId,
  } = useToronStore();
  const [value, setValue] = useState("");
  const [droppedImages, setDroppedImages] = useState<File[]>([]);

  const glassVars = useMemo(
    () => ({
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
    }),
    [],
  );

  const activeProject = activeProjectId ? projects[activeProjectId] : null;
  const personaMode: PersonaMode = activeProject?.metadata.personaMode ?? "default";

  const handleSend = useCallback(async () => {
    const text = value.trim();
    if (!text || loading) return;
    if (!activeProject) return;

    setLoading(true);

    try {
      addMessage({
        sender: "user",
        text,
      });

      setValue("");

      const baseReply = `Here is a thoughtful response for "${text}" with your current goals in mind.`;
      const reply = applyPersonaMode(baseReply, personaMode);
      const toronMessageId = nanoid();

      addMessage({
        id: toronMessageId,
        sender: "toron",
        text: "",
      });

      for (let i = 0; i < reply.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 12));
        appendToMessage(toronMessageId, reply[i]);
      }
    } finally {
      setLoading(false);
    }
  }, [activeProject, addMessage, appendToMessage, loading, personaMode, setLoading, value]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length) {
      setDroppedImages((prev) => [...prev, ...files]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-6">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="pointer-events-auto flex w-full max-w-5xl flex-col gap-3 rounded-3xl border border-white/30 bg-white/60 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-white/5"
        style={glassVars}
      >
        {droppedImages.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
            {droppedImages.slice(-3).map((file) => (
              <span
                key={file.name + file.lastModified}
                className="rounded-full bg-white/70 px-3 py-1 text-[var(--text-primary)] shadow-sm ring-1 ring-white/30 dark:bg-white/10 dark:ring-white/10"
              >
                📎 {file.name}
              </span>
            ))}
            {droppedImages.length > 3 && <span>+{droppedImages.length - 3} more saved</span>}
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="flex-1">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask Toron anything..."
              className="h-14 w-full resize-none bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
            />
            {loading && (
              <div className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                <span className="animate-pulse">Toron is thinking…</span>
              </div>
            )}
          </div>
          <button
            onClick={() => void handleSend()}
            disabled={!value.trim() || loading}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(59,130,246,0.4)] transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_18px_46px_rgba(99,102,241,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="relative">Send</span>
            <span
              className="absolute inset-0 opacity-0 transition group-hover:opacity-100"
              style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2), transparent 50%)" }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
