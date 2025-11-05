import { useEffect, useRef, useState } from "react";
import * as React from "react";
import { motion } from "framer-motion";
import { Paperclip, Mic, Send, Sparkles, Loader2, ChevronDown } from "lucide-react";

/** ─────────────────────────────────────────────
 * Minimal in-memory chat model (stub your engine)
 * ───────────────────────────────────────────── */
type Msg = { id: string; role: "user" | "assistant" | "system"; text: string };
const demoReply = (q: string) =>
  `Working on it… (fake reply)\n\nYou asked:\n> ${q}\n\nThis is where your debate/consensus response will render.`;

/** ─────────────────────────────────────────────
 * Message bubble
 * ───────────────────────────────────────────── */
function MessageBubble({ m }: { m: Msg }) {
  const mine = m.role === "user";
  const system = m.role === "system";
import { Mic, Paperclip, Sparkles, Loader2, Camera, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useSession } from "@/shared/state/session";
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

/* =========================
   TS shims for Web Speech
   ========================= */
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

function PromptBrowserButton({
  items,
  navigate,
}: { items: MenuItem[]; navigate: (to: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(() => setOpen(false));

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[75ch] whitespace-pre-wrap leading-relaxed",
          "rounded-2xl px-4 py-3 shadow-sm",
          system
            ? "bg-white/5 text-muted border border-white/10"
            : mine
            ? "bg-trustBlue/10 border border-trustBlue/20 text-ink"
            : "bg-panel border border-white/10 text-ink",
        ].join(" ")}
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-full bg-trustBlue px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/60 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
      >
        {m.text}
      </div>
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Prompt Browser
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[18rem] overflow-hidden rounded-xl border border-white/10 bg-panel text-ink shadow-xl backdrop-blur"
        >
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">Quick Prompts</div>
          <div className="h-px w-full bg-white/10" />
          {items.map(it => (
            <button
              key={it.key}
              role="menuitem"
              className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-muted outline-none transition hover:bg-white/5 hover:text-ink"
              onClick={() => { setOpen(false); it.onSelect(); }}
            >
              {it.label}
            </button>
          ))}
          <div className="h-px w-full bg-white/10" />
          <button
            role="menuitem"
            className="block w-full cursor-pointer px-3 py-2 text-left text-xs text-muted outline-none transition hover:bg-white/5 hover:text-ink"
            onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent("nexus:navigate", { detail: "/prompts" })); }}
          >
            Manage prompts…
          </button>
        </div>
      )}
    </div>
  );
}

/** ─────────────────────────────────────────────
 * Composer (sticky bottom)
 * ───────────────────────────────────────────── */
function Composer({
  value,
  setValue,
  onSend,
  busy,
  onAttach,
  onToggleVoice,
  recording,
  onOpenPromptBrowser,
}: {
  value: string;
  setValue: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  onAttach: (files: FileList) => void;
  onToggleVoice: () => void;
  recording: boolean;
  onOpenPromptBrowser: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // auto-grow textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.min(220, Math.max(56, ta.scrollHeight)) + "px";
  }, [value]);
/* =========================
   Local Profile store + helpers
   ========================= */
type Profile = {
  id: string;
  displayName: string;
  handle: string;
  about?: string;
  avatarDataUrl?: string; // JPEG data URL (compressed)
};

const STORAGE_KEY = "nexus.profile.v1";
const DEFAULT_PROFILE: Profile = {
  id: "local",
  displayName: "John Doe",
  handle: "@nexus",
  about: "",
};

function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Profile) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function safeSaveProfile(p: Profile): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    window.dispatchEvent(new CustomEvent("nexus:profile:update", { detail: p }));
    return true;
  } catch {
    return false; // quota / serialization error
  }
}

/** Downscale + JPEG-compress an image File or dataURL to a sane size for localStorage. */
async function toCompressedDataUrl(
  fileOrDataUrl: File | string,
  maxSide = 512,
  quality = 0.85
): Promise<string> {
  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const dataUrl =
    typeof fileOrDataUrl === "string"
      ? fileOrDataUrl
      : await new Promise<string>((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result as string);
          fr.onerror = rej;
          fr.readAsDataURL(fileOrDataUrl);
        });

  const img = await loadImage(dataUrl);

  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, 0, 0, w, h);

  // Always store as JPEG to keep size tiny
  return canvas.toDataURL("image/jpeg", quality);
}

/* =========================
   Profile Modal (instant autosave + robust avatar)
   ========================= */
function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [profile, setProfile] = React.useState<Profile>(() => loadProfile());
  const [name, setName] = React.useState(profile.displayName);
  const [about, setAbout] = React.useState(profile.about ?? "");
  const [avatar, setAvatar] = React.useState<string | undefined>(profile.avatarDataUrl);

  const [saveState, setSaveState] =
    React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  // avoid first-render autosave
  const didInitRef = React.useRef(false);
  // frame-throttle saves so typing doesn’t spam localStorage
  const rafRef = React.useRef<number | null>(null);

  // Close on Esc
  React.useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // Lock scroll while open
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Reload from storage on open
  React.useEffect(() => {
    if (!open) return;
    const p = loadProfile();
    setProfile(p);
    setName(p.displayName);
    setAbout(p.about ?? "");
    setAvatar(p.avatarDataUrl);
    setSaveState("idle");
    setErrMsg(null);
    didInitRef.current = true;
  }, [open]);

  const canSave = name.trim().length >= 2;

  const draft = React.useCallback((): Profile => ({
    ...profile,
    displayName: name.trim().slice(0, 48),
    about: (about ?? "").slice(0, 240),
    avatarDataUrl: avatar,
  }), [profile, name, about, avatar]);

  const commitNow = React.useCallback((next?: Profile) => {
    const payload = next ?? draft();
    setSaveState("saving");
    setErrMsg(null);
    const ok = safeSaveProfile(payload);
    if (ok) {
      setProfile(payload);
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 700);
    } else {
      setSaveState("error");
      setErrMsg("Couldn’t save locally (storage quota or browser settings). Try removing or re-uploading a smaller photo.");
    }
    return ok;
  }, [draft]);

  // Instant autosave on every change (throttled to animation frames)
  const scheduleAutosave = React.useCallback(() => {
    if (!open || !didInitRef.current || !canSave) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setSaveState("saving");
    rafRef.current = requestAnimationFrame(() => {
      commitNow(); // synchronous localStorage write
    });
  }, [open, canSave, commitNow]);

  React.useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    try {
      setSaveState("saving");
      setErrMsg(null);
      // compress to small JPEG for reliable localStorage fit
      const dataUrl = await toCompressedDataUrl(file, 512, 0.85);
      setAvatar(dataUrl);
      // commit immediately with the new avatar
      const ok = commitNow({ ...draft(), avatarDataUrl: dataUrl });
      if (!ok) {
        // as a fallback, try even smaller
        const tiny = await toCompressedDataUrl(dataUrl, 320, 0.72);
        setAvatar(tiny);
        commitNow({ ...draft(), avatarDataUrl: tiny });
      }
    } catch (e) {
      setSaveState("error");
      setErrMsg("Couldn’t read that image. Try a PNG/JPG under ~5MB.");
    }
  };

  const initials = (name || "User").split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

  const manualSave = () => {
    if (!canSave) return;
    const ok = commitNow();
    if (ok) onClose();
  };

  if (!open) return null;

  return (
    <div className="sticky bottom-0 z-10 border-t border-app bg-app-surface/92 backdrop-blur supports-[backdrop-filter]:bg-app-surface/80">
      <div className="mx-auto w-full max-w-3xl px-4 py-3">
        <div className="rounded-2xl border border-app bg-panel shadow-inner">
          <div className="flex items-end gap-2 px-3 pt-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mb-2 inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-app px-2 text-muted hover:text-ink"
              title="Attach"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea
              ref={taRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Message Nexus…"
              className="min-h-[56px] max-h-[220px] w-full resize-none bg-transparent px-1 py-2 text-[15px] text-ink outline-none placeholder:text-muted"
            />
            <button
              type="button"
              onClick={onToggleVoice}
              className={`mb-2 inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-app px-2 text-muted hover:text-ink ${
                recording ? "bg-white/5 text-ink" : ""
              }`}
              title="Voice"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onOpenPromptBrowser}
              className="mb-2 inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-app px-2 text-muted hover:text-ink"
              title="Prompt Browser"
            >
              <Sparkles className="h-4 w-4" />
            </button>
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-[min(92vw,640px)] max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-app-surface/95 p-5 text-ink shadow-2xl"
      >
        <form onSubmit={(e) => { e.preventDefault(); manualSave(); }} className="contents">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Profile</h2>
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted" aria-live="polite" aria-atomic="true">
                {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : saveState === "error" ? "Save failed" : null}
              </p>
              <button
                onClick={onClose}
                type="button"
                className="rounded-full p-2 text-muted transition hover:bg-white/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
                aria-label="Close profile"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-app px-3 py-2">
            <p className="text-xs text-muted">Shift + Enter for new line</p>

          {/* Photo */}
          <div className="mb-5 rounded-2xl border border-white/10 bg-panel/80 p-4">
            <p className="mb-3 text-sm font-medium">Photo</p>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full ring-1 ring-white/15">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-app text-sm font-semibold text-ink">
                    {initials}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleFile(f);
                    e.currentTarget.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-md border border-app px-3 py-1.5 text-sm text-muted transition hover:text-ink"
                >
                  <Camera className="h-4 w-4" /> Upload
                </button>
                <button
                  type="button"
                  onClick={() => { setAvatar(undefined); scheduleAutosave(); }}
                  className="inline-flex items-center gap-2 rounded-md border border-app px-3 py-1.5 text-sm text-muted transition hover:text-ink"
                >
                  <X className="h-4 w-4" /> Remove
                </button>
              </div>
            </div>
            {errMsg && <p className="mt-3 text-xs text-red-400">{errMsg}</p>}
          </div>

          {/* Identity */}
          <div className="mb-5 rounded-2xl border border-white/10 bg-panel/80 p-4">
            <p className="mb-3 text-sm font-medium">Identity</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="prof-name" className="mb-1 block text-xs text-muted">Display name</label>
                <input
                  id="prof-name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); scheduleAutosave(); }}
                  placeholder="Jane Appleseed"
                  className="w-full rounded-md border border-app bg-transparent px-3 py-2 text-sm text-ink outline-none placeholder:text-muted"
                />
                <p className="mt-1 text-xs text-muted">{Math.min(name.trim().length, 48)}/48</p>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-muted">Handle</label>
                <div className="rounded-md border border-app bg-white/5 px-3 py-2 text-sm text-muted">{profile.handle}</div>
              </div>
              <div className="sm:col-span-6">
                <label htmlFor="prof-about" className="mb-1 block text-xs text-muted">About</label>
                <textarea
                  id="prof-about"
                  value={about}
                  onChange={(e) => { setAbout(e.target.value); scheduleAutosave(); }}
                  maxLength={240}
                  placeholder="A line about you (max 240)."
                  className="h-24 w-full resize-none rounded-md border border-app bg-transparent px-3 py-2 text-sm text-ink outline-none placeholder:text-muted"
                />
                <p className="mt-1 text-right text-xs text-muted">{Math.min(about.length, 240)}/240</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md px-3 py-1.5 text-sm text-muted transition hover:text-ink">
              Cancel
            </button>
            <button
              type="button"
              onClick={onSend}
              disabled={!value.trim() || busy}
              className="inline-flex items-center gap-2 rounded-full bg-trustBlue px-4 py-2 text-sm font-semibold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-lg disabled:opacity-50"
              type="submit"
              disabled={!canSave}
              aria-disabled={!canSave}
              className="inline-flex items-center gap-2 rounded-md bg-trustBlue px-4 py-1.5 text-sm font-semibold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-lg disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
              {saveState === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length) onAttach(e.target.files);
          e.currentTarget.value = "";
        }}
      />
        </form>
      </motion.div>
    </div>
  );
}

/** ─────────────────────────────────────────────
 * Chat Page (ChatGPT-like)
 * ───────────────────────────────────────────── */
export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "sys-hello",
      role: "system",
      text:
        "BETA — Your queries help improve Nexus. We orchestrate a debate between models, verify with the web, and synthesize a consensus you can trust.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);

  // scroll/viewport handling
  const listRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = useState(true);

  // observe bottom sentinel to decide auto-scroll
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setAtBottom(entries[0]?.isIntersecting ?? true),
      { root: listRef.current, threshold: 1 }
    );
    io.observe(el);
    return () => io.disconnect();
/* =========================
   Main component (UserBar)
   ========================= */
export function UserBar() {
  const { user } = useSession();
  const navigate = useNavigate();

  // Local profile overrides session display
  const [profile, setProfile] = React.useState<Profile>(() => loadProfile());
  React.useEffect(() => {
    const onUpdate = (e: Event) => {
      const p = (e as CustomEvent<Profile>).detail;
      if (p) setProfile(p);
    };
    window.addEventListener("nexus:profile:update", onUpdate as EventListener);
    return () => window.removeEventListener("nexus:profile:update", onUpdate as EventListener);
  }, []);

  // auto-scroll only if at bottom
  useEffect(() => {
    if (atBottom) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs.length, busy, atBottom]);
  const displayName = profile.displayName || user.name?.trim() || "Guest";
  const handle = profile.handle ?? user.handle ?? "@nexus";
  const initials = displayName.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();

  // Global event hooks — FIXED newline + no shadowing with onAttach(files)
  useEffect(() => {
    const onPrompt = (e: Event) => {
      const prompt = (e as CustomEvent<string>).detail;
      if (typeof prompt === "string") setInput((prev) => (prev ? prev + "\n" : "") + prompt);
    };
  const [profileOpen, setProfileOpen] = React.useState(false);

    // Renamed to avoid shadowing the local onAttach(files: FileList)
    const onAttachEvent = (e: Event) => {
      const files = (e as CustomEvent<FileList>).detail;
      if (files?.length) {
        const names = Array.from(files).map((f) => f.name).join(", ");
        setInput((v) => `${v ? `${v}\n` : ""}Attached: ${names}`);
      }
    };
  // Attach
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const onAttachClick = () => fileInputRef.current?.click();
  const onFilesChosen: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    window.dispatchEvent(new CustomEvent("nexus:attach", { detail: files }));
    e.currentTarget.value = "";
  };

    const onVoicePartial = (e: Event) => {
      const partial = (e as CustomEvent<string>).detail;
      if (partial) setInput(partial);
    };
  // Voice
  const [recording, setRecording] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<BlobPart[]>([]);
  const recRef = React.useRef<SpeechRecognition | null>(null);
  const [hasASR, setHasASR] = React.useState(false);

    window.addEventListener("nexus:prompt:insert", onPrompt as EventListener);
    window.addEventListener("nexus:attach", onAttachEvent as EventListener);
    window.addEventListener("nexus:voice:partial", onVoicePartial as EventListener);
    return () => {
      window.removeEventListener("nexus:prompt:insert", onPrompt as EventListener);
      window.removeEventListener("nexus:attach", onAttachEvent as EventListener);
      window.removeEventListener("nexus:voice:partial", onVoicePartial as EventListener);
    };
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

  // Send message (stub: replace with engine call/stream)
  const send = async () => {
    const q = input.trim();
    if (!q) return;
    setBusy(true);
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "user", text: q }]);
    setInput("");
    window.dispatchEvent(new CustomEvent("nexus:chat:send", { detail: { text: q } }));

    await new Promise((r) => setTimeout(r, 400));
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "assistant", text: demoReply(q) }]);
    setBusy(false);
  };

  // Voice toggle (reuses your global pipeline)
  const toggleVoice = () => {
    setRecording((r) => !r);
    window.dispatchEvent(
      new CustomEvent("nexus:voice:recording", { detail: { state: recording ? "stop" : "start" } })
    );
  };
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

  const openPromptBrowser = () => window.dispatchEvent(new CustomEvent("nexus:prompts:open"));
  const onAttach = (files: FileList) => window.dispatchEvent(new CustomEvent("nexus:attach", { detail: files }));
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
        } catch { /* ignore */ }
      }

  // Drag & drop + paste to attach
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) onAttach(e.dataTransfer.files);
      mr.start(100);
    } catch (err) {
      setBusy(false);
      console.error("Mic error", err);
      window.dispatchEvent(new CustomEvent("nexus:voice:error", { detail: err }));
    }
  };
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => e.preventDefault();
  const onPaste: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    const items = e.clipboardData?.files;
    if (items?.length) onAttach(items);
  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
      if (recRef.current) { try { recRef.current.stop(); } catch {} }
    } catch {}
  };
  const toggleRecording = () => (recording ? stopRecording() : startRecording());

  return (
    <div
      className="h-[calc(100dvh-56px)] w-full" // adjust if your header height differs
      onDrop={onDrop}
      onDragOver={onDragOver}
      onPaste={onPaste}
    >
      <div className="mx-auto flex h-full max-w-3xl flex-col">
        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 pb-24 pt-6">
          <div className="space-y-4">
            {msgs.map((m) => (
              <MessageBubble key={m.id} m={m} />
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/10 bg-panel px-4 py-3 text-muted">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Nexus is thinking…
                </div>
              </div>
            )}
            {/* bottom sentinel */}
            <div ref={endRef} />
          </div>
        </div>

        {/* Jump to latest when scrolled up */}
        {!atBottom && (
    <>
      <motion.footer
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-t border-app bg-panel px-4 py-4 text-muted backdrop-blur lg:px-8"
        aria-label="User controls"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Avatar + name -> open Profile modal */}
          <button
            onClick={() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })}
            className="pointer fixed bottom-28 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-panel/90 px-3 py-1 text-xs text-muted shadow backdrop-blur hover:text-ink"
            title="Jump to latest"
            type="button"
            onClick={() => setProfileOpen(true)}
            className="group flex items-center gap-3 rounded-xl p-1 text-left transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
            aria-label="Open profile"
          >
            <ChevronDown className="mr-1 inline h-3 w-3" />
            Jump to latest
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-app text-base font-semibold text-ink">
              {profile.avatarDataUrl ? (
                <img src={profile.avatarDataUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink group-hover:opacity-90">{displayName}</p>
              <p className="text-xs text-muted">{handle}</p>
            </div>
          </button>
        )}

        {/* Composer */}
        <Composer
          value={input}
          setValue={setInput}
          onSend={send}
          busy={busy}
          onAttach={onAttach}
          onToggleVoice={toggleVoice}
          recording={recording}
          onOpenPromptBrowser={openPromptBrowser}
        />
      </div>
    </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle className="gap-2 rounded-full border border-app text-xs uppercase tracking-wide text-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg" />

            {/* Attach */}
            <input ref={fileInputRef} type="file" className="hidden" multiple onChange={onFilesChosen} />
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
              className={`inline-flex items-center gap-2 rounded-full border border-app px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg ${recording ? "text-ink bg-white/5" : "text-muted hover:text-ink"}`}
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

      {/* Profile Modal (local) */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
