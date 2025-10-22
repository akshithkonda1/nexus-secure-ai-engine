import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Paperclip,
  Sun,
  Moon,
  Settings as Gear,
  UserCircle2,
  Upload,
  X
} from "lucide-react";
import { useConversations } from "./useConversations";
import { askJSON, askSSE } from "./api";
import { mdToHtml } from "./md";
import type { Message, AttachmentMeta } from "./types";
import { useNavigationGuards } from "./useNavigationGuards";
import "../../styles/nexus-convos.css";

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

const MAX_FILES = 10;
const MAX_EACH = 1_000_000;
const MAX_TOTAL = 5_000_000;
const TEXT_LIKE = /\.(txt|md|json|csv|js|ts|py|html|css)$/i;

const LOGO_DARK_URL = "/assets/nexus-logo-dark.png";
const LOGO_LIGHT_URL = "/assets/nexus-logo-light.png";

function isTextLike(file: File) {
  return TEXT_LIKE.test(file.name) || file.type.startsWith("text/");
}
function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = reject;
    fr.readAsText(file);
  });
}

export default function ChatView() {
  useNavigationGuards();

  const {
    convos,
    current,
    currentId,
    setCurrentId,
    startNew,
    ensureCurrent,
    rename,
    append,
    updateMessage,
    setStatus,
    purge,
    purgeAllTrash
  } = useConversations();

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("nx.theme") as "dark" | "light" | null;
    if (saved) return saved;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  type Preferred = "ChatGPT" | "Claude" | "Grok" | "Gemini";
  type NxMode = "fast" | "balanced" | "smart";
  type SystemSettings = {
    webPct: number;
    aiPct: number;
    useBoth: boolean;
    consensusBeforeWeb: boolean;
    preferred: Preferred;
    mode: NxMode;
  };
  const [system, setSystem] = useState<SystemSettings>(() => {
    try {
      return JSON.parse(localStorage.getItem("nx.system") || "");
    } catch {}
    return {
      webPct: 50,
      aiPct: 50,
      useBoth: true,
      consensusBeforeWeb: true,
      preferred: "ChatGPT",
      mode: "balanced"
    };
  });
  useEffect(() => localStorage.setItem("nx.system", JSON.stringify(system)), [system]);

  type Profile = { name: string; email: string; photoDataUrl?: string };
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      return JSON.parse(localStorage.getItem("nx.profile") || "");
    } catch {}
    return { name: "", email: "" };
  });
  useEffect(() => localStorage.setItem("nx.profile", JSON.stringify(profile)), [profile]);

  const [feedback, setFeedback] = useState(() => localStorage.getItem("nx.feedbackDraft") || "");
  useEffect(() => localStorage.setItem("nx.feedbackDraft", feedback), [feedback]);

  const [profileTab, setProfileTab] = useState<"profile" | "billing" | "feedback">("profile");

  useEffect(() => {
    const last = sessionStorage.getItem("nx.currentId");
    if (last) setCurrentId(last);
  }, [setCurrentId]);
  useEffect(() => {
    if (currentId) sessionStorage.setItem("nx.currentId", currentId);
  }, [currentId]);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const streamAbortRef = useRef<AbortController | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeConvIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeConvIdRef.current = currentId;
  }, [currentId]);
  function lockToSession(id: string) {
    if (activeConvIdRef.current !== id) setCurrentId(id);
    activeConvIdRef.current = id;
  }

  function formatDate(ts: number) {
    const d = new Date(ts);
    const diff = Date.now() - ts;
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return d.toLocaleDateString();
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }
  async function onFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    const currentTotal = files.reduce((s, f) => s + f.size, 0);
    const newTotal = picked.reduce((s, f) => s + f.size, currentTotal);
    if (files.length + picked.length > MAX_FILES) {
      alert(`Max ${MAX_FILES} files allowed.`);
      return;
    }
    if (picked.some(f => f.size > MAX_EACH)) {
      alert(`Files must be \u2264 ${formatBytes(MAX_EACH)} each.`);
      return;
    }
    if (newTotal > MAX_TOTAL) {
      alert(`Total attachments must be \u2264 ${formatBytes(MAX_TOTAL)}.`);
      return;
    }
    setFiles(prev => [...prev, ...picked]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
  function removeFile(name: string) {
    setFiles(prev => prev.filter(f => f.name !== name));
  }

  async function buildAttachmentPayload() {
    const meta: AttachmentMeta[] = [];
    const textChunks: { name: string; content: string }[] = [];
    for (const f of files) {
      const m: AttachmentMeta = {
        name: f.name,
        type: f.type || "application/octet-stream",
        size: f.size,
        kind: isTextLike(f) ? "text" : "binary"
      };
      meta.push(m);
      if (m.kind === "text") {
        try {
          const txt = await readFileAsText(f);
          textChunks.push({ name: f.name, content: txt.slice(0, 200_000) });
        } catch {
          // ignore read errors
        }
      } else {
        console.info(`Attachment ${f.name} is binary; inline preview not supported yet.`);
      }
    }
    return { meta, textChunks };
  }

  function exportConversation() {
    if (!current) return;
    const dataStr =
      "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(current, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `${current.title.replace(/\s+/g, "_")}.json`;
    a.click();
  }

  function inlineTextAttachmentsIntoPrompt(prompt: string, textChunks: { name: string; content: string }[]) {
    if (!textChunks.length) return prompt;
    const parts = [prompt, "", "### Attachments"];
    for (const { name, content } of textChunks) {
      parts.push(`\n**${name}**\n\`\`\`\n${content}\n\`\`\``);
    }
    return parts.join("\n");
  }

  async function send() {
    const prompt = input.trim();
    if (!prompt || busy) return;
    setInput("");
    setBusy(true);

    const conv = await ensureCurrent();
    lockToSession(conv.id);

    if (conv.messages.length === 0) {
      await rename(conv.id, prompt.length > 50 ? `${prompt.slice(0, 50)}\u2026` : prompt);
    }

    const { meta, textChunks } = await buildAttachmentPayload();

    const userMsg: Message = { id: uid(), role: "user", content: prompt, html: mdToHtml(prompt), attachments: meta };
    const asstMsg: Message = { id: uid(), role: "assistant", content: "", html: "" };
    await append(conv.id, userMsg);
    await append(conv.id, asstMsg);
    lockToSession(conv.id);

    setFiles([]);

    const bodyPrimary = {
      prompt,
      attachments: textChunks.map(t => ({ name: t.name, content: t.content }))
    };
    const bodyInline = { prompt: inlineTextAttachmentsIntoPrompt(prompt, textChunks) };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Nexus-Web-Pct": String(system.webPct),
      "X-Nexus-AI-Pct": String(system.aiPct),
      "X-Nexus-Use-Both": system.useBoth ? "1" : "0",
      "X-Nexus-Consensus-Before-Web": system.consensusBeforeWeb ? "1" : "0",
      "X-Nexus-Preferred": system.preferred,
      "X-Nexus-Mode": system.mode
    };

    const patch = (content: string, metaResp?: any) => {
      updateMessage(conv.id, asstMsg.id, {
        content,
        html: mdToHtml(content),
        models: metaResp?.model_answers ?? metaResp?.models,
        audit: metaResp?.audit ?? metaResp?.audit_events
      });
    };

    try {
      const controller = new AbortController();
      streamAbortRef.current = controller;
      await askSSE(bodyPrimary, headers, patch, controller.signal);
    } catch {
      try {
        const controller = new AbortController();
        streamAbortRef.current = controller;
        await askSSE(bodyInline, headers, patch, controller.signal);
      } catch {
        await askJSON(bodyInline, headers, patch);
      }
    } finally {
      streamAbortRef.current = null;
      setBusy(false);
    }
  }

  function stop() {
    streamAbortRef.current?.abort();
    streamAbortRef.current = null;
    setBusy(false);
  }

  async function regenerate() {
    if (!current || busy) return;
    const lastUser = [...current.messages].reverse().find(m => m.role === "user");
    if (!lastUser) return;
    const lastAsst = [...current.messages].reverse().find(m => m.role === "assistant");
    if (!lastAsst) return;
    await updateMessage(current.id, lastAsst.id, { content: "", html: "" });
    setBusy(true);
    try {
      const controller = new AbortController();
      streamAbortRef.current = controller;
      await askSSE(
        { prompt: lastUser.content },
        {},
        (c, m) =>
          updateMessage(current.id, lastAsst.id, {
            content: c,
            html: mdToHtml(c),
            models: m?.model_answers ?? m?.models,
            audit: m?.audit ?? m?.audit_events
          }),
        controller.signal
      );
    } catch {
      await askJSON({ prompt: lastUser.content }, {}, (c, m) =>
        updateMessage(current.id, lastAsst.id, {
          content: c,
          html: mdToHtml(c),
          models: m?.model_answers ?? m?.models,
          audit: m?.audit ?? m?.audit_events
        })
      );
    } finally {
      streamAbortRef.current = null;
      setBusy(false);
    }
  }

  const active = useMemo(() => convos.filter(c => c.status === "active"), [convos]);
  const archived = useMemo(() => convos.filter(c => c.status === "archived"), [convos]);
  const trash = useMemo(() => convos.filter(c => c.status === "trash"), [convos]);

  return (
    <div className="nx-wrap">
      <aside className="nx-side">
        <div className="nx-side-header">
          <button
            type="button"
            className="primary"
            onClick={async () => {
              const c = await startNew();
              setCurrentId(c.id);
              setFiles([]);
            }}
          >
            ＋ New chat
          </button>
          <div className="theme">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        <Section title={`Active (${active.length})`}>
          {active.length === 0 ? (
            <Empty label="Nothing active" />
          ) : (
            active.map(c => {
              const last = c.messages.length ? c.messages[c.messages.length - 1] : undefined;
              const preview = (last?.content ?? "").slice(0, 40) + (last?.content ? "\u2026" : "");
              return (
                <ConvRow
                  key={c.id}
                  title={c.title}
                  subtitle={preview}
                  when={formatDate(c.updatedAt)}
                  active={c.id === currentId}
                  onClick={() => setCurrentId(c.id)}
                  actions={[
                    { label: "Archive", onClick: () => setStatus(c.id, "archived") },
                    { label: "Delete", onClick: () => setStatus(c.id, "trash") }
                  ]}
                />
              );
            })
          )}
        </Section>

        <Section title={`Archived (${archived.length})`}>
          {archived.length === 0 ? (
            <Empty label="Nothing archived" />
          ) : (
            archived.map(c => {
              const last = c.messages.length ? c.messages[c.messages.length - 1] : undefined;
              const preview = (last?.content ?? "").slice(0, 40) + (last?.content ? "\u2026" : "");
              return (
                <ConvRow
                  key={c.id}
                  title={c.title}
                  subtitle={preview}
                  when={formatDate(c.updatedAt)}
                  active={c.id === currentId}
                  onClick={() => setCurrentId(c.id)}
                  actions={[
                    { label: "Restore", onClick: () => setStatus(c.id, "active") },
                    { label: "Delete", onClick: () => setStatus(c.id, "trash") }
                  ]}
                />
              );
            })
          )}
        </Section>

        <Section
          title={`Trash (${trash.length})`}
          extra={
            <button type="button" className="danger sm" onClick={purgeAllTrash}>
              Empty Trash
            </button>
          }
        >
          {trash.length === 0 ? (
            <Empty label="Trash is empty" />
          ) : (
            trash.map(c => {
              const last = c.messages.length ? c.messages[c.messages.length - 1] : undefined;
              const preview = (last?.content ?? "").slice(0, 40) + (last?.content ? "\u2026" : "");
              return (
                <ConvRow
                  key={c.id}
                  title={c.title}
                  subtitle={preview}
                  when={formatDate(c.updatedAt)}
                  active={c.id === currentId}
                  onClick={() => setCurrentId(c.id)}
                  actions={[
                    { label: "Restore", onClick: () => setStatus(c.id, "active") },
                    { label: "Purge", onClick: () => purge(c.id) }
                  ]}
                />
              );
            })
          )}
        </Section>
      </aside>

      <main className="nx-main">
        <header className="nx-top">
          <div className="brand" aria-label="Nexus.ai" title="Nexus.ai">
            Nexus<span className="dot">•</span>
            <span className="ai">ai</span>
          </div>

          <h2 className="title" role="heading" aria-live="polite">
            {current ? current.title : "New chat"}
          </h2>

          <div className="actions">
            <button
              type="button"
              className="icon-btn"
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
              onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button type="button" className="icon-btn" title="System Settings" onClick={() => setShowSettings(true)}>
              <Gear size={16} />
            </button>

            <button type="button" className="avatar-btn" title="Profile" onClick={() => setShowProfile(true)}>
              {profile.photoDataUrl ? <img src={profile.photoDataUrl} alt="Profile" /> : <UserCircle2 size={18} />}
            </button>

            <button type="button" className="btn" onClick={exportConversation}>
              ⭳ Export
            </button>
            {current && (
              <>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    if (!current) return;
                    const dataStr =
                      "data:application/json;charset=utf-8," +
                      encodeURIComponent(JSON.stringify(current, null, 2));
                    const a = document.createElement("a");
                    a.href = dataStr;
                    a.download = `${current.title.replace(/\s+/g, "_")}.json`;
                    a.click();
                  }}
                >
                  {current.status === "archived" ? "Unarchive" : "Archive"}
                </button>
                <button type="button" className="btn danger" onClick={() => setStatus(current.id, "trash")}>
                  Delete
                </button>
              </>
            )}
          </div>
        </header>

        <div className="cx-stream">
          <div className="cx-stream-inner">
            {!current || current.messages.length === 0 ? (
              <div className="cx-hero">
                <h1>How can Nexus help today?</h1>
                <p className="muted">Ask a question, paste a document, or say “/help”.</p>
                <div className="chip-row">
                  <button type="button" className="chip" onClick={() => setInput("Explain transformers like I’m 12")}>
                    Explain simply
                  </button>
                  <button type="button" onClick={() => setInput("Summarize the following article:\n")}>
                    Summarize
                  </button>
                  <button type="button" onClick={() => setInput("Draft a concise email about…")}>
                    Draft an email
                  </button>
                </div>
              </div>
            ) : (
              current.messages.map(m => (
                <div key={m.id} className={`cx-msg ${m.role}`}>
                  <div className="bubble">
                    {m.attachments?.length ? (
                      <div className="att-list">
                        {m.attachments.map((a, i) => (
                          <div className="att-chip" key={i} title={`${a.name} • ${formatBytes(a.size)}`}>
                            <Paperclip size={12} /> <span className="name">{a.name}</span>
                            <span className="size">({formatBytes(a.size)})</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div dangerouslySetInnerHTML={{ __html: m.html || mdToHtml(m.content) }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <form
          className="cx-compose"
          onSubmit={e => {
            e.preventDefault();
            if (!busy) send();
          }}
        >
          <div className="cx-compose-inner">
            <button type="button" className="icon-btn" title="Attach files" onClick={openFilePicker}>
              <Paperclip size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={onFilesPicked}
              accept=".txt,.md,.json,.csv,.js,.ts,.py,.html,.css,application/json,text/plain,text/markdown,text/csv,text/html"
            />

            {files.length > 0 && (
              <div className="chips">
                {files.map(f => (
                  <div key={f.name} className="chip" title={`${f.name} • ${formatBytes(f.size)}`}>
                    <Paperclip size={12} /> <span className="name">{f.name}</span>
                    <span className="size">({formatBytes(f.size)})</span>
                    <button type="button" className="x" onClick={() => removeFile(f.name)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              className="cx-input"
              placeholder="Ask Nexus…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!busy) send();
                }
              }}
            />

            {!busy ? (
              <>
                <button type="button" className="icon-btn" title="Regenerate" onClick={regenerate}>
                  ↻
                </button>
                <button type="submit" className="cx-send" disabled={!input.trim() && files.length === 0}>
                  Send
                </button>
              </>
            ) : (
              <button type="button" className="icon-btn danger" title="Stop" onClick={stop}>
                ■
              </button>
            )}
          </div>
          <div className="cx-hint">
            Enter to send • Shift+Enter for newline • Attach text files up to {formatBytes(MAX_EACH)} each
          </div>
        </form>

        {/* System Settings Modal */}
        <Modal open={showSettings} title="System Settings" onClose={() => setShowSettings(false)}>
          <div className="form-grid">
            <label>
              <span>Use web search (%)</span>
              <input
                type="range"
                min={0}
                max={100}
                value={system.webPct}
                onChange={e => setSystem(s => ({ ...s, webPct: +e.target.value }))}
              />
              <div className="hint">{system.webPct}%</div>
            </label>

            <label>
              <span>Use AI models (%)</span>
              <input
                type="range"
                min={0}
                max={100}
                value={system.aiPct}
                onChange={e => setSystem(s => ({ ...s, aiPct: +e.target.value }))}
              />
              <div className="hint">{system.aiPct}%</div>
            </label>

            <label className="row">
              <input
                type="checkbox"
                checked={system.useBoth}
                onChange={e => setSystem(s => ({ ...s, useBoth: e.target.checked }))}
              />
              <span>Use both by default</span>
            </label>

            <label className="row">
              <input
                type="checkbox"
                checked={system.consensusBeforeWeb}
                onChange={e => setSystem(s => ({ ...s, consensusBeforeWeb: e.target.checked }))}
              />
              <span>Require consensus before web is prime</span>
            </label>

            <div>
              <div className="subhead">Preferred Model</div>
              <div className="seg">
                {(["ChatGPT", "Claude", "Grok", "Gemini"] as const).map(m => (
                  <button
                    type="button"
                    key={m}
                    className={`seg-item ${system.preferred === m ? "on" : ""}`}
                    onClick={() => setSystem(s => ({ ...s, preferred: m }))}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="subhead">Mode</div>
              <div className="seg">
                {(["fast", "balanced", "smart"] as const).map(m => (
                  <button
                    type="button"
                    key={m}
                    className={`seg-item ${system.mode === m ? "on" : ""}`}
                    onClick={() => setSystem(s => ({ ...s, mode: m }))}
                  >
                    {m[0].toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="dialog-actions">
            <button type="button" className="primary" onClick={() => setShowSettings(false)}>
              Save settings
            </button>
          </div>
        </Modal>

        {/* Profile Modal (Profile | Billing | Feedback) */}
        <Modal open={showProfile} title="Profile" onClose={() => setShowProfile(false)}>
          <div className="tabs">
            {(["profile", "billing", "feedback"] as const).map(t => (
              <button
                key={t}
                type="button"
                className={`tab-btn ${profileTab === t ? "on" : ""}`}
                onClick={() => setProfileTab(t)}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {profileTab === "profile" && (
            <div className="form-grid">
              <div className="avatar-uploader">
                <div className="avatar-preview">
                  {profile.photoDataUrl ? <img src={profile.photoDataUrl} alt="Profile" /> : <UserCircle2 size={56} />}
                </div>
                <label className="btn-secondary" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                  <Upload size={14} /> Upload photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = () => setProfile(p => ({ ...p, photoDataUrl: String(reader.result) }));
                      reader.readAsDataURL(f);
                    }}
                  />
                </label>
              </div>

              <label>
                <span>Name</span>
                <input
                  className="input"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  className="input"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                />
              </label>

              <div className="dialog-actions">
                <button type="button" className="primary" onClick={() => setShowProfile(false)}>
                  Save profile
                </button>
              </div>
            </div>
          )}

          {profileTab === "billing" && (
            <div className="billing-pane">
              <h4>Nexus billing</h4>
              <p className="muted">
                Nexus is <b>free for now</b>. We’re working on plans—enjoy using Nexus freely!
              </p>
              <button
                type="button"
                className="btn"
                onClick={() => alert("We’re working on plans—enjoy using Nexus freely!")}
              >
                Upgrade plan
              </button>
            </div>
          )}

          {profileTab === "feedback" && (
            <div>
              <label>
                <span>Send feedback (max 15,000 characters)</span>
                <textarea
                  className="textarea"
                  value={feedback}
                  maxLength={15000}
                  onChange={e => setFeedback(e.target.value)}
                  rows={8}
                  placeholder="Share bugs, ideas, or UX issues…"
                />
              </label>
              <div className="muted" style={{ textAlign: "right" }}>
                {feedback.length} / 15000
              </div>
              <div className="dialog-actions">
                <button
                  type="button"
                  className="primary"
                  onClick={() => {
                    alert("Thanks for the feedback!");
                    setFeedback("");
                    setShowProfile(false);
                  }}
                >
                  Submit feedback
                </button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}

function Modal({
  open,
  title,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="nx-modal" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="nx-dialog" onClick={e => e.stopPropagation()}>
        <div className="nx-dialog-head">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="nx-dialog-body">{children}</div>
      </div>
    </div>
  );
}

function Section({ title, extra, children }: { title: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="sect">
      <div className="sect-head">
        <div className="sect-title">{title}</div>
        {extra}
      </div>
      <div className="sect-body">{children}</div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="empty">{label}</div>;
}

function ConvRow({
  title,
  subtitle,
  when,
  active,
  onClick,
  actions
}: {
  title: string;
  subtitle?: string;
  when: string;
  active?: boolean;
  onClick?: () => void;
  actions?: { label: string; onClick: () => void }[];
}) {
  return (
    <div className={`conv ${active ? "active" : ""}`} onClick={onClick}>
      <div className="conv-text">
        <div className="conv-title">{title || "Untitled"}</div>
        {subtitle && <div className="conv-sub">{subtitle}</div>}
      </div>
      <div className="conv-when">{when}</div>
      {actions?.length ? (
        <div className="conv-menu" onClick={e => e.stopPropagation()}>
          {actions.map((a, i) => (
            <button type="button" key={i} onClick={a.onClick} className="pill sm">
              {a.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
