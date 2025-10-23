import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Archive, Download, Trash2, Paperclip } from "lucide-react";
import { useConversations } from "./useConversations";
import { askJSON, askSSE } from "./api";
import { mdToHtml } from "./md";
import type { Message, AttachmentMeta } from "./types";
import { useNavigationGuards } from "./useNavigationGuards";
import Header from "../../components/Header";
import LeftNav, { type LeftNavSection } from "../../components/LeftNav";
import SettingsSheet from "../../components/SettingsSheet";
import WorkspaceSettingsContent from "../../components/settings/WorkspaceSettingsContent";
import { readProfile, writeProfile, type UserProfile } from "../../state/profile";
import "../../styles/nexus-convos.css";

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

const MAX_FILES = 10;
const MAX_EACH = 1_000_000;
const MAX_TOTAL = 5_000_000;
const TEXT_LIKE = /\.(txt|md|json|csv|js|ts|py|html|css)$/i;

const ProfileModal = React.lazy(() => import("../../components/modals/ProfileModal"));

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

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(() => readProfile());

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

  const handleProfileChange = (next: UserProfile) => {
    setProfile(writeProfile(next));
  };

  const handleDeleteAccount = (feedback: string | null) => {
    console.info("Account deletion requested", { feedback });
    setProfileOpen(false);
  };

  const handleUpgradePlan = () => {
    alert("Upgrade workflow coming soon! Our team has been notified.");
  };

  const startNewChat = async () => {
    const c = await startNew();
    setCurrentId(c.id);
    setFiles([]);
  };

  const openProfile = () => {
    void import("../../components/modals/ProfileModal");
    setProfileOpen(true);
  };

  const sections: LeftNavSection[] = [
    {
      id: "active",
      title: `Active (${active.length})`,
      emptyLabel: "Nothing active",
      items: active.map(c => {
        const last = c.messages.length ? c.messages[c.messages.length - 1] : undefined;
        const preview = (last?.content ?? "").slice(0, 40) + (last?.content ? "\u2026" : "");
        return {
          id: c.id,
          title: c.title,
          subtitle: preview,
          when: formatDate(c.updatedAt),
          active: c.id === currentId,
          onSelect: () => setCurrentId(c.id),
          actions: [
            { label: "Archive", onClick: () => setStatus(c.id, "archived") },
            { label: "Delete", onClick: () => setStatus(c.id, "trash") }
          ]
        };
      })
    },
    {
      id: "archived",
      title: `Archived (${archived.length})`,
      emptyLabel: "Nothing archived",
      items: archived.map(c => {
        const last = c.messages.length ? c.messages[c.messages.length - 1] : undefined;
        const preview = (last?.content ?? "").slice(0, 40) + (last?.content ? "\u2026" : "");
        return {
          id: c.id,
          title: c.title,
          subtitle: preview,
          when: formatDate(c.updatedAt),
          active: c.id === currentId,
          onSelect: () => setCurrentId(c.id),
          actions: [
            { label: "Restore", onClick: () => setStatus(c.id, "active") },
            { label: "Delete", onClick: () => setStatus(c.id, "trash") }
          ]
        };
      })
    },
    {
      id: "trash",
      title: `Trash (${trash.length})`,
      emptyLabel: "Trash is empty",
      extra: (
        <button type="button" className="danger sm" onClick={purgeAllTrash}>
          Empty Trash
        </button>
      ),
      items: trash.map(c => {
        const last = c.messages.length ? c.messages[c.messages.length - 1] : undefined;
        const preview = (last?.content ?? "").slice(0, 40) + (last?.content ? "\u2026" : "");
        return {
          id: c.id,
          title: c.title,
          subtitle: preview,
          when: formatDate(c.updatedAt),
          active: c.id === currentId,
          onSelect: () => setCurrentId(c.id),
          actions: [
            { label: "Restore", onClick: () => setStatus(c.id, "active") },
            { label: "Purge", onClick: () => purge(c.id) }
          ]
        };
      })
    }
  ];

  return (
    <div className="chat-layout">
      <LeftNav
        sections={sections}
        onNewChat={startNewChat}
        onProfileClick={openProfile}
        profileImage={profile.avatarDataUrl}
      />
      <main className="chat-main">
        <Header onOpenSettings={() => setSettingsOpen(true)} />
        <div className="chat-main-inner">
          <div className="chat-session-head">
            {current ? (
              <>
                <h2 className="title">{current.title}</h2>
                <div className="chat-session-actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
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
                    <button type="button" className="chip" onClick={() => setInput("Summarize the following article:\n")}>
                      Summarize
                    </button>
                    <button type="button" className="chip" onClick={() => setInput("Draft a concise email about…")}>
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
        </div>

        <div className="chat-composer">
          <div className="chat-tagline">
            Secured by <span className="chat-tagline__brand">Nexus</span> • Experimental orchestration; answers are verified but not
            guaranteed correct.
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
                    <div className="chip" key={f.name}>
                      <span className="name">{f.name}</span>
                      <span className="size">({formatBytes(f.size)})</span>
                      <button type="button" className="x" onClick={() => removeFile(f.name)}>
                        ✕
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
        </div>
      </main>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <WorkspaceSettingsContent compact />
      </SettingsSheet>

      <Suspense fallback={null}>
        {profileOpen && (
          <ProfileModal
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            profile={profile}
            onProfileChange={handleProfileChange}
            onDeleteAccount={handleDeleteAccount}
            onUpgradePlan={handleUpgradePlan}
          />
        )}
      </Suspense>
    </div>
  );
}
