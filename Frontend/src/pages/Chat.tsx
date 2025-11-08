import { useEffect, useMemo, useRef, useState } from "react";
import ChatInput from "@/components/ChatInput";

/** ─────────────────────────
 * Types
 * ───────────────────────── */
type Role = "user" | "assistant";
type FileMeta = { name: string; type: string; url: string; size: number };
type Msg = {
  id: string;
  role: Role;
  text: string;
  at?: FileMeta[];
  ts: number;
};

/** Utility: nano id */
const nid = () => Math.random().toString(36).slice(2, 10);

/** Fetch 2 user templates (localStorage mock) */
function getUserTemplates(): string[] {
  try {
    const raw = localStorage.getItem("nexus.templates");
    if (!raw) return [];
    const arr = JSON.parse(raw) as Array<{ title?: string; content?: string }>;
    const pool = arr
      .map((t) => t?.content || t?.title)
      .filter(Boolean) as string[];
    return pool.slice(0, 8);
  } catch {
    return [];
  }
}

/** two suggested prompts (fallbacks) */
const SUGGESTED_FALLBACK = [
  "Summarize this and pull out 5 action items.",
  "Turn this into a clear email in a friendly tone.",
  "Extract entities (people, dates, orgs) as JSON.",
  "Explain this like I’m five, then like I’m a senior engineer.",
];

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: nid(),
      role: "assistant",
      text:
        "Welcome to Nexus Chat.\n\nAttach files, record a voice note, or pick a suggestion to get started.",
      ts: Date.now(),
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 2 from user templates + 2 suggested (shuffle)
  const suggestions = useMemo(() => {
    const user = getUserTemplates();
    const pick = <T,>(arr: T[], n: number) =>
      [...arr].sort(() => Math.random() - 0.5).slice(0, n);
    const twoUser = pick(user, 2);
    const twoSys = pick(SUGGESTED_FALLBACK, 2);
    return pick([...twoUser, ...twoSys], 4);
  }, []);

  // autoscroll when messages change
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [msgs]);

  /** Mock engine call — replace with your real API later */
  async function sendToEngine(prompt: string, files: FileMeta[]): Promise<string> {
    await new Promise((r) => setTimeout(r, 600));
    const fileLine =
      files?.length > 0
        ? `\n\n_I also received ${files.length} attachment${files.length > 1 ? "s" : ""}._`
        : "";
    return `Here’s a first pass:\n\n${prompt}${fileLine}\n\n> _(Replace this mock with your engine response.)_`;
  }

  async function handleSend(text: string, files: File[]) {
    if (!text.trim() && files.length === 0) return;

    const metas: FileMeta[] = files.map((f) => ({
      name: f.name,
      type: f.type || "application/octet-stream",
      url: URL.createObjectURL(f),
      size: f.size,
    }));

    const userMsg: Msg = { id: nid(), role: "user", text, at: metas, ts: Date.now() };
    setMsgs((m) => [...m, userMsg]);

    // assistant "thinking" placeholder
    const thinkingId = nid();
    setMsgs((m) => [
      ...m,
      { id: thinkingId, role: "assistant", text: "Thinking…", ts: Date.now() },
    ]);

    try {
      const reply = await sendToEngine(text, metas);
      setMsgs((m) => m.map((x) => (x.id === thinkingId ? { ...x, text: reply } : x)));
    } catch {
      setMsgs((m) =>
        m.map((x) => (x.id === thinkingId ? { ...x, text: "Error. Try again." } : x))
      );
    }
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-24 pt-6 md:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {msgs.map((m) => (
            <Bubble key={m.id} msg={m} />
          ))}
        </div>
      </div>

      {/* Docked input */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10">
        <div className="pointer-events-auto mx-auto w-full max-w-3xl px-4 pb-4 md:px-8">
          <ChatInput
            suggestions={suggestions}
            onPickSuggestion={(s) => handleSend(s, [])}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
}

/** Chat bubble (inline to avoid extra files) */
function Bubble({ msg }: { msg: Msg }) {
  const mine = msg.role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[75ch] whitespace-pre-wrap leading-relaxed",
          "rounded-2xl border px-4 py-3 shadow-sm",
          mine
            ? "bg-blue-600 text-white border-blue-500"
            : "bg-white/70 dark:bg-neutral-900/80 border-neutral-200/60 dark:border-neutral-800/80 text-neutral-900 dark:text-neutral-100",
        ].join(" ")}
      >
        <div className="text-[15px] leading-relaxed">{msg.text}</div>

        {msg.at && msg.at.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {msg.at.map((f, i) => (
              <a
                key={i}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200/60 bg-white/60 px-2 py-1 text-xs text-neutral-700 hover:bg-white dark:border-neutral-800/60 dark:bg-neutral-800/70 dark:text-neutral-200"
                href={f.url}
                target="_blank"
                rel="noreferrer"
                title={`${f.name} (${(f.size / 1024).toFixed(1)} KB)`}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                {f.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
