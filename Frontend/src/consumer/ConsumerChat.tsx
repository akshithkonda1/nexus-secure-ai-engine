// Frontend/src/consumer/ConsumerChat.tsx
import React, { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import hljs from "highlight.js";
import { useConversations } from "./useConversations";
import type { AuditItem, Message, ModelAnswers } from "./db";

type Settings = {
  theme?: "dark" | "light" | "system";
  model?: string;
};

// ------- Config -------
const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const ASK_JSON = `${BASE}/api/ask`;
const ASK_SSE  = `${BASE}/api/ask/stream`;

const uid = () => Math.random().toString(36).slice(2);

// ------- Markdown render -------
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
  const d = new Date(ms);
  return d.toLocaleString();
}

// ------- Main -------
export default function ConsumerChat() {
  const {
    active, archived, trash,
    current, currentId, setCurrentId,
    startNew, select, rename, append, updateLastAssistant,
    archive, moveToTrash, restore, purge, purgeAllTrash
  } = useConversations();

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const raw = localStorage.getItem("nx.settings");
      return raw ? (JSON.parse(raw) as Settings) : {};
    } catch {
      return {};
    }
  });
  useEffect(() => localStorage.setItem("nx.settings", JSON.stringify(settings)), [settings]);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [current, busy]);

  // Theme (dark by default)
  useEffect(() => {
    const theme = settings.theme || "dark";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = (theme === "dark" || (theme === "system" && prefersDark)) ? "dark" : "light";
  }, [settings.theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" && (e.shiftKey || e.metaKey || e.ctrlKey) && currentId) {
        // permanent delete
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
        startNew("New chat").then(c => setCurrentId(c.id));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [archive, current, currentId, moveToTrash, purge, restore, setCurrentId, startNew]);

  async function ensureCurrent() {
    if (current) return current;
    const c = await startNew("New chat");
    setCurrentId(c.id);
    return c;
  }

  async function send() {
    const prompt = input.trim();
    if (!prompt || busy) return;
    setInput("");

    const conv = await ensureCurrent();

    // Derive a title from the first user message if needed
    if (conv.messages.length === 0) {
      const title = prompt.length > 50 ? prompt.slice(0, 50) + "…" : prompt;
      rename(conv.id, title);
    }

    // Add user message
    const userMsg: Message = { id: uid(), role: "user", content: prompt, html: mdToHtml(prompt) };
    await append(conv.id, userMsg);

    // Add placeholder assistant (for streaming)
    const tmpId = uid();
    const assistant: Message = { id: tmpId, role: "assistant", content: "", html: "" };
    await append(conv.id, assistant);
    setBusy(true);

    // Streaming (SSE) first; fallback JSON
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (settings.model) headers["X-Nexus-Model"] = settings.model;

    const trySSE = async () => {
      try {
        const res = await fetch(ASK_SSE, { method: "POST", headers, body: JSON.stringify({ prompt, model: settings.model }) });
        if (!res.ok || !res.headers.get("content-type")?.includes("text/event-stream")) throw new Error("no-sse");
        const reader = res.body!.getReader(); const dec = new TextDecoder();
        let buffer = "";
        let full = "";
        let models: ModelAnswers | undefined;
        let audit: AuditItem[] | undefined;
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += dec.decode(value, { stream: true });
          const parts = buffer.split("\n\n"); buffer = parts.pop() || "";
          for (const chunk of parts) {
            const m = chunk.match(/^data:\s*(.*)$/m); if (!m) continue;
            const data = m[1]; if (data === "[DONE]") break;
            try {
              const obj = JSON.parse(data);
              if (obj.delta) {
                full += obj.delta;
                await updateLastAssistant(conv.id, { content: full, html: mdToHtml(full) });
              }
              if (obj.models) models = obj.models;
              if (obj.audit) audit = obj.audit;
            } catch {
              full += data;
              await updateLastAssistant(conv.id, { content: full, html: mdToHtml(full) });
            }
          }
        }
        await updateLastAssistant(conv.id, { models, audit });
        return true;
      } catch { return false; }
    };

    const ok = await trySSE();
    if (!ok) {
      try {
        const r = await fetch(ASK_JSON, { method: "POST", headers, body: JSON.stringify({ prompt, model: settings.model }) });
        const j = await r.json();
        const answer = String(j.answer ?? j.output ?? j.text ?? "");
        await updateLastAssistant(conv.id, {
          content: answer,
          html: mdToHtml(answer),
          models: j.model_answers || j.models || undefined,
          audit: j.audit || j.audit_events || undefined
        });
      } catch (e: any) {
        await updateLastAssistant(conv.id, { content: `⚠️ ${e?.message || "Request failed"}`, html: mdToHtml(`⚠️ ${e?.message || "Request failed"}`) });
      }
    }
    setBusy(false);
  }

  // Action bar buttons depend on status
  function StatusActions() {
    if (!current) return null;
    const id = current.id;
    if (current.status === "active") {
      return (
        <>
          <button className="pill" onClick={() => archive(id)}>Archive</button>
          <button className="pill" onClick={() => moveToTrash(id)}>Delete</button>
        </>
      );
    }
    if (current.status === "archived") {
      return (
        <>
          <button className="pill on" onClick={() => restore(id)}>Restore</button>
          <button className="pill" onClick={() => moveToTrash(id)}>Delete</button>
        </>
      );
    }
    return (
      <>
        <button className="pill on" onClick={() => restore(id)}>Restore</button>
        <button className="pill" onClick={() => purge(id)}>Permanently Delete</button>
      </>
    );
  }

  return (
    <div className="cx-shell">
      {/* Sidebar */}
      <aside className="cx-sidebar">
        <div className="cx-brand">Nexus.ai</div>
        <button className="cx-new" onClick={() => startNew("New chat").then(c => setCurrentId(c.id))}>＋ New chat</button>

        <div className="cx-divider" />

        <Section title={`Active (${active.length})`}>
          {active.length === 0 && <div className="cx-empty-small muted">No active chats</div>}
          {active.map(c => (
            <ConvRow
              key={c.id}
              title={c.title}
              when={fmtWhen(c.updatedAt)}
              active={c.id === currentId}
              onClick={() => select(c.id)}
              menu={[
                { label: "Archive", onClick: () => archive(c.id) },
                { label: "Delete", onClick: () => moveToTrash(c.id) },
                { label: "Rename", onClick: async () => {
                    const t = prompt("Rename chat", c.title || "Untitled");
                    if (t !== null) rename(c.id, t.trim() || "Untitled");
                  } }
              ]}
            />
          ))}
        </Section>

        <Section title={`Archived (${archived.length})`}>
          {archived.length === 0 && <div className="cx-empty-small muted">Nothing archived</div>}
          {archived.map(c => (
            <ConvRow
              key={c.id}
              title={c.title}
              when={fmtWhen(c.updatedAt)}
              active={c.id === currentId}
              onClick={() => select(c.id)}
              menu={[
                { label: "Restore", onClick: () => restore(c.id) },
                { label: "Delete", onClick: () => moveToTrash(c.id) },
                { label: "Rename", onClick: async () => {
                    const t = prompt("Rename chat", c.title || "Untitled");
                    if (t !== null) rename(c.id, t.trim() || "Untitled");
                  } }
              ]}
            />
          ))}
        </Section>

        <Section title={`Trash (${trash.length})`} extra={<button className="mini danger" onClick={purgeAllTrash}>Empty Trash</button>}>
          {trash.length === 0 && <div className="cx-empty-small muted">Trash is empty</div>}
          {trash.map(c => (
            <ConvRow
              key={c.id}
              title={c.title}
              when={fmtWhen(c.updatedAt)}
              active={c.id === currentId}
              onClick={() => select(c.id)}
              menu={[
                { label: "Restore", onClick: () => restore(c.id) },
                { label: "Permanently Delete", onClick: () => purge(c.id) }
              ]}
            />
          ))}
        </Section>

        <div className="cx-flex" />
        <div className="cx-settings">
          <div className="row">
            <label>Theme</label>
            <select
              value={settings.theme || "dark"}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, theme: e.target.value as Settings["theme"] }))
              }
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="row">
            <label>Model</label>
            <input
              placeholder="auto (tier-based)"
              value={settings.model || ""}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, model: e.target.value || undefined }))
              }
            />
          </div>
          <div className="hint">⌘/Ctrl + N new • ⌘/Ctrl + A archive • Del delete • Shift+Del purge</div>
        </div>
      </aside>

      {/* Main */}
      <section className="cx-main">
        <header className="cx-top">
          <div className="title">{current?.title || "Chat"}</div>
          <div className="top-actions">
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
            current.messages.map((m) => <MessageBubble key={m.id} m={m} />)
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
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button className="cx-send" onClick={send} disabled={busy || !input.trim()}>Send</button>
        </footer>
      </section>
    </div>
  );
}

// ------- UI Bits -------
function Section({ title, extra, children }: { title: string; extra?: React.ReactNode; children: React.ReactNode }) {
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
  title, when, active, onClick, menu
}: {
  title: string; when: string; active?: boolean; onClick?: ()=>void; menu?: {label:string; onClick:()=>void}[]
}) {
  return (
    <div className={`conv ${active ? "active": ""}`} onClick={onClick}>
      <div className="conv-title">{title || "Untitled"}</div>
      <div className="conv-when">{when}</div>
      {menu && (
        <div className="conv-menu" onClick={(e)=>e.stopPropagation()}>
          <details>
            <summary>⋯</summary>
            <div className="menu">
              {menu.map((m, i) => (
                <button key={i} onClick={m.onClick}>{m.label}</button>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ m }: { m: Message }) {
  return (
    <div className={`cx-msg ${m.role}`}>
      <div className="avatar">{m.role === "assistant" ? "🤖" : "👤"}</div>
      <div className="bubble">
        <div className="meta">
          <span className="who">{m.role === "assistant" ? "Nexus" : "You"}</span>
        </div>
        <div className="content" dangerouslySetInnerHTML={{ __html: m.html ?? mdToHtml(m.content) }} />
        <div className="actions">
          <button className="mini" onClick={() => navigator.clipboard.writeText(m.content)}>Copy</button>
        </div>

        {/* Model answers panel */}
        {m.models && Object.keys(m.models).length > 0 && (
          <details className="panel" open>
            <summary>Model Answers</summary>
            <div className="kv">
              {Object.entries(m.models).map(([name, text]) => (
                <div className="kv-row" key={name}>
                  <div className="k">{name}</div>
                  <div className="v">{text}</div>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Audit trail panel */}
        {m.audit && m.audit.length > 0 && (
          <details className="panel" open>
            <summary>Audit Trail</summary>
            <div className="kv">
              {m.audit.map((a, i) => (
                <div className="kv-row" key={i}>
                  <div className="k">{String(a.ts || a.event || `event ${i+1}`)}</div>
                  <div className="v">
                    {Object.entries(a).map(([k, v]) => (
                      <span key={k} className="pill sm">{k}: {String(v)}</span>
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
