import { motion } from "framer-motion";
import { Mic, Paperclip, Sparkles, Loader2 } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";

import { useSession } from "@/shared/state/session";
import { ThemeToggle } from "@/shared/ui/theme/ThemeToggle";

// shadcn menu (or your equivalent)
// ⬇️ was "@/components/ui/dropdown-menu"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

// ⬇️ was "@/features/profile/NexusProfile"
import { useProfileModal } from "../features/profile/NexusProfile";


// --- helper: copy + navigate + dispatch
async function copyAndJump(prompt: string, navigate?: (to: string) => void) {
  try {
    await navigator.clipboard.writeText(prompt);
  } catch {
    // fallback: create a temp input
    const ta = document.createElement("textarea");
    ta.value = prompt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  // let chat input know
  window.dispatchEvent(new CustomEvent("nexus:prompt:insert", { detail: prompt }));
  // navigate to chat (use your router or event)
  if (navigate) navigate("/chat");
  else window.dispatchEvent(new CustomEvent("nexus:navigate", { detail: "/chat" }));
}

// sample prompts — replace with your own
const PROMPTS = [
  { id: "verify", label: "Verify with web evidence", text: "Verify this with 3 reputable sources and cite them succinctly." },
  { id: "summ", label: "Summarize & synthesize", text: "Summarize the key points and synthesize a consensus answer." },
  { id: "critique", label: "Critique for bias", text: "Critique the reasoning for bias, missing context, and logical gaps." },
  { id: "code", label: "Generate testable code", text: "Write production-ready code with tests and a brief usage example." },
];

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

  const { open: openProfile } = useProfileModal();
  const navigate = useNavigate();

  // ---------- Attach ----------
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const onAttachClick = () => fileInputRef.current?.click();
  const onFilesChosen: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    window.dispatchEvent(new CustomEvent("nexus:attach", { detail: files }));
    // clear for same-file reselects
    e.currentTarget.value = "";
  };

  // ---------- Voice (MediaRecorder + optional Web Speech transcript) ----------
  const [recording, setRecording] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<BlobPart[]>([]);

  // optional speech recognition for quick transcript
  const recRef = React.useRef<SpeechRecognition | null>(null);
  const [hasASR, setHasASR] = React.useState(false);

  React.useEffect(() => {
    // feature detect Web Speech API
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
      mr.onstop = async () => {
        setRecording(false);
        setBusy(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        let transcript: string | undefined;

        // optional: quick client-side transcript (not super accurate, but handy)
        // We only capture interim during recording; as a simple fallback,
        // you can leave this undefined and transcribe on the server later.
        // Here we do nothing additional on stop.

        window.dispatchEvent(new CustomEvent("nexus:voice:data", { detail: { blob, transcript } }));
        // stop tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = mr;

      // kick off optional ASR
      if (hasASR && recRef.current) {
        try {
          let tmp = "";
          recRef.current.onresult = (e) => {
            for (let i = e.resultIndex; i < e.results.length; i++) {
              const r = e.results[i];
              if (r.isFinal) tmp += r[0].transcript + " ";
            }
            // keep last partial transcript available live
            window.dispatchEvent(new CustomEvent("nexus:voice:partial", { detail: tmp.trim() }));
          };
          recRef.current.start();
        } catch {
          /* ignore */
        }
      }

      mr.start(100); // gather small chunks
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
        } catch {/* noop */}
      }
    } catch {/* noop */}
  };

  const toggleRecording = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border-t border-app bg-panel px-4 py-4 text-muted backdrop-blur lg:px-8"
      aria-label="User controls"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Avatar + name -> opens Profile */}
        <button
          type="button"
          onClick={openProfile}
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

          {/* Prompt Browser */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-trustBlue px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/60 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Prompt Browser
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[18rem]" align="end">
              <DropdownMenuLabel className="text-xs uppercase tracking-wide">Quick Prompts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PROMPTS.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => copyAndJump(p.text, navigate)}
                  className="text-sm"
                >
                  {p.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // open a dedicated prompts page if you have one
                  window.dispatchEvent(new CustomEvent("nexus:navigate", { detail: "/prompts" }));
                }}
                className="text-xs text-muted"
              >
                Manage prompts…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.footer>
  );
}
