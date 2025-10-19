// Frontend/src/consumer/ConsumerChat.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import hljs from "highlight.js";
import { useConversations } from "./useConversations";
import type { Message } from "./db";

// ---------- Config ----------
const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const ASK_JSON = `${BASE}/api/ask`;
const ASK_SSE = `${BASE}/api/ask/stream`;

const uid = () => Math.random().toString(36).slice(2);

// ---------- Markdown render ----------
marked.use({
  renderer: {
    code({ text, lang }) {
      const language = lang?.trim().split(/\s+/)[0] ?? "";
      const valid = language && hljs.getLanguage(language);
      const highlighted = valid
        ? hljs.highlight(text, { language }).value
        : hljs.highlightAuto(text).value;
      const className = valid ? `language-${language}` : "language-plaintext";
      return `<pre><code class="hljs ${className}">${highlighted}</code></pre>`;
    },
  },
});
marked.setOptions({ breaks: true });

function mdToHtml(md: string): string {
  const raw = marked.parse(md) as string;
  return DOMPurify.sanitize(raw);
}

function fmtWhen(ms: number) {
  return new Date(ms).toLocaleString();
}

// ---------- Source tracker ----------
type SourceKey = "model1" | "model2" | "model3" | "model4" | "web";
type SourceState = "queued" | "running" | "done" | "error";

type SourceStatus = {
  key: SourceKey;
  label: string;
  state: SourceState;
  latencyMs?: number;
  error?: string;
};

function defaultSources(): SourceStatus[] {
  return [
    { key: "model1", label: "Model 1", state: "queued" },
    { key: "model2", label: "Model 2", state: "queued" },
    { key: "model3", label: "Model 3", state: "queued" },
    { key: "model4", label: "Model 4", state: "queued" },
    { key: "web", label: "Web", state: "queued" },
  ];
}

function normalizeName(name: string): SourceKey | null {
  const lower = name.toLowerCase();
  if (/web|search|crawl|fetch/.test(lower)) return "web";
  const hash = [...lower].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 4;
  const buckets: SourceKey[] = ["model1", "model2", "model3", "model4"];
  return buckets[hash] ?? null;
}

// ---------- Settings ----------
type Settings = {
  theme: "dark" | "light" | "system";
  showModels: boolean;
  showAudit: boolean;
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem("nx.settings");
    if (!raw) {
      return { theme: "dark", showModels: true, showAudit: false };
    }
    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme === "light" ? "light" : parsed.theme === "system" ? "system" : "dark",
      showModels: parsed.showModels !== undefined ? Boolean(parsed.showModels) : true,
      showAudit: parsed.showAudit !== undefined ? Boolean(parsed.showAudit) : false,
    } satisfies Settings;
  } catch {
    return { theme: "dark", showModels: true, showAudit: false };
  }
}

// ---------- Component ----------
export default function ConsumerChat() {
  const {
    active,
    archived,
    trash,
    current,
    currentId,
    setCurrentId,
    startNew,
    select,
    rename,
    append,
    updateLastAssistant,
    archive,
    moveToTrash,
    restore,
    purge,
    purgeAllTrash,
  } = useConversations();

  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  useEffect(() => {
    localStorage.setItem("nx.settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effective =
      settings.theme === "dark" || (settings.theme === "system" && prefersDark)
        ? "dark"
        : "light";
    document.documentElement.dataset.theme = effective;
  }, [settings.theme]);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [turnSources, setTurnSources] = useState<Record<string, SourceStatus[]>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [current, busy]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" && (e.metaKey || e.ctrlKey || e.shiftKey) && currentId) {
        e.preventDefault();
        purge(currentId);
      } else if (e.key === "Delete" && currentId) {
        e.preventDefault();
        moveToTrash(currentId);
      } else if (e.key.toLowerCase() === "a" && (e.metaKey || e.ctrlKey) && currentId) {
        e.preventDefault();
        if (current?.status === "archived") restore(currentId);
        else archive(currentId);
      } else if (e.key.toLowerCase() === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        startNew("New chat").then((c) => setCurrentId(c.id));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [archive, current, currentId, moveToTrash, purge, restore, setCurrentId, startNew]);

  const themeIcon = useMemo(() => {
    if (settings.theme === "light") return "☀️";
    if (settings.theme === "system") return "🖥️";
    return "🌙";
  }, [settings.theme]);

  function cycleTheme() {
    const order: Settings["theme"][] = ["dark", "light", "system"];
    const next = order[(order.indexOf(settings.theme) + 1) % order.length];
    setSettings((prev) => ({ ...prev, theme: next }));
  }

  function ensureCurrent() {
    if (current) return Promise.resolve(current);
    return startNew("New chat").then((c) => {
      setCurrentId(c.id);
      return c;
    });
  }

  async function send() {
    const prompt = input.trim();
    if (!prompt || busy) return;
    setInput("");

    const conv = await ensureCurrent();

    if (conv.messages.length === 0) {
      const title = prompt.length > 50 ? `${prompt.slice(0, 50)}…` : prompt;
      rename(conv.id, title);
    }

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: prompt,
      html: mdToHtml(prompt),
    };
    await append(conv.id, userMsg);

    const assistantId = uid();
    await append(conv.id, { id: assistantId, role: "assistant", content: "", html: "" });
    setTurnSources((prev) => ({ ...prev, [assistantId]: defaultSources() }));
    setBusy(true);

    const headers: Record<string, string> = { "Content-Type": "application/json" };

    const streamed = await trySSEFanout({ prompt, convId: conv.id, assistantId, headers });
    if (!streamed) {
      await fallbackJson({ prompt, convId: conv.id, assistantId, headers });
    }
    setBusy(false);
  }

  async function trySSEFanout({
    prompt,
    convId,
    assistantId,
    headers,
  }: {
    prompt: string;
    convId: string;
    assistantId: string;
    headers: Record<string, string>;
  }) {
    try {
      const res = await fetch(ASK_SSE, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok || !res.headers.get("content-type")?.includes("text/event-stream")) {
        throw new Error("no-sse");
      }

      setTurnSources((prev) => {
        const cur = prev[assistantId] || defaultSources();
        return {
          ...prev,
          [assistantId]: cur.map((s) => (s.state === "queued" ? { ...s, state: "running" } : s)),
        };
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const block of parts) {
          const match = block.match(/^data:\s*(.*)$/m);
          if (!match) continue;
          const payload = match[1];
          if (payload === "[DONE]") continue;

          try {
            const obj = JSON.parse(payload);

            if (obj.delta) {
              full += obj.delta;
              await updateLastAssistant(convId, {
                content: full,
                html: mdToHtml(full),
              });
            }

            if (obj.event === "source_start" && obj.source) markFromName(assistantId, obj.source, "running");
            if (obj.event === "source_done" && obj.source) {
              markFromName(assistantId, obj.source, "done", {
                latencyMs: typeof obj.latency_ms === "number" ? obj.latency_ms : undefined,
              });
            }
            if (obj.event === "source_error" && obj.source) {
              markFromName(assistantId, obj.source, "error", {
                error: obj.error,
              });
            }

            if (obj.models || obj.model_answers) {
              const models = obj.models || obj.model_answers;
              Object.keys(models).forEach((name) => markFromName(assistantId, name, "done"));
              await updateLastAssistant(convId, { models });
            }

            if (obj.audit) {
              const audits = Array.isArray(obj.audit) ? obj.audit : [];
              if (audits.some((entry: any) => /web|search|crawl|fetch/i.test(String(entry.event || "")))) {
                markWebActivity(assistantId, "running");
              }
              await updateLastAssistant(convId, { audit: audits });
            }

            if (obj.web_done) markWebActivity(assistantId, "done");
            if (obj.web_error) markWebActivity(assistantId, "error");
          } catch {
            full += payload;
            await updateLastAssistant(convId, {
              content: full,
              html: mdToHtml(full),
            });
          }
        }
      }

      finalizeSources(assistantId);
      return true;
    } catch {
      return false;
    }
  }

  async function fallbackJson({
    prompt,
    convId,
    assistantId,
    headers,
  }: {
    prompt: string;
    convId: string;
    assistantId: string;
    headers: Record<string, string>;
  }) {
    try {
      setTurnSources((prev) => {
        const cur = prev[assistantId] || defaultSources();
        return {
          ...prev,
          [assistantId]: cur.map((s) => ({ ...s, state: s.state === "queued" ? "running" : s.state })),
        };
      });

      const resp = await fetch(ASK_JSON, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt }),
      });
      const json = await resp.json();

      const answer = String(json.answer ?? json.output ?? json.text ?? "");
      await updateLastAssistant(convId, {
        content: answer,
        html: mdToHtml(answer),
        models: json.model_answers || json.models || undefined,
        audit: json.audit || json.audit_events || undefined,
      });

      const models = json.model_answers || json.models || {};
      Object.keys(models || {}).forEach((name) => markFromName(assistantId, name, "done"));

      const audits = json.audit || json.audit_events;
      if (audits && Array.isArray(audits) && audits.some((entry: any) => /web|search|crawl|fetch/i.test(String(entry.event || "")))) {
        markWebActivity(assistantId, "done");
      }

      finalizeSources(assistantId);
    } catch (error: any) {
      const message = `⚠️ ${error?.message || "Request failed"}`;
      await updateLastAssistant(convId, {
        content: message,
        html: mdToHtml(message),
      });
      setTurnSources((prev) => {
        const cur = prev[assistantId] || defaultSources();
        return {
          ...prev,
          [assistantId]: cur.map((s) => ({ ...s, state: "error", error: s.error || "network" })),
        };
      });
    }
  }

  function markFromName(msgId: string, modelName: string, state: SourceState, patch?: Partial<SourceStatus>) {
    const key = normalizeName(modelName);
    if (!key) return;
    setTurnSources((prev) => {
      const cur = prev[msgId] || defaultSources();
      return {
        ...prev,
        [msgId]: cur.map((s) => (s.key === key ? { ...s, state, ...patch } : s)),
      };
    });
  }

  function markWebActivity(msgId: string, state: SourceState) {
    setTurnSources((prev) => {
      const cur = prev[msgId] || defaultSources();
      return {
        ...prev,
        [msgId]: cur.map((s) => (s.key === "web" ? { ...s, state } : s)),
      };
    });
  }

  function finalizeSources(msgId: string) {
    setTurnSources((prev) => {
      const cur = prev[msgId] || defaultSources();
      return {
        ...prev,
        [msgId]: cur.map((s) => (s.state === "running" ? { ...s, state: "done" } : s)),
      };
    });
  }

  function StatusActions() {
    if (!current) return null;
    const id = current.id;
    if (current.status === "active") {
      return (
        <>
          <button className="pill" onClick={() => archive(id)}>
            Archive
          </button>
          <button className="pill" onClick={() => moveToTrash(id)}>
            Delete
          </button>
        </>
      );
    }
    if (current.status === "archived") {
      return (
        <>
          <button className="pill on" onClick={() => restore(id)}>
            Restore
          </button>
          <button className="pill" onClick={() => moveToTrash(id)}>
            Delete
          </button>
        </>
      );
    }
    return (
      <>
        <button className="pill on" onClick={() => restore(id)}>
          Restore
        </button>
        <button className="pill danger" onClick={() => purge(id)}>
          Permanently Delete
        </button>
      </>
    );
  }

  return (
    <div className="cx-shell">
      <aside className="cx-sidebar">
        <div className="cx-brand">Nexus.ai</div>
        <button
          className="cx-new"
          onClick={() =>
            startNew("New chat").then((c) => {
              setCurrentId(c.id);
            })
          }
        >
          ＋ New chat
        </button>

        <div className="cx-divider" />

        <Section title={`Active (${active.length})`}>
          {active.length === 0 && <div className="cx-empty-small muted">No active chats</div>}
          {active.map((c) => (
            <ConvRow
              key={c.id}
              title={c.title}
              when={fmtWhen(c.updatedAt)}
              active={c.id === currentId}
              onClick={() => select(c.id)}
              menu={[
                { label: "Archive", onClick: () => archive(c.id) },
                { label: "Delete", onClick: () => moveToTrash(c.id) },
                {
                  label: "Rename",
                  onClick: async () => {
                    const title = prompt("Rename chat", c.title || "Untitled");
                    if (title !== null) rename(c.id, title.trim() || "Untitled");
                  },
                },
              ]}
            />
          ))}
        </Section>

        <Section title={`Archived (${archived.length})`}>
          {archived.length === 0 && <div className="cx-empty-small muted">Nothing archived</div>}
          {archived.map((c) => (
            <ConvRow
              key={c.id}
              title={c.title}
              when={fmtWhen(c.updatedAt)}
              active={c.id === currentId}
              onClick={() => select(c.id)}
              menu={[
                { label: "Restore", onClick: () => restore(c.id) },
                { label: "Delete", onClick: () => moveToTrash(c.id) },
                {
                  label: "Rename",
                  onClick: async () => {
                    const title = prompt("Rename chat", c.title || "Untitled");
                    if (title !== null) rename(c.id, title.trim() || "Untitled");
                  },
                },
              ]}
            />
          ))}
        </Section>

        <Section
          title={`Trash (${trash.length})`}
          extra={
            <button className="mini danger" onClick={purgeAllTrash}>
              Empty Trash
            </button>
          }
        >
          {trash.length === 0 && <div className="cx-empty-small muted">Trash is empty</div>}
          {trash.map((c) => (
            <ConvRow
              key={c.id}
              title={c.title}
              when={fmtWhen(c.updatedAt)}
              active={c.id === currentId}
              onClick={() => select(c.id)}
              menu={[
                { label: "Restore", onClick: () => restore(c.id) },
                { label: "Permanently Delete", onClick: () => purge(c.id) },
              ]}
            />
          ))}
        </Section>

        <div className="cx-flex" />
        <div className="hint">⌘/Ctrl + N new • ⌘/Ctrl + A archive • Del delete • Shift+Del purge</div>
      </aside>

      <section className="cx-main">
        <header className="cx-top">
          <div className="title">{current?.title || "Chat"}</div>
          <div className="top-icons">
            <button className="icon-btn" onClick={cycleTheme} title={`Theme: ${settings.theme}`}>
              {themeIcon}
            </button>
            <button className="icon-btn" onClick={() => setShowSettings(true)} title="Settings">
              ⚙️
            </button>
            {current && <StatusActions />}
          </div>
        </header>

        <div className="cx-stream" ref={scrollRef}>
          {!current || current.messages.length === 0 ? (
            <div className="cx-empty">
              <h1>How can Nexus help today?</h1>
              <p className="muted">Ask a question, paste a document, or say “/help”.</p>
              <div className="quick">
                <button onClick={() => setInput("Explain transformers like I’m 12")}>Explain simply</button>
                <button onClick={() => setInput("Summarize the following article:\n")}>Summarize</button>
                <button onClick={() => setInput("Write a polite email to…")}>Draft an email</button>
              </div>
            </div>
          ) : (
            current.messages.map((message) => (
              <div key={message.id}>
                <MessageBubble message={message} showModels={settings.showModels} showAudit={settings.showAudit} />
                {message.role === "assistant" && turnSources[message.id] && (
                  <SourceChips items={turnSources[message.id]} />
                )}
              </div>
            ))
          )}

          {busy && <div className="cx-thinking">Thinking…</div>}
        </div>

        <footer className="cx-compose">
          <input
            id="composer"
            className="cx-input"
            placeholder="Ask Nexus…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button className="cx-send" onClick={send} disabled={busy || !input.trim()}>
            Send
          </button>
        </footer>
      </section>

      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">Settings</div>
              <button className="icon-btn" onClick={() => setShowSettings(false)}>
                ✖
              </button>
            </div>
            <div className="modal-body">
              <div className="row">
                <label>Theme</label>
                <div className="theme-row">
                  <button
                    className={`chip ${settings.theme === "dark" ? "on" : ""}`}
                    onClick={() => setSettings((prev) => ({ ...prev, theme: "dark" }))}
                  >
                    Dark
                  </button>
                  <button
                    className={`chip ${settings.theme === "light" ? "on" : ""}`}
                    onClick={() => setSettings((prev) => ({ ...prev, theme: "light" }))}
                  >
                    Light
                  </button>
                  <button
                    className={`chip ${settings.theme === "system" ? "on" : ""}`}
                    onClick={() => setSettings((prev) => ({ ...prev, theme: "system" }))}
                  >
                    System
                  </button>
                </div>
              </div>
              <div className="row">
                <label>Panels</label>
                <div className="theme-row">
                  <button
                    className={`chip ${settings.showModels ? "on" : ""}`}
                    onClick={() => setSettings((prev) => ({ ...prev, showModels: !prev.showModels }))}
                  >
                    Model Answers
                  </button>
                  <button
                    className={`chip ${settings.showAudit ? "on" : ""}`}
                    onClick={() => setSettings((prev) => ({ ...prev, showAudit: !prev.showAudit }))}
                  >
                    Audit Trail
                  </button>
                </div>
              </div>
              <p className="muted small">
                Nexus automatically orchestrates multiple models and relevant web lookups. Results are synthesized into a
                single consensus answer.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  extra,
  children,
}: {
  title: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="sec">
      <div className="sec-head">
        <div className="sec-title">{title}</div>
        <div className="sec-extra">{extra}</div>
      </div>
      <div className="sec-body">{children}</div>
    </div>
  );
}

function ConvRow({
  title,
  when,
  active,
  onClick,
  menu,
}: {
  title: string;
  when: string;
  active?: boolean;
  onClick?: () => void;
  menu?: { label: string; onClick: () => void }[];
}) {
  return (
    <div className={`conv ${active ? "active" : ""}`} onClick={onClick}>
      <div className="conv-title">{title || "Untitled"}</div>
      <div className="conv-when">{when}</div>
      {menu && (
        <div className="conv-menu" onClick={(e) => e.stopPropagation()}>
          <details>
            <summary>⋯</summary>
            <div className="menu">
              {menu.map((item, i) => (
                <button key={i} onClick={item.onClick}>
                  {item.label}
                </button>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  showModels,
  showAudit,
}: {
  message: Message;
  showModels: boolean;
  showAudit: boolean;
}) {
  return (
    <div className={`cx-msg ${message.role}`}>
      <div className="avatar">{message.role === "assistant" ? "🤖" : "👤"}</div>
      <div className="bubble">
        <div className="meta">
          <span className="who">{message.role === "assistant" ? "Nexus (Consensus)" : "You"}</span>
        </div>
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: message.html ?? mdToHtml(message.content) }}
        />
        <div className="actions">
          <button className="mini" onClick={() => navigator.clipboard.writeText(message.content)}>
            Copy
          </button>
        </div>

        {showModels && message.models && Object.keys(message.models).length > 0 && (
          <details className="panel" open>
            <summary>Model Answers</summary>
            <div className="kv">
              {Object.entries(message.models).map(([name, text]) => (
                <div className="kv-row" key={name}>
                  <div className="k">{name}</div>
                  <div className="v">{text}</div>
                </div>
              ))}
            </div>
          </details>
        )}

        {showAudit && message.audit && message.audit.length > 0 && (
          <details className="panel" open>
            <summary>Audit Trail</summary>
            <div className="kv">
              {message.audit.map((entry: any, idx: number) => (
                <div className="kv-row" key={idx}>
                  <div className="k">{String(entry.ts || entry.event || `event ${idx + 1}`)}</div>
                  <div className="v">
                    {Object.entries(entry).map(([key, value]) => (
                      <span key={key} className="pill sm">
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

function SourceChips({ items }: { items: SourceStatus[] }) {
  return (
    <div className="src-chips">
      {items.map((item) => (
        <div key={item.key} className={`src-chip ${item.state}`}>
          <span className="dot" />
          <span className="label">{item.label}</span>
          {typeof item.latencyMs === "number" && <span className="lat">{item.latencyMs}ms</span>}
        </div>
      ))}
    </div>
  );
}
