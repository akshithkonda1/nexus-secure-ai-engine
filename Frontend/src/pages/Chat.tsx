// Frontend/src/features/chat/ChatPage.tsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Paperclip, X, Loader2 } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useChatSession } from "./hooks/useChatSession";
import { MessageBubble } from "./components/MessageBubble";
import { TypingIndicator } from "./components/TypingIndicator";
import { AttachmentChip } from "./components/AttachmentChip";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import type { Attachment, Message } from "./types";

const MAX_INPUT_LENGTH = 4000;
const MAX_ATTACHMENTS = 5;

export default function ChatPage() {
  const { id } = useParams<{ id?: string }>();
  const sessionId = id || "new";

  // Chat state management
  const { messages, isConnected, isTyping, error, sendMessage, reconnect } = 
    useChatSession(sessionId);

  // Input state
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Virtualization for performance with many messages
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 100, // Estimated message height
    overscan: 5,
  });

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = "0px";
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = Math.min(scrollHeight, 160) + "px";
  }, [input]);

  // Auto-scroll to bottom when new messages arrive (if user is near bottom)
  useEffect(() => {
    if (isAtBottom && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isAtBottom]);

  // Track scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsAtBottom(nearBottom);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newAttachments: Attachment[] = [];
    
    for (let i = 0; i < files.length && attachments.length + newAttachments.length < MAX_ATTACHMENTS; i++) {
      const file = files[i];
      
      // Validate file
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        console.warn(`File ${file.name} exceeds 10MB limit`);
        continue;
      }
      
      newAttachments.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        previewUrl: file.type.startsWith("image/") 
          ? URL.createObjectURL(file) 
          : undefined,
      });
    }
    
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  // Remove attachment
  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  // Send message
  const handleSend = async () => {
    const trimmedInput = input.trim();
    
    if (!trimmedInput && attachments.length === 0) return;
    if (!isConnected) return;

    try {
      await sendMessage({
        text: trimmedInput,
        attachments: attachments.map((a) => a.file),
      });

      // Clear input and attachments
      setInput("");
      setAttachments((prev) => {
        prev.forEach((a) => {
          if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
        });
        return [];
      });

      // Focus textarea
      textareaRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // Disable send button logic
  const canSend = isConnected && (input.trim().length > 0 || attachments.length > 0);

  return (
    <div className="flex h-screen flex-col bg-app text-ink">
      {/* Error banner */}
      {error && (
        <ErrorBanner
          message={error}
          onDismiss={() => reconnect()}
          action={{ label: "Reconnect", onClick: reconnect }}
        />
      )}

      {/* Connection status */}
      {!isConnected && !error && (
        <div className="flex items-center justify-center gap-2 border-b border-app bg-yellow-500/10 px-4 py-2 text-sm text-yellow-700 dark:text-yellow-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting to Nexus...
        </div>
      )}

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8"
      >
        <div className="mx-auto max-w-3xl">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const message = messages[virtualItem.index];
              return (
                <div
                  key={message.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <MessageBubble message={message} />
                </div>
              );
            })}
          </div>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-start"
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <button
          onClick={() => {
            scrollContainerRef.current?.scrollTo({
              top: scrollContainerRef.current.scrollHeight,
              behavior: "smooth",
            });
          }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 rounded-full border border-app bg-panel px-4 py-2 text-sm shadow-lg transition hover:shadow-xl"
        >
          ↓ New messages
        </button>
      )}

      {/* Composer */}
      <div className="border-t border-app bg-panel/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          {/* Attachments */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-2 flex flex-wrap gap-2 overflow-hidden"
              >
                {attachments.map((attachment) => (
                  <AttachmentChip
                    key={attachment.id}
                    attachment={attachment}
                    onRemove={removeAttachment}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input row */}
          <div className="flex items-end gap-2">
            {/* File input (hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            {/* Attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={attachments.length >= MAX_ATTACHMENTS}
              className="grid h-10 w-10 place-items-center rounded-full bg-app text-muted transition hover:bg-app/80 hover:text-ink disabled:opacity-50"
              aria-label="Attach files"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            {/* Text input */}
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
                onKeyDown={handleKeyDown}
                placeholder="Message Nexus..."
                rows={1}
                className="w-full resize-none rounded-2xl border border-app bg-app px-4 py-3 pr-16 text-sm text-ink outline-none placeholder:text-muted focus:border-trustBlue/50 focus:ring-2 focus:ring-trustBlue/20"
              />
              <div className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted">
                {input.length > MAX_INPUT_LENGTH * 0.9 && 
                  `${input.length}/${MAX_INPUT_LENGTH}`
                }
              </div>
            </div>

            {/* Send button */}
            <motion.button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              whileHover={canSend ? { scale: 1.05 } : {}}
              whileTap={canSend ? { scale: 0.95 } : {}}
              className="grid h-10 w-10 place-items-center rounded-full bg-trustBlue text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Helper text */}
          <p className="mt-2 text-center text-xs text-muted">
            <kbd className="rounded bg-app px-1.5 py-0.5 font-mono text-xs">⌘</kbd> +{" "}
            <kbd className="rounded bg-app px-1.5 py-0.5 font-mono text-xs">Enter</kbd> to send
          </p>
        </div>
      </div>
    </div>
  );
}
