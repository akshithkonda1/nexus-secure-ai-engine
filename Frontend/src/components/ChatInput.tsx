import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Sparkles, Paperclip } from "lucide-react";
import { VoiceRecorder } from "./VoiceRecorder";
import { FileUpload, InlineFileBadge } from "./FileUpload";
import { cn } from "@/lib/utils";

type ChatInputProps = {
  onSend: (payload: { text: string; files: File[] }) => void;
  suggestions?: string[];
  disabled?: boolean;
};

export function ChatInput({ onSend, suggestions = [], disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [value]);

  const canSend = useMemo(() => {
    return value.trim().length > 0 || files.length > 0;
  }, [value, files]);

  const handleSubmit = useCallback(() => {
    if (!canSend || disabled) return;
    onSend({ text: value.trim(), files });
    setValue("");
    setFiles([]);
  }, [canSend, disabled, files, onSend, value]);

  const handleVoiceCapture = useCallback(
    ({ transcript, blob }: { transcript: string; blob: Blob | null }) => {
      if (transcript) {
        setValue((prev) => (prev ? `${prev}\n${transcript}` : transcript));
      }
      if (blob) {
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: blob.type || "audio/webm"
        });
        setFiles((prev) => [...prev, file]);
      }
    },
    []
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-3xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] p-4 shadow-[var(--elev-1)] transition">
        <div className="flex flex-wrap gap-2 pb-3">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              className="group inline-flex items-center gap-2 rounded-full border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-3 py-1 text-xs font-semibold text-[color:var(--brand)] transition hover:border-[color:var(--ring)]"
              onClick={() => setValue((prev) => (prev ? `${prev}\n${suggestion}` : suggestion))}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {suggestion}
            </button>
          ))}
        </div>

        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((file, idx) => (
              <InlineFileBadge key={idx} file={file} onRemove={() => removeFile(idx)} />
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setUploading((state) => !state)}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] text-[rgb(var(--text))] transition hover:border-[color:var(--ring)] hover:text-[color:var(--ring)]",
                isUploading && "border-[color:var(--ring)] text-[color:var(--ring)]"
              )}
              aria-label="Attach files"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-1/2 top-[110%] z-20 w-[260px] -translate-x-1/2"
                >
                  <div className="rounded-3xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] p-3 shadow-[var(--elev-1)]">
                    <FileUpload
                      description="Drop reference documents, screenshots or audio"
                      onFiles={(incoming) => {
                        setFiles((prev) => [...prev, ...incoming]);
                        setUploading(false);
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              rows={1}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ask anything, drop a document, or dictate your intent…"
              className="max-h-40 w-full resize-none rounded-2xl border border-transparent bg-transparent px-4 py-3 text-[15px] leading-relaxed text-[rgb(var(--text))] outline-none placeholder:text-[color:rgba(var(--text)/0.5)]"
            />
          </div>

          <VoiceRecorder onCapture={handleVoiceCapture} />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSend || disabled}
            className={cn(
              "inline-flex h-11 min-w-[54px] items-center justify-center gap-2 rounded-2xl bg-[color:var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--elev-1)] transition",
              (!canSend || disabled) && "cursor-not-allowed opacity-60"
            )}
          >
            Send
            <CornerDownLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
