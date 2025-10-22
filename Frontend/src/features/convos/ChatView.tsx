import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  Download,
  Moon,
  Sun,
  Trash2,
  Paperclip,
  X,
  Settings,
  ShieldCheck,
  UserCog,
  CreditCard,
  MessageSquareDiff
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

function isTextLike(file: File) {
  return TEXT_LIKE.test(file.name) || file.type.startsWith("text/");
}

type SystemSettingsState = {
  redactPII: boolean;
  privateMode: boolean;
  highContrast: boolean;
  smartCompose: boolean;
};

type ProfilePanelKey = "user" | "billing" | "feedback";
type ProfileState = {
  name: string;
  email: string;
  title: string;
};
function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
function stringToColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 45%)`;
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
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return (document.documentElement.dataset.theme as "dark" | "light") || (prefersDark ? "dark" : "light");
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [activeProfilePanel, setActiveProfilePanel] = useState<ProfilePanelKey | null>(null);
  const [systemSettingsOpen, setSystemSettingsOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileState>(() => ({
    name: "Jordan Sparks",
    email: "jordan.sparks@nexus.ai",
    title: "Principal Analyst"
  }));
  const [systemSettings, setSystemSettings] = useState<SystemSettingsState>(() => {
    try {
      const raw = localStorage.getItem("nx.system-settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          redactPII: Boolean(parsed.redactPII ?? true),
          privateMode: Boolean(parsed.privateMode ?? false),
          highContrast: Boolean(parsed.highContrast ?? false),
          smartCompose: Boolean(parsed.smartCompose ?? true)
        };
      }
    } catch (err) {
      console.warn("Failed to parse system settings", err);
    }
    return {
      redactPII: true,
      privateMode: false,
      highContrast: false,
      smartCompose: true
    };
  });

  const avatarInitials = useMemo(() => {
    const parts = profile.name.trim().split(/\s+/).slice(0, 2);
    return parts.map(part => part[0]?.toUpperCase() ?? "").join("");
  }, [profile.name]);
  const avatarColor = useMemo(() => stringToColor(profile.email || profile.name), [profile.email, profile.name]);
  const lastUpdatedLabel = useMemo(() => {
    if (!current) return "Secure collaboration workspace";
    return `Updated ${formatDate(current.updatedAt)}`;
  }, [current]);

  const activeConvIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeConvIdRef.current = currentId;
  }, [currentId]);
  useEffect(() => {
    localStorage.setItem("nx.system-settings", JSON.stringify(systemSettings));
  }, [systemSettings]);
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (profileMenuRef.current.contains(event.target as Node)) return;
      setProfileMenuOpen(false);
    };
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [profileMenuOpen]);
  useEffect(() => {
    document.body.classList.toggle("nx-private-mode", systemSettings.privateMode);
  }, [systemSettings.privateMode]);
  useEffect(() => {
    document.body.classList.toggle("nx-high-contrast", systemSettings.highContrast);
  }, [systemSettings.highContrast]);
  useEffect(() => {
    if (!systemSettingsOpen && !activeProfilePanel && !profileMenuOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSystemSettingsOpen(false);
        setActiveProfilePanel(null);
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [systemSettingsOpen, activeProfilePanel, profileMenuOpen]);
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
  function toggleTheme() {
    setTheme(t => (t === "dark" ? "light" : "dark"));
  }
  function openProfilePanel(panel: ProfilePanelKey) {
    setActiveProfilePanel(panel);
    setProfileMenuOpen(false);
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
      "X-Nexus-Web-Pct": "50",
      "X-Nexus-AI-Pct": "50",
      "X-Nexus-Use-Both": "1",
      "X-Nexus-Consensus-Before-Web": "1",
      "X-Nexus-Preferred": "",
      "X-Nexus-Mode": "balanced"
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
          <div className="nx-top-left">
            <div className="nx-top-heading">
              <h2 className="title">{current ? current.title : "New chat"}</h2>
              <span className="subtitle">{lastUpdatedLabel}</span>
            </div>
            {current ? (
              <div className="actions">
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
                  <Download size={16} /> Export
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setStatus(current.id, current.status === "archived" ? "active" : "archived")}
                >
                  <Archive size={16} /> {current.status === "archived" ? "Unarchive" : "Archive"}
                </button>
                <button type="button" className="btn danger" onClick={() => setStatus(current.id, "trash")}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            ) : (
              <p className="subtitle muted">Launch a new multi-model briefing without leaving private mode.</p>
            )}
          </div>
          <div className="nx-top-right">
            <div className="nx-top-status">
              <span className="nx-top-chip">
                <ShieldCheck size={14} /> Zero-trust ready
              </span>
              {systemSettings.privateMode && <span className="nx-top-chip emphasis">Private mode</span>}
              {systemSettings.redactPII && <span className="nx-top-chip soft">PII redaction</span>}
            </div>
            <div className="nx-top-buttons">
              <button
                type="button"
                className="icon-btn"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                onClick={toggleTheme}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                type="button"
                className="icon-btn"
                title="Open system settings"
                onClick={() => setSystemSettingsOpen(true)}
              >
                <Settings size={18} />
              </button>
              <div className={`nx-profile-anchor${profileMenuOpen ? " open" : ""}`} ref={profileMenuRef}>
                <button
                  type="button"
                  className="nx-profile-trigger"
                  aria-haspopup="true"
                  aria-expanded={profileMenuOpen}
                  onClick={() => setProfileMenuOpen(open => !open)}
                  title="Profile & workspace"
                >
                  <div className="nx-avatar" style={{ background: avatarColor }}>
                    {avatarInitials || "N"}
                  </div>
                </button>
                {profileMenuOpen && (
                  <div className="nx-profile-menu" role="menu">
                    <div className="nx-profile-summary">
                      <div className="nx-avatar sm" style={{ background: avatarColor }}>
                        {avatarInitials || "N"}
                      </div>
                      <div>
                        <strong>{profile.name}</strong>
                        <span>{profile.email}</span>
                      </div>
                    </div>
                    <button type="button" role="menuitem" onClick={() => openProfilePanel("user")}>
                      <UserCog size={16} /> User Settings
                    </button>
                    <button type="button" role="menuitem" onClick={() => openProfilePanel("billing")}>
                      <CreditCard size={16} /> Billing Options
                    </button>
                    <button type="button" role="menuitem" onClick={() => openProfilePanel("feedback")}>
                      <MessageSquareDiff size={16} /> System Feedback
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="cx-stream">
          <div className="cx-stream-inner">
            {!current || current.messages.length === 0 ? (
              <div className="cx-hero">
                <h1>How can Nexus help today?</h1>
                <p className="muted">Ask a question, paste a document, or say \"/help\".</p>
                <div className="quick">
                  <button type="button" onClick={() => setInput("Explain transformers like I\u2019m 12")}>
                    Explain simply
                  </button>
                  <button type="button" onClick={() => setInput("Summarize the following article:\n")}>
                    Summarize
                  </button>
                  <button type="button" onClick={() => setInput("Draft a concise email about…")}>
                    Draft an email
                  </button>
                  {systemSettings.smartCompose && (
                    <button
                      type="button"
                      onClick={() =>
                        setInput(
                          "Generate a private executive briefing with anonymized identifiers and actionable next steps."
                        )
                      }
                    >
                      Executive briefing
                    </button>
                  )}
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
      </main>
      {systemSettingsOpen && (
        <SystemSettingsModal
          settings={systemSettings}
          onChange={patch => setSystemSettings(prev => ({ ...prev, ...patch }))}
          onClose={() => setSystemSettingsOpen(false)}
        />
      )}
      {activeProfilePanel && (
        <ProfilePanel
          panel={activeProfilePanel}
          profile={profile}
          systemSettings={systemSettings}
          onClose={() => setActiveProfilePanel(null)}
          onSaveProfile={setProfile}
          onOpenSystemSettings={() => {
            setActiveProfilePanel(null);
            setSystemSettingsOpen(true);
          }}
        />
      )}
    </div>
  );
}

function SystemSettingsModal({
  settings,
  onChange,
  onClose
}: {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onClose: () => void;
}) {
  const [retention, setRetention] = React.useState(() => localStorage.getItem("nx.system-retention") || "30");
  React.useEffect(() => {
    localStorage.setItem("nx.system-retention", retention);
  }, [retention]);
  return (
    <div className="nx-dialog-backdrop" role="dialog" aria-modal="true" aria-label="System settings">
      <div className="nx-dialog">
        <div className="nx-dialog-header">
          <div>
            <h3>System settings</h3>
            <p className="nx-dialog-subhead">
              Calibrate workspace controls without leaving the conversation. Changes apply instantly for this browser.
            </p>
          </div>
          <button type="button" className="icon-btn ghost" onClick={onClose} aria-label="Close system settings">
            <X size={16} />
          </button>
        </div>

        <div className="nx-settings-group">
          <SettingToggle
            label="Redact PII automatically"
            description="Scrub sensitive identifiers from prompts, attachments, and transcripts."
            checked={settings.redactPII}
            onToggle={value => onChange({ redactPII: value })}
          />
          <SettingToggle
            label="Private mode"
            description="Exclude this session from analytics and auto-purge history after 24 hours."
            checked={settings.privateMode}
            onToggle={value => onChange({ privateMode: value })}
          />
          <SettingToggle
            label="High contrast interface"
            description="Increase legibility for control room displays and reduce eye strain."
            checked={settings.highContrast}
            onToggle={value => onChange({ highContrast: value })}
          />
          <SettingToggle
            label="Smart compose boosters"
            description="Show contextual prompts and adaptive tone suggestions while you type."
            checked={settings.smartCompose}
            onToggle={value => onChange({ smartCompose: value })}
          />
        </div>

        <div className="nx-settings-meta">
          <label className="nx-field">
            <span>Session transcript retention</span>
            <select value={retention} onChange={event => setRetention(event.target.value)}>
              <option value="7">7 days</option>
              <option value="30">30 days (recommended)</option>
              <option value="90">90 days</option>
              <option value="forever">Keep indefinitely</option>
            </select>
          </label>
          <label className="nx-field">
            <span>Workspace notifications</span>
            <select defaultValue="digest">
              <option value="realtime">Real-time alerts</option>
              <option value="digest">Daily digest</option>
              <option value="minimal">Security events only</option>
              <option value="off">Do not disturb</option>
            </select>
          </label>
        </div>

        <div className="nx-dialog-footer">
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              onChange({ redactPII: true, privateMode: false, highContrast: false, smartCompose: true });
              setRetention("30");
            }}
          >
            Restore recommended defaults
          </button>
          <button type="button" className="primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({
  panel,
  profile,
  systemSettings,
  onClose,
  onSaveProfile,
  onOpenSystemSettings
}: {
  panel: ProfilePanelKey;
  profile: ProfileState;
  systemSettings: SystemSettingsState;
  onClose: () => void;
  onSaveProfile: (next: ProfileState) => void;
  onOpenSystemSettings: () => void;
}) {
  const [draftProfile, setDraftProfile] = useState<ProfileState>(profile);
  const [timezone, setTimezone] = useState<string>(() => localStorage.getItem("nx.profile.timezone") || "UTC");
  const [feedback, setFeedback] = useState("");
  const [billingCycle, setBillingCycle] = useState("annual");
  const feedbackLimit = 600;

  useEffect(() => {
    setDraftProfile(profile);
  }, [profile, panel]);
  useEffect(() => {
    localStorage.setItem("nx.profile.timezone", timezone);
  }, [timezone]);

  const title = useMemo(() => ({
    user: "User settings",
    billing: "Billing options",
    feedback: "System feedback"
  })[panel], [panel]);

  const closeAndReset = () => {
    setFeedback("");
    onClose();
  };

  let body: React.ReactNode = null;
  if (panel === "user") {
    body = (
      <form
        className="nx-panel-form"
        onSubmit={event => {
          event.preventDefault();
          onSaveProfile({ ...draftProfile });
          closeAndReset();
        }}
      >
        <label className="nx-field">
          <span>Display name</span>
          <input
            value={draftProfile.name}
            onChange={event => setDraftProfile(prev => ({ ...prev, name: event.target.value }))}
            placeholder="Your name"
          />
        </label>
        <label className="nx-field">
          <span>Role or title</span>
          <input
            value={draftProfile.title}
            onChange={event => setDraftProfile(prev => ({ ...prev, title: event.target.value }))}
            placeholder="Role"
          />
        </label>
        <label className="nx-field">
          <span>Notification email</span>
          <input value={draftProfile.email} readOnly />
          <small>This email is managed by your administrator.</small>
        </label>
        <label className="nx-field">
          <span>Timezone</span>
          <select value={timezone} onChange={event => setTimezone(event.target.value)}>
            <option value="UTC">UTC</option>
            <option value="America/New_York">US Eastern</option>
            <option value="Europe/London">London</option>
            <option value="Asia/Singapore">Singapore</option>
            <option value="Australia/Sydney">Sydney</option>
          </select>
        </label>
        <div className="nx-panel-callout">
          <ShieldCheck size={16} />
          <div>
            <strong>Privacy snapshot</strong>
            <p>
              Private mode is {systemSettings.privateMode ? "enabled" : "disabled"}. PII redaction is {systemSettings.redactPII ? "active" : "off"} for this workspace.
            </p>
          </div>
        </div>
        <div className="nx-dialog-footer">
          <button type="button" className="btn ghost" onClick={onOpenSystemSettings}>
            System settings
          </button>
          <button type="submit" className="primary">
            Save profile
          </button>
        </div>
      </form>
    );
  } else if (panel === "billing") {
    body = (
      <div className="nx-panel-content">
        <section className="nx-panel-card">
          <h4>Current plan</h4>
          <p>Professional — 12 seats</p>
          <ul>
            <li>Priority orchestration queues</li>
            <li>Granular audit logging</li>
            <li>Unlimited compliance exports</li>
          </ul>
          <div className="nx-field">
            <span>Billing cadence</span>
            <select value={billingCycle} onChange={event => setBillingCycle(event.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual (save 15%)</option>
            </select>
          </div>
          <div className="nx-dialog-footer">
            <button
              type="button"
              className="btn ghost"
              onClick={() => console.info("Downloading latest invoice")}
            >
              Download last invoice
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => alert("Our sales team will reach out to tailor an enterprise plan.")}
            >
              Talk to sales
            </button>
          </div>
        </section>
        <section className="nx-panel-card">
          <h4>Usage snapshot</h4>
          <p>89% of allocated AI minutes consumed this cycle.</p>
          <div className="nx-usage-bar">
            <span style={{ width: "89%" }} />
          </div>
          <p className="muted">Add-on packs can be provisioned instantly from billing.</p>
        </section>
      </div>
    );
  } else {
    const remaining = Math.max(0, feedbackLimit - feedback.length);
    body = (
      <form
        className="nx-panel-form"
        onSubmit={event => {
          event.preventDefault();
          console.info("System feedback submitted", { feedback });
          alert("Thanks for helping us calibrate Nexus. Your feedback was recorded locally.");
          closeAndReset();
        }}
      >
        <label className="nx-field">
          <span>Share what went well or what we should improve</span>
          <textarea
            value={feedback}
            onChange={event => setFeedback(event.target.value.slice(0, feedbackLimit))}
            rows={6}
            placeholder="Tell us about your experience..."
          />
          <small>{remaining} characters remaining</small>
        </label>
        <label className="nx-field">
          <span>Attach diagnostics</span>
          <select defaultValue="metrics">
            <option value="metrics">Include anonymized metrics</option>
            <option value="console">Include console logs</option>
            <option value="none">Do not attach any data</option>
          </select>
        </label>
        <div className="nx-dialog-footer">
          <button type="button" className="btn ghost" onClick={closeAndReset}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={!feedback.trim()}>
            Submit feedback
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="nx-dialog-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="nx-dialog wide">
        <div className="nx-dialog-header">
          <div>
            <h3>{title}</h3>
            <p className="nx-dialog-subhead">
              {panel === "user"
                ? "Manage how Nexus represents you across orchestrated workflows."
                : panel === "billing"
                ? "Stay ahead of usage and keep stakeholders informed."
                : "Share direct feedback with the platform team."}
            </p>
          </div>
          <button type="button" className="icon-btn ghost" onClick={closeAndReset} aria-label={`Close ${title}`}>
            <X size={16} />
          </button>
        </div>
        {body}
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onToggle
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: (value: boolean) => void;
}) {
  const id = React.useId();
  return (
    <label className="nx-setting-row" htmlFor={id}>
      <div className="nx-setting-copy">
        <span className="nx-setting-label">{label}</span>
        <span className="nx-setting-description">{description}</span>
      </div>
      <input
        id={id}
        type="checkbox"
        className="nx-switch"
        checked={checked}
        onChange={event => onToggle(event.target.checked)}
      />
    </label>
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
