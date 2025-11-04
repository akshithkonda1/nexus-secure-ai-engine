import * as React from "react";
import { motion } from "framer-motion";
import { Mic, Paperclip, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useSession } from "@/shared/state/session";
import { ThemeToggle } from "@/shared/ui/theme/ThemeToggle";

// ---------- local helpers ----------

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
  window.dispatchEvent(new CustomEvent("nexus:prompt:insert", { detail: prompt }));
  if (navigate) navigate("/chat");
  else window.dispatchEvent(new CustomEvent("nexus:navigate", { detail: "/chat" }));
}

const PROMPTS = [
  { id: "verify", label: "Verify with web evidence", text: "Verify this with 3 reputable sources and cite them succinctly." },
  { id: "summ", label: "Summarize & synthesize", text: "Summarize the key points and synthesize a consensus answer." },
  { id: "critique", label: "Critique for bias", text: "Critique the reasoning for bias, missing context, and logical gaps." },
  { id: "code", label: "Generate testable code", text: "Write production-ready code with tests and a brief usage example." },
];

// quick TS shims so this compiles without extra types
declare global {
  interface SpeechRecognition extends EventTarget {
    start(): void;
    stop(): void;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((e: any) => void) | null;
  }
  var webkitSpeechRecognition: { new (): SpeechRecognition } | undefined;
  var SpeechRecognition: { new (): SpeechRecognition } | undefined;
}

// ---------- local dropdown (no external UI imports) ----------

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

function PromptBrowserButton({
  items,
  navigate,
}: {
  items: MenuItem[];
  navigate: (to: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = useClickOutside<HTMLDivElement>(() => setOpen(false));

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-full bg-trustBlue px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/60 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Prompt Browser
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[18rem] overflow-hidden rounded-xl border border-white/10 bg-panel text-ink shadow-xl backdrop-blur"
        >
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Quick Prompts
          </div>
          <div className="h-px w-full bg-white/10" />
          {items.map((it) => (
            <button
              key={it.key}
              role="menuitem"
              className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-muted outline-none transition hover:bg-white/5 hover:text-ink"
              onClick={() => {
                setOpen(false);
                it.onSelect();
              }}
            >
              {it.label}
            </button>
          ))}
          <div className="h-px w-full bg-white/10" />
          <button
            role="menuitem"
            className="block w-full cursor-pointer px-3 py-2 text-left text-xs text-muted outline-none transition hover:bg-white/5 hover:text-ink"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent("nexus:navigate", { detail: "/prompts" }));
            }}
          >
            Manage prompts…
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- main component ----------

export function UserBar() {
  const { user } = useSession();
  const name = user.name?.trim() || "Guest";
  const handle = user.handle ?? "@nexus";
  const initials = name
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navigate = useNavigate();

  // Attach
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const onAttachClick = () => fileInputRef.current?.click();
  const onFilesChosen: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    window.dispatchEvent(new CustomEvent("nexus:attach", { detail: files }));
    e.currentTarget.value = ""; // allow reselecting the same files
  };

  // Voice
  const [recording, setRecording] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<BlobPart[]>([]);
  const recRef = React.useRef<SpeechRecognition | null>(null);
  const [hasASR, setHasASR] = React.useState(false);

  React.useEffect(() => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
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
        window.dispatchEvent(new CustomEvent("nexus:voice:recording", { detail: { state: "start" } }));
      };
      mr.onstop = () => {
        setRecording(false);
        setBusy(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        window.dispatchEvent(new CustomEvent("nexus:voice:data", { detail: { blob, transcript: undefined } }));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;

      if (hasASR && recRef.current) {
        try {
          let tmp = "";
          recRef.current.onresult = (e) => {
            for (let i = e.resultIndex; i < e.results.length; i++) {
              const r = e.results[i];
              if (r.isFinal) tmp += r[0].transcript + " ";
            }
            window.dispatchEvent(new CustomEvent("nexus:voice:partial", { detail: tmp.trim() }));
          };
          recRef.current.start();
        } catch {/* ignore */ }
      }

      mr.start(100);
    } catch (err) {
      setBusy(false);
      console.error("Mic error", err);
      window.dispatchEvent(new CustomEvent("nexus:voice:error", { detail: err }));
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
      if (recRef.current) {
        try {
          recRef.current.stop();
        } catch {/* noop */ }
      }
    } catch {/* noop */ }
  };

  const toggleRecording = () => (recording ? stopRecording() : startRecording());

  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border-t border-app bg-panel px-4 py-4 text-muted backdrop-blur lg:px-8"
      aria-label="User controls"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Avatar + name -> open Profile modal via global event */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("nexus:profile:open"))}
          className="group flex items-center gap-3 rounded-xl p-1 text-left transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
          aria-label="Open profile"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-app text-base font-semibold text-ink">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink group-hover:opacity-90">{name}</p>
            <p className="text-xs text-muted">{handle}</p>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggle className="gap-2 rounded-full border border-app text-xs uppercase tracking-wide text-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg" />

          {/* Attach */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            onChange={onFilesChosen}
          />
          <button
            type="button"
            onClick={onAttachClick}
            className="inline-flex items-center gap-2 rounded-full border border-app px-3 py-1.5 text-xs font-medium text-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            Attach
          </button>

          {/* Voice */}
          <button
            type="button"
            onClick={toggleRecording}
            aria-pressed={recording}
            className={`inline-flex items-center gap-2 rounded-full border border-app px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg ${
              recording ? "text-ink bg-white/5" : "text-muted hover:text-ink"
            }`}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
            {recording ? "Stop" : "Voice"}
          </button>

          {/* Prompt Browser (local dropdown) */}
          <PromptBrowserButton
            navigate={navigate}
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
