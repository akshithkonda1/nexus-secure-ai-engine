import { useEffect, useMemo, useRef, useState } from "react";
import VoiceRecorder from "./VoiceRecorder";

type Props = {
  onSend: (text: string, files: File[]) => void;
  suggestions?: string[];
  onPickSuggestion?: (s: string) => void;
};

const Paperclip = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" className={p.className}>
    <path d="M21 7L10 18a5 5 0 11-7-7l11-11" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const Send = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" className={p.className}>
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" />
    <path d="M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export default function ChatInput({ onSend, suggestions = [], onPickSuggestion }: Props) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [recording, setRecording] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // autosize textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.min(180, ta.scrollHeight) + "px";
  }, [text]);

  const canSend = useMemo(() => text.trim().length > 0 || files.length > 0, [text, files]);

  function handleAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const f = Array.from(e.target.files || []);
    if (f.length) setFiles((prev) => [...prev, ...f]);
    e.currentTarget.value = "";
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function submit() {
    if (!canSend) return;
    onSend(text.trim(), files);
    setText("");
    setFiles([]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/80 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.12)] backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-neutral-800 dark:bg-neutral-900/80">
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => (onPickSuggestion ? onPickSuggestion(s) : setText(s))}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 hover:border-blue-300 hover:text-blue-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
              title="Insert suggestion"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Files preview */}
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((f, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              {f.name}
              <button
                onClick={() => removeFile(idx)}
                className="rounded p-1 text-neutral-400 hover:text-red-500"
                aria-label="Remove file"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attach */}
        <button
          onClick={() => fileRef.current?.click()}
          className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          title="Attach files"
          aria-label="Attach files"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={handleAttach} />

        {/* Textarea */}
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message Nexus…"
          rows={1}
          className="max-h-44 min-h-[2.5rem] w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[15px] leading-relaxed text-neutral-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
        />

        {/* Voice */}
        <div className="relative">
          <VoiceRecorder
            active={recording}
            onStart={() => setRecording(true)}
            onStop={(transcript, blob) => {
              setRecording(false);
              if (transcript && transcript.trim()) {
                setText((t) => (t ? t + "\n" + transcript : transcript));
              }
              if (blob) {
                const file = new File([blob], "voice.webm", { type: "audio/webm" });
                setFiles((prev) => [...prev, file]);
              }
            }}
            onError={() => setRecording(false)}
          />
        </div>

        {/* Send */}
        <button
          onClick={submit}
          disabled={!canSend}
          className={`grid h-10 w-10 place-items-center rounded-xl border transition ${
            canSend
              ? "border-blue-500 bg-blue-600 text-white hover:bg-blue-700"
              : "border-neutral-200 bg-white text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900"
          }`}
          title="Send"
          aria-label="Send"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
