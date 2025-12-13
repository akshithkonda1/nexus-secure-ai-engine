import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flag, GitBranch, MoreHorizontal, RefreshCw, Volume2 } from "lucide-react";

import { safeFormatDistance } from "@/shared/lib/toronSafe";
import type { ToronMessage } from "@/state/toron/toronSessionTypes";

interface MessageBubbleProps {
  message: ToronMessage;
  onEdit: (message: ToronMessage) => void;
  onSaveToProject?: (content: string) => void;
}

export function MessageBubble({ message, onEdit, onSaveToProject }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isUser = message.role === "user";
  const timestamp = useMemo(() => safeFormatDistance(message.timestamp), [message.timestamp]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleRegenerate = (quality: "good" | "bad") => {
    console.info(`Regenerate (${quality}) requested for message ${message.id}`);
  };

  return (
    <article
      tabIndex={0}
      className={`group relative w-full border border-white/5 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl ${
        isUser
          ? "ml-auto max-w-3xl rounded-[18px] bg-[color-mix(in_srgb,var(--accent-primary)_14%,var(--panel-elevated))]"
          : "mr-auto max-w-4xl rounded-[20px] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)]"
      }`}
    >
      <header className="mb-2 flex items-center justify-between text-xs text-[var(--text-tertiary)]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--text-primary)]">{isUser ? "You" : "Toron"}</span>
          <span className="h-1 w-1 rounded-full bg-[var(--border-strong)]" />
          <span>{timestamp}</span>
          {message.meta?.browsing && (
            <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_25%,transparent)] px-2 py-0.5 text-[0.7rem] font-semibold text-[var(--accent-primary)]">
              Browsing
            </span>
          )}
          {message.meta?.agentMode && (
            <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-secondary)_25%,transparent)] px-2 py-0.5 text-[0.7rem] font-semibold text-[var(--accent-secondary)]">
              Agent Mode
            </span>
          )}
        </div>
        <div className="relative flex items-center gap-2 opacity-0 transition-opacity duration-100 group-hover:opacity-100 focus-within:opacity-100">
          {isUser ? (
            <>
              <button
                type="button"
                onClick={() => onEdit(message)}
                className="rounded-full px-2 py-1 text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-full px-2 py-1 text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-full px-2 py-1 text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
                aria-label="Copy assistant response"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={() => handleRegenerate("good")}
                className="flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-[var(--text-secondary)] transition hover:border-[var(--border-soft)] hover:bg-white/10 hover:text-[var(--text-primary)]"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Good response
              </button>
              <button
                type="button"
                onClick={() => handleRegenerate("bad")}
                className="flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-[var(--text-secondary)] transition hover:border-[var(--border-soft)] hover:bg-white/10 hover:text-[var(--text-primary)]"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Bad response
              </button>
              {onSaveToProject && (
                <button
                  type="button"
                  onClick={() => onSaveToProject(message.content)}
                  className="rounded-full px-2 py-1 text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
                >
                  Save
                </button>
              )}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <MoreHorizontal className="h-4 w-4" /> More
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_94%,transparent)] p-2 shadow-xl"
                      role="menu"
                    >
                      <MenuItem icon={<Volume2 className="h-4 w-4" />} label="Read aloud" />
                      <MenuItem icon={<GitBranch className="h-4 w-4" />} label="Branch new chat" />
                      <MenuItem icon={<Flag className="h-4 w-4" />} label="Report message" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </header>
      <div className="prose prose-invert max-w-none text-sm leading-relaxed text-[var(--text-primary)]">
        {message.content}
      </div>
      {message.attachments?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {message.attachments.map((attachment) => (
            <span
              key={attachment.id}
              className="rounded-full bg-white/5 px-3 py-1 text-[0.75rem] text-[var(--text-primary)]"
            >
              {attachment.name} · {attachment.type}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[var(--text-primary)] transition hover:bg-[color-mix(in_srgb,var(--accent-secondary)_10%,transparent)]"
      role="menuitem"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent-secondary)_12%,transparent)] text-[var(--text-primary)]">
        {icon}
      </span>
      <span className="leading-tight">{label}</span>
    </button>
  );
}

export default MessageBubble;
