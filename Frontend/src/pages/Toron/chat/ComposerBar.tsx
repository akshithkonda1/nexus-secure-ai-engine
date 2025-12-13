import React, { useEffect, useMemo, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import { AttachmentTray } from "./AttachmentTray";
import { CommandPalette } from "./CommandPalette";
import { MoreMenu } from "./MoreMenu";
import { PlusMenu } from "./PlusMenu";
import type { ComposerStateApi } from "./useComposerStateMachine";
import type { ToronAttachment } from "@/state/toron/toronSessionTypes";

interface ComposerBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  attachments: ToronAttachment[];
  onAddAttachments: (files: File[], source?: "upload" | "drive" | "github") => void;
  onRemoveAttachment: (id: string) => void;
  composer: ComposerStateApi;
  browsing: boolean;
  agentMode: boolean;
  onToggleBrowsing: () => void;
  onToggleAgent: () => void;
  onOpenDriveModal: () => void;
  onOpenGithubModal: () => void;
}

export function ComposerBar({
  value,
  onChange,
  onSend,
  attachments,
  onAddAttachments,
  onRemoveAttachment,
  composer,
  browsing,
  agentMode,
  onToggleAgent,
  onToggleBrowsing,
  onOpenDriveModal,
  onOpenGithubModal,
}: ComposerBarProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [listeningSupported, setListeningSupported] = useState(false);
  const [listeningError, setListeningError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const liveValueRef = useRef(value);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseCommands = useMemo(() => ["/attach", "/photo", "/file", "/browse", "/agent"], []);
  const filteredCommands = useMemo(() => {
    const normalized = value.replace("/", "").toLowerCase();
    if (!commandOpen && !value.startsWith("/")) return [];
    if (!normalized) return baseCommands;
    return baseCommands.filter((cmd) => cmd.toLowerCase().includes(normalized));
  }, [baseCommands, commandOpen, value]);
  const sendButtonLabel = useMemo(() => {
    if (composer.state.status === "sending") return "Thinking";
    if (composer.state.status === "responding") return "Responding";
    return "Send";
  }, [composer.state.status]);

  useEffect(() => {
    liveValueRef.current = value;
  }, [value]);

  useEffect(() => {
    const SpeechRecognitionImpl = (() => {
      if (typeof window === "undefined") return null;
      const candidate = window as typeof window & { webkitSpeechRecognition?: new () => SpeechRecognition };
      return candidate.webkitSpeechRecognition || candidate.SpeechRecognition || null;
    })();
    if (SpeechRecognitionImpl) {
      setListeningSupported(true);
      const recognizer = new SpeechRecognitionImpl();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript ?? "")
          .join(" ");
        const nextValue = liveValueRef.current + transcript;
        onChange(nextValue);
        composer.updateInputs(nextValue, attachments);
      };
      recognizer.onend = () => composer.stopListening();
      recognizer.onerror = (event) => {
        setListeningError(event.error);
        composer.setError(event.error);
        composer.stopListening();
      };
      recognitionRef.current = recognizer;
    }
  }, [attachments, composer, onChange]);

  const commandActive = commandOpen || value.startsWith("/");

  const handleCommandSelect = (command: string) => {
    switch (command) {
      case "/attach":
      case "/file":
        fileInputRef.current?.click();
        break;
      case "/photo":
        photoInputRef.current?.click();
        break;
      case "/browse":
        onToggleBrowsing();
        break;
      case "/agent":
        onToggleAgent();
        break;
      default:
        break;
    }
    setCommandOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (commandActive) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => prev + 1);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands.length === 0) return;
        handleCommandSelect(filteredCommands[highlightedIndex % filteredCommands.length]);
        return;
      }
      if (e.key === "Escape") {
        setCommandOpen(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (composer.state.status !== "listening") onSend();
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setListeningSupported(false);
      setListeningError("Speech recognition unavailable");
      composer.setError("Speech recognition unavailable");
      return;
    }
    composer.startListening();
    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    composer.stopListening();
  };

  const micDisabled =
    !listeningSupported || composer.state.status === "sending" || composer.state.status === "responding";

  const sendDisabled = !composer.canSend;

  return (
    <div className="pointer-events-auto">
      <AttachmentTray attachments={attachments} onRemove={onRemoveAttachment} />
      <div className="relative mx-auto max-w-4xl rounded-[28px] bg-[color-mix(in_srgb,var(--panel-elevated)_88%,transparent)] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-1 ring-white/10 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <PlusMenu
            onPickFile={() => fileInputRef.current?.click()}
            onPickPhoto={() => photoInputRef.current?.click()}
            onOpenDriveModal={onOpenDriveModal}
            onOpenGithubModal={onOpenGithubModal}
          />
          <div className="relative flex-1">
            <TextareaAutosize
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
              composer.updateInputs(e.target.value, attachments);
              setCommandOpen(e.target.value.startsWith("/"));
            }}
              onKeyDown={handleKeyDown}
              maxRows={6}
              minRows={1}
              placeholder="Ask Toron anything…"
              className="w-full resize-none rounded-2xl bg-transparent px-3 py-3 text-sm text-[var(--text-primary)] outline-none"
            />
            <CommandPalette
              commands={filteredCommands}
              open={commandActive}
              highlightedIndex={highlightedIndex}
              setHighlightedIndex={setHighlightedIndex}
              onSelect={handleCommandSelect}
              onClose={() => setCommandOpen(false)}
            />
          </div>
          <button
            type="button"
            aria-label="Voice input"
            onClick={composer.state.status === "listening" ? stopListening : startListening}
            disabled={micDisabled}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--text-primary)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition ${
              composer.state.status === "listening" ? "ring-2 ring-[color-mix(in_srgb,var(--accent-primary)_45%,transparent)]" : "hover:bg-white/10"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <img src="/assets/icons/mic.svg" alt="Mic" className="h-4 w-4" />
          </button>
          <MoreMenu
            browsing={browsing}
            agentMode={agentMode}
            onToggleAgent={onToggleAgent}
            onToggleBrowsing={onToggleBrowsing}
          />
          <button
            type="button"
            onClick={onSend}
            disabled={sendDisabled}
            className={`flex h-10 items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_35%,transparent)] px-4 text-sm font-semibold text-[var(--text-primary)] shadow-[0_14px_46px_rgba(56,189,248,0.45)] transition disabled:cursor-not-allowed disabled:opacity-50 ${
              composer.state.status === "sending" || composer.state.status === "responding" ? "animate-pulse" : "hover:translate-y-[-1px]"
            }`}
          >
            <img src="/assets/icons/send.svg" alt="Send" className="h-4 w-4" />
            {sendButtonLabel}
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-[0.75rem] text-[var(--text-tertiary)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="opacity-70">Enter to send · Shift+Enter for newline</span>
            {composer.state.status === "listening" && (
              <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_20%,transparent)] px-2 py-0.5 text-[var(--accent-primary)]">
                Listening…
              </span>
            )}
            {listeningError && <span className="text-[var(--accent-secondary)]">{listeningError}</span>}
            {browsing && (
              <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_18%,transparent)] px-2 py-0.5 text-[var(--accent-primary)]">
                Browsing on
              </span>
            )}
            {agentMode && (
              <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-secondary)_18%,transparent)] px-2 py-0.5 text-[var(--accent-secondary)]">
                Agent mode
              </span>
            )}
          </div>
          <span className="opacity-70">Capsule composer · Glass surface</span>
        </div>
      </div>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) onAddAttachments(Array.from(e.target.files), "upload");
          composer.updateInputs(value, attachments);
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) onAddAttachments(Array.from(e.target.files), "upload");
          composer.updateInputs(value, attachments);
        }}
      />
      <div className="mt-2 text-center text-[0.72rem] font-medium text-[var(--text-secondary)] opacity-60">
        Toron can make mistakes. Please verify important information.
      </div>
    </div>
  );
}

export default ComposerBar;
