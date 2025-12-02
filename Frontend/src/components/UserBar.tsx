import * as React from "react";
import { motion } from "framer-motion";
import { Mic, Paperclip, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ThemeToggle } from "@/shared/ui/theme/ThemeToggle";

/* =========================
   Prompt helpers
   ========================= */
async function copyAndJump(prompt: string, navigate?: (to: string) => void) {
  try {
    await navigator.clipboard.writeText(prompt);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = prompt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  window.dispatchEvent(new CustomEvent("ryuzen:prompt:insert", { detail: prompt }));
  if (navigate) navigate("/chat");
  else window.dispatchEvent(new CustomEvent("ryuzen:navigate", { detail: "/chat" }));
}

const PROMPTS = [
  { id: "verify", label: "Verify with web evidence", text: "Verify this with 3 reputable sources and cite them succinctly." },
  { id: "summ", label: "Summarize & synthesize", text: "Summarize the key points and synthesize a consensus answer." },
  { id: "critique", label: "Critique for bias", text: "Critique the reasoning for bias, missing context, and logical gaps." },
  { id: "code", label: "Generate testable code", text: "Write production-ready code with tests and a brief usage example." },
];

/* =========================
   TS shims for Web Speech
   ========================= */
declare global {
  interface SpeechRecognitionAlternative {
    transcript: string;
  }

  interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: {
      length: number;
      [index: number]: SpeechRecognitionResult;
    };
  }

  interface SpeechRecognition extends EventTarget {
    start(): void;
    stop(): void;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
  }

  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
  }
}

/* =========================
   Local dropdown
   ========================= */
type MenuItem = { key: string; label: string; onSelect: () => void };

function useClickOutside<T extends HTMLElement>(onAway: () => void) {
  const ref = React.useRef<T | null>(null);
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onAway();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onAway]);
  return ref;
}

function PromptBrowserButton({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = React.useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(() => setOpen(false));

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-full bg-trustBlue px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--on-accent))] transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/60 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Prompt Browser
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[18rem] overflow-hidden rounded-xl border border-[rgba(var(--border),0.35)] bg-panel panel panel--glassy panel--hover text-ink shadow-xl backdrop-blur"
        >
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">Quick Prompts</div>
          <div className="h-px w-full bg-[rgba(var(--border),0.35)]" />
          {items.map((it) => (
            <button
              key={it.key}
              role="menuitem"
              className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-muted outline-none transition hover:bg-[rgba(var(--panel),0.2)] hover:text-ink"
              onClick={() => {
                setOpen(false);
                it.onSelect();
              }}
            >
              {it.label}
            </button>
          ))}
          <div className="h-px w-full bg-[rgba(var(--border),0.35)]" />
          <button
            role="menuitem"
            className="block w-full cursor-pointer px-3 py-2 text-left text-xs text-muted outline-none transition hover:bg-[rgba(var(--panel),0.2)] hover:text-ink"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent("ryuzen:navigate", { detail: "/prompts" }));
            }}
          >
            Manage prompts…
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================
   Main component (UserBar)
   ========================= */
export function UserBar() {
  const navigate = useNavigate();

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const onAttachClick = () => fileInputRef.current?.click();
  const onFilesChosen: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    window.dispatchEvent(new CustomEvent("ryuzen:attach", { detail: files }));
    e.currentTarget.value = "";
  };

  const [recording, setRecording] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<BlobPart[]>([]);
  const recRef = React.useRef<SpeechRecognition | null>(null);
  const [hasASR, setHasASR] = React.useState(false);

  React.useEffect(() => {
    const SR = window.webkitSpeechRecognition ?? window.SpeechRecognition;
    if (SR) {
      const rec: SpeechRecognition = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      recRef.current = rec;
      setHasASR(true);
    }
  }, []);

  const startRecording = async () => {
    try {
      setBusy(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstart = () => {
        setRecording(true);
        window.dispatchEvent(new CustomEvent("ryuzen:voice:recording", { detail: { state: "start" } }));
      };
      mr.onstop = () => {
        setRecording(false);
        setBusy(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        window.dispatchEvent(new CustomEvent("ryuzen:voice:data", { detail: { blob, transcript: undefined } }));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;

      if (hasASR && recRef.current) {
        try {
          let tmp = "";
          recRef.current.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const result = event.results[i];
              if (result.isFinal) tmp += result[0].transcript + " ";
            }
            window.dispatchEvent(new CustomEvent("ryuzen:voice:partial", { detail: tmp.trim() }));
          };
          recRef.current.start();
        } catch {
          // ignore ASR start errors
        }
      }

      mr.start(100);
    } catch (err) {
      setBusy(false);
      console.error("Mic error", err);
      window.dispatchEvent(new CustomEvent("ryuzen:voice:error", { detail: err }));
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
      if (recRef.current) {
        try {
          recRef.current.stop();
        } catch {
          // ignore ASR stop failures
        }
      }
    } catch {
      // ignore unexpected recorder stop errors
    }
  };

  const toggleRecording = () => (recording ? stopRecording() : startRecording());

  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border-t border-app bg-panel panel panel--glassy panel--hover px-4 py-4 text-muted backdrop-blur lg:px-8"
      aria-label="User controls"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggle className="gap-2 rounded-full border border-app text-xs uppercase tracking-wide text-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg" />

          <input ref={fileInputRef} type="file" className="hidden" multiple onChange={onFilesChosen} />
          <button
            type="button"
            onClick={onAttachClick}
            className="inline-flex items-center gap-2 rounded-full border border-app px-3 py-1.5 text-xs font-medium text-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            Attach
          </button>

          <button
            type="button"
            onClick={toggleRecording}
            aria-pressed={recording}
            className={`inline-flex items-center gap-2 rounded-full border border-app px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg ${recording ? "text-ink bg-[rgba(var(--panel),0.22)]" : "text-muted hover:text-ink"}`}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
            {recording ? "Stop" : "Voice"}
          </button>

          <PromptBrowserButton
            items={PROMPTS.map((p) => ({
              key: p.id,
              label: p.label,
              onSelect: () => copyAndJump(p.text, navigate),
            }))}
          />
        </div>
      </div>
    </motion.footer>
  );
}
