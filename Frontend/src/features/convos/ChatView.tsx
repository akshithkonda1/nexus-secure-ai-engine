import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const LOGO_DARK_URL = "/assets/nexus-logo.png";
const LOGO_LIGHT_URL = "/assets/nexus-logo-inverted.png";

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

function normaliseConsensus(ai: number, web: number) {
  const clamp = (value: number) => {
    const next = Number.isFinite(value) ? value : 0;
    return Math.min(100, Math.max(0, Math.round(next)));
  };
  const aiClamped = clamp(ai);
  const webClamped = clamp(web);
  if (aiClamped + webClamped === 0) {
    return { ai: 50, web: 50 };
  }
  if (aiClamped + webClamped === 100) {
    return { ai: aiClamped, web: webClamped };
  }
  const total = aiClamped + webClamped;
  const aiPct = Math.min(100, Math.max(0, Math.round((aiClamped / total) * 100)));
  const webPct = 100 - aiPct;
  return { ai: aiPct, web: webPct };
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

  const [density, setDensity] = useState<"comfy" | "cozy" | "compact">(
    () => (localStorage.getItem("nx.density") as "comfy" | "cozy" | "compact" | null) || "comfy"
  );
  useEffect(() => {
    document.documentElement.dataset.density = density;
    localStorage.setItem("nx.density", density);
  }, [density]);

  const cycleDensity = useCallback(() => {
    setDensity(d => (d === "comfy" ? "cozy" : d === "cozy" ? "compact" : "comfy"));
  }, []);

  const logoUrl = useMemo(() => (theme === "dark" ? LOGO_DARK_URL : LOGO_LIGHT_URL), [theme]);

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

  const buildChatHeaders = useCallback(
    (): Record<string, string> => ({
      "Content-Type": "application/json",
      "X-Nexus-Web-Pct": String(system.webPct),
      "X-Nexus-AI-Pct": String(system.aiPct),
      "X-Nexus-Use-Both": system.useBoth ? "1" : "0",
      "X-Nexus-Consensus-Before-Web": system.consensusBeforeWeb ? "1" : "0",
      "X-Nexus-Preferred": system.preferred,
      "X-Nexus-Mode": system.mode
    }),
    [system]
  );

  type Profile = { name: string; email: string; photoDataUrl?: string };
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      return JSON.parse(localStorage.getItem("nx.profile") || "");
    } catch {}
    return { name: "", email: "" };
  });
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    setLogoUrl(t === "light" ? LOGO_LIGHT_URL : LOGO_DARK_URL);
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
        const aiPct = Number.isFinite(parsed.aiConsensusPct) ? Number(parsed.aiConsensusPct) : 50;
        const safeAi = Math.min(100, Math.max(0, aiPct));
        const webPct = Number.isFinite(parsed.webConsensusPct) ? Number(parsed.webConsensusPct) : 100 - safeAi;
        const safeWeb = Math.min(100, Math.max(0, webPct));
        const normalised = normaliseConsensus(safeAi, safeWeb);
        return {
          redactPII: Boolean(parsed.redactPII ?? true),
          privateMode: Boolean(parsed.privateMode ?? false),
          highContrast: Boolean(parsed.highContrast ?? false),
          smartCompose: Boolean(parsed.smartCompose ?? true),
          aiConsensusPct: normalised.ai,
          webConsensusPct: normalised.web
        };
      }
    } catch (err) {
      console.warn("Failed to parse system settings", err);
    }
    return {
      redactPII: true,
      privateMode: false,
      highContrast: false,
      smartCompose: true,
      aiConsensusPct: 50,
      webConsensusPct: 50
    };
  });
  const [openControl, setOpenControl] = useState<"consensus" | "web" | null>(null);
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const el = event.target as HTMLElement | null;
      if (!el) return;
      if (el.closest(".chip-pop") || el.closest(".chip-wrap")) return;
      setOpenControl(null);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenControl(null);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

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

    const controls = {
      piiRedaction: systemSettings.redactPII,
      consensusThreshold: systemSettings.aiConsensusPct / 100,
      webUsageRatio: systemSettings.webConsensusPct / 100
    };

    const bodyPrimary = {
      prompt,
      attachments: textChunks.map(t => ({ name: t.name, content: t.content })),
      options: controls
    };
    const bodyInline = {
      prompt: inlineTextAttachmentsIntoPrompt(prompt, textChunks),
      options: controls
    };

    const headers = buildChatHeaders();

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
        {
          prompt: lastUser.content,
          options: {
            piiRedaction: systemSettings.redactPII,
            consensusThreshold: systemSettings.aiConsensusPct / 100,
            webUsageRatio: systemSettings.webConsensusPct / 100
          }
        },
        buildChatHeaders(),
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
      await askJSON(
        {
          prompt: lastUser.content,
          options: {
            piiRedaction: systemSettings.redactPII,
            consensusThreshold: systemSettings.aiConsensusPct / 100,
            webUsageRatio: systemSettings.webConsensusPct / 100
          }
        },
        buildChatHeaders(),
        (c, m) =>
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
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

            <button
              type="button"
              className="icon-btn"
              title={`Density: ${density.charAt(0).toUpperCase()}${density.slice(1)}`}
              onClick={cycleDensity}
              aria-label="Toggle density"
            >
              ↕
            </button>

            <button type="button" className="icon-btn" title="System Settings" onClick={() => setShowSettings(true)}>
              <Gear size={16} />
            </button>

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
          {current ? (
            <>
              <h2 className="title">{current.title}</h2>
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
            </>
          ) : (
            <h2 className="title">New chat</h2>
          )}
        </header>

        <div className="nx-controls">
          <div className="nx-inner nx-controls-inner">
            <button
              type="button"
              className={`chip ${systemSettings.redactPII ? "on" : ""}`}
              title="Mask PII in prompts and responses"
              onClick={() =>
                setSystemSettings(prev => ({
                  ...prev,
                  redactPII: !prev.redactPII
                }))
              }
            >
              PII redaction{systemSettings.redactPII ? "" : " (off)"}
            </button>

            <div className="chip-wrap">
              <button
                type="button"
                className="chip"
                onClick={() => setOpenControl(current => (current === "consensus" ? null : "consensus"))}
                title="Fraction of model answers that must agree"
              >
                AI consensus – {systemSettings.aiConsensusPct}%
              </button>
              {openControl === "consensus" && (
                <div className="chip-pop">
                  <label className="pop-label">Consensus threshold: {systemSettings.aiConsensusPct}%</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={systemSettings.aiConsensusPct}
                    onChange={e =>
                      setSystemSettings(prev => {
                        const parsed = Number.parseInt(e.target.value, 10);
                        const aiValue = Number.isFinite(parsed)
                          ? Math.min(100, Math.max(0, parsed))
                          : 0;
                        return { ...prev, aiConsensusPct: aiValue, webConsensusPct: 100 - aiValue };
                      })
                    }
                  />
                  <div className="pop-actions">
                    <button type="button" className="btn xs" onClick={() => setOpenControl(null)}>
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="chip-wrap">
              <button
                type="button"
                className="chip"
                onClick={() => setOpenControl(current => (current === "web" ? null : "web"))}
                title="Percent of response allowed to draw from the web"
              >
                Web insight – {systemSettings.webConsensusPct}%
              </button>
              {openControl === "web" && (
                <div className="chip-pop">
                  <label className="pop-label">Web usage: {systemSettings.webConsensusPct}%</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={systemSettings.webConsensusPct}
                    onChange={e =>
                      setSystemSettings(prev => {
                        const parsed = Number.parseInt(e.target.value, 10);
                        const webValue = Number.isFinite(parsed)
                          ? Math.min(100, Math.max(0, parsed))
                          : 0;
                        return { ...prev, aiConsensusPct: 100 - webValue, webConsensusPct: webValue };
                      })
                    }
                  />
                  <div className="pop-actions">
                    <button type="button" className="btn xs" onClick={() => setOpenControl(null)}>
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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
            <div className="nx-inner">
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
                  <div className="compose-actions">
                    <button type="button" className="icon-btn" title="Regenerate" onClick={regenerate}>
                      ↻
                    </button>
                    <button type="submit" className="btn primary" disabled={!input.trim() && files.length === 0}>
                      Send
                    </button>
                  </div>
                ) : (
                  <div className="compose-actions">
                    <button type="button" className="icon-btn danger" title="Stop" onClick={stop}>
                      ■
                    </button>
                  </div>
                )}

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
              </div>
            </div>
          <div className="cx-hint">
            Enter to send • Shift+Enter for newline • Attach text files up to {formatBytes(MAX_EACH)} each
          </div>
        </form>
      </main>
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
