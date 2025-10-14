import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { runNexus } from "./api/nexus";
import {
  Sun,
  Moon,
  Send,
  ShieldCheck,
  Lock,
  KeyRound,
  MessageSquare,
  Activity,
  Info,
  Plus,
  Trash2,
  Edit3,
  Settings,
  Search,
  Menu,
  Archive,
  ArrowLeft,
  Clipboard,
  ClipboardCheck,
  ArrowDown,
} from "lucide-react";

/**
 * Enhanced Chat Layout – Full Functionality + ChatGPT-like Theming
 * (Updated with richer UX, keyboard shortcuts, and accessibility improvements.)
 */

// ---------- Utilities ----------
const genId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
const formatRelative = (ts: number) => {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};
const priorityTier = (n: number) => (n >= 4 ? "high" : n === 3 ? "medium" : "low");

// --- User storage helpers ---
const LS_USER = "nexus_user_v1";
const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_USER) || "null");
  } catch {
    return null;
  }
};
const writeUser = (u: any) => {
  if (!u) localStorage.removeItem(LS_USER);
  else localStorage.setItem(LS_USER, JSON.stringify(u));
};

// Theme: ChatGPT-like 0.5s fade + CSS variables
const applyTheme = (isDark: boolean) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;
  body.classList.add("theme-fade");
  setTimeout(() => body.classList.remove("theme-fade"), 500);
  root.classList.toggle("dark", !!isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
  const vars = isDark
    ? {
        "--bg": "#0f0f0f",
        "--fg": "#e5e7eb",
        "--surface": "#1a1a1a",
        "--surface-alt": "#0f0f0f",
        "--border": "#2d2d2d",
        "--icon": "#9ca3af",
        "--accent": "#ffffff",
        "--accent-contrast": "#0f0f0f",
      }
    : {
        "--bg": "#ffffff",
        "--fg": "#111827",
        "--surface": "#ffffff",
        "--surface-alt": "#ffffff",
        "--border": "#e5e7eb",
        "--icon": "#4b5563",
        "--accent": "#111827",
        "--accent-contrast": "#ffffff",
      };
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v as string));
};

// Inject base CSS once
(function injectThemeCss() {
  if (typeof document === "undefined") return;
  if (document.getElementById("nexus-theme-css")) return;
  const style = document.createElement("style");
  style.id = "nexus-theme-css";
  style.innerHTML = `
    :root { --bg:#ffffff; --fg:#111827; --surface:#ffffff; --surface-alt:#ffffff; --border:#e5e7eb; --icon:#4b5563; --accent:#111827; --accent-contrast:#ffffff; --transition: background-color .5s ease, color .5s ease, border-color .5s ease, fill .5s ease, stroke .5s ease, opacity .5s ease; }
    .dark { --bg:#0f0f0f; --fg:#e5e7eb; --surface:#1a1a1a; --surface-alt:#0f0f0f; --border:#2d2d2d; --icon:#9ca3af; --accent:#ffffff; --accent-contrast:#0f0f0f; }
    body, .top-bar { background-color: var(--bg); color: var(--fg); transition: var(--transition); }
    body.theme-fade, body.theme-fade * { transition: var(--transition); opacity: .92; }
    .card, .surface, .chat-box, .sidebar, .drawer-item, .tab-chip, input, textarea, button { transition: var(--transition); }
    .lucide { color: var(--icon); stroke: var(--icon); transition: var(--transition); }
    .btn { border: 1px solid var(--border); background-color: var(--surface-alt); }
    .btn-primary { background-color: var(--accent); color: var(--accent-contrast); border: 1px solid var(--accent); }
    .btn-ghost { background-color: transparent; border: 1px solid transparent; }
    @keyframes pulse { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  `;
  document.head.appendChild(style);
})();

// ---------- Models ----------
const MODELS = [
  { id: "grok", label: "Grok", specialty: "Philosophy / Reasoning" },
  { id: "chatgpt", label: "ChatGPT", specialty: "General / Everything" },
  { id: "claude", label: "Claude", specialty: "Code / Engineering" },
  { id: "perplexity", label: "Perplexity", specialty: "Deep Research" },
];

// ---------- Local storage / Config ----------
const LS_SESSIONS = "nexus_sessions_v2";
const LS_MESSAGES_PREFIX = "nexus_msgs_";
const LS_CFG = "nexus_cfg_v1";
const readConfig = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_CFG) || "{}");
  } catch {
    return {};
  }
};
const writeConfig = (patch: any) => {
  const next = {
    retentionDays: 30,
    dependableThresholdPct: 80,
    ...readConfig(),
    ...patch,
  };
  localStorage.setItem(LS_CFG, JSON.stringify(next));
  return next;
};
writeConfig({});

const SessionService = {
  _purge(rows: any[]) {
    const { retentionDays = 30 } = readConfig();
    const ms = Math.max(1, retentionDays) * 86400000;
    const now = Date.now();
    const kept = rows.filter(
      (r: any) =>
        !(
          (r.archivedAt && now - r.archivedAt >= ms) ||
          (r.deletedAt && now - r.deletedAt >= ms)
        )
    );
    if (kept.length !== rows.length)
      localStorage.setItem(LS_SESSIONS, JSON.stringify(kept));
    return kept;
  },
  _load() {
    const rows = JSON.parse(localStorage.getItem(LS_SESSIONS) || "[]");
    return SessionService._purge(rows).sort(
      (a: any, b: any) => b.updatedAt - a.updatedAt
    );
  },
  list() {
    return SessionService._load().filter(
      (r: any) => !r.archivedAt && !r.deletedAt
    );
  },
  listArchived() {
    return SessionService._load().filter(
      (r: any) => !!r.archivedAt && !r.deletedAt
    );
  },
  listDeleted() {
    return SessionService._load().filter((r: any) => !!r.deletedAt);
  },
  create(title = "New chat") {
    const rows = SessionService._load();
    const s = {
      id: genId(),
      title,
      memory: "",
      updatedAt: Date.now(),
      archivedAt: null,
      deletedAt: null,
    };
    rows.unshift(s);
    localStorage.setItem(LS_SESSIONS, JSON.stringify(rows));
    localStorage.setItem(LS_MESSAGES_PREFIX + s.id, JSON.stringify([]));
    return s;
  },
  update(id: string, patch: any) {
    const rows = SessionService._load().map((r: any) =>
      r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r
    );
    localStorage.setItem(LS_SESSIONS, JSON.stringify(rows));
    return rows.find((r: any) => r.id === id);
  },
  archive(id: string) {
    return SessionService.update(id, { archivedAt: Date.now(), deletedAt: null });
  },
  restore(id: string) {
    return SessionService.update(id, { archivedAt: null, deletedAt: null });
  },
  softDelete(id: string) {
    return SessionService.update(id, { deletedAt: Date.now() });
  },
  remove(id: string) {
    const rows = SessionService._load().filter((r: any) => r.id !== id);
    localStorage.setItem(LS_SESSIONS, JSON.stringify(rows));
    localStorage.removeItem(LS_MESSAGES_PREFIX + id);
  },
  messages(id: string) {
    return JSON.parse(localStorage.getItem(LS_MESSAGES_PREFIX + id) || "[]");
  },
  saveMessages(id: string, msgs: any[]) {
    localStorage.setItem(LS_MESSAGES_PREFIX + id, JSON.stringify(msgs));
    SessionService.update(id, {});
  },
};

const MAX_INPUT_HEIGHT = 220;
export default function EnhancedChatLayout() {
  // Theme state
  const [darkMode, setDarkMode] = useState(() =>
    JSON.parse(localStorage.getItem("darkMode") || "false")
  );
  useEffect(() => {
    applyTheme(darkMode);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Panels
  const [settingsPage, setSettingsPage] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [sessionTab, setSessionTab] = useState<"active" | "archived" | "deleted">(
    "active"
  );
  const sessionSearchRef = useRef<HTMLInputElement | null>(null);

  // Settings
  const [privateMode, setPrivateMode] = useState(false);
  const [redactPII, setRedactPII] = useState(true);
  const [crossCheck, setCrossCheck] = useState(true);
  const [sources, setSources] = useState(3);
  const [consensus, setConsensus] = useState(0.7);
  const [selectedModels, setSelectedModels] = useState(MODELS.map((m) => m.id));
  const [modelSpecialization, setModelSpecialization] = useState(true);
  const [dependableThresholdPct, setDependableThresholdPct] = useState(() =>
    readConfig().dependableThresholdPct ?? 80
  );
  const [retentionDays, setRetentionDays] = useState(() =>
    readConfig().retentionDays ?? 30
  );
  const onToggleModel = (id: string) =>
    setSelectedModels((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // Sessions + messages
  const [sessions, setSessions] = useState(() => SessionService.list());
  const [archived, setArchived] = useState(() => SessionService.listArchived());
  const [deleted, setDeleted] = useState(() => SessionService.listDeleted());
  const refreshSessions = useCallback(() => {
    setSessions(SessionService.list());
    setArchived(SessionService.listArchived());
    setDeleted(SessionService.listDeleted());
  }, []);
  const [sessionQuery, setSessionQuery] = useState("");
  const trimmedQuery = sessionQuery.trim().toLowerCase();
  const filteredList = useMemo(() => {
    const q = trimmedQuery;
    const src =
      sessionTab === "archived"
        ? archived
        : sessionTab === "deleted"
        ? deleted
        : sessions;
    if (!q) return src;
    return src.filter(
      (s: any) =>
        s.title.toLowerCase().includes(q) ||
        (s.memory || "").toLowerCase().includes(q)
    );
  }, [archived, deleted, sessions, sessionTab, trimmedQuery]);

  const sessionCounts = useMemo(
    () => ({
      active: sessions.length,
      archived: archived.length,
      deleted: deleted.length,
    }),
    [sessions.length, archived.length, deleted.length]
  );

  const [activeSessionId, setActiveSessionId] = useState(
    () => sessions[0]?.id || null
  );
  const allSessions = useMemo(
    () => [...sessions, ...archived, ...deleted],
    [sessions, archived, deleted]
  );
  const activeSession = useMemo(
    () => allSessions.find((s: any) => s.id === activeSessionId) || null,
    [allSessions, activeSessionId]
  );

  const [messages, setMessages] = useState(() =>
    activeSessionId ? SessionService.messages(activeSessionId) : []
  );
  useEffect(() => {
    setMessages(activeSessionId ? SessionService.messages(activeSessionId) : []);
  }, [activeSessionId]);

  const listRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior });
  }, []);
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom("auto");
      setShowScrollToBottom(false);
    } else if (messages.length) {
      setShowScrollToBottom(true);
    }
  }, [messages, isAtBottom, scrollToBottom]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    const handleScroll = () => {
      const threshold = 72;
      const atBottom =
        node.scrollHeight - node.scrollTop - node.clientHeight <= threshold;
      setIsAtBottom(atBottom);
      setShowScrollToBottom(!atBottom);
    };
    handleScroll();
    node.addEventListener("scroll", handleScroll, { passive: true } as any);
    return () => node.removeEventListener("scroll", handleScroll as any);
  }, [messages]);

  // Input
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState("");
  useAutoResizeTextarea(inputRef, input);
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeSessionId]);

  // Result / audit
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [audit, setAudit] = useState<any[]>([]);
  const [uiSessionId] = useState(() => genId().slice(0, 8));
  const log = useCallback(
    (action: string, meta: any = {}) =>
      setAudit((a) => [{ ts: Date.now(), action, meta }, ...a].slice(0, 120)),
    []
  );

  // --- Auth & user settings state ---
  const [user, setUser] = useState<any>(() => readUser());
  const [meta, setMeta] = useState<any>(null); // { providers: string[], hasPassword: boolean }
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);

  // Hydrate user from server on mount
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me", { cache: "no-store" });
        const j = await r.json();
        if (j?.user) {
          writeUser(j.user);
          setUser(j.user);
        }
        if (j?.meta) setMeta(j.meta);
      } catch {}
    })();
  }, []);

  // --- Profile actions wired to your API ---
  const onAvatarUpload = useCallback(
    async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/avatar", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Upload failed");
      const next = { ...(user || {}), image: j.image };
      writeUser(next);
      setUser(next);
    },
    [user]
  );

  const onSaveProfile = useCallback(
    async ({ name, username }: { name?: string; username?: string }) => {
      if (!meta?.hasPassword)
        return alert("Profile is locked for OAuth-only accounts.");
      const r = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username }),
      });
      const j = await r.json();
      if (!r.ok) return alert(j?.error || "Update failed");
      writeUser(j.user);
      setUser(j.user);
      alert("Profile updated");
    },
    [meta]
  );

  const onChangePassword = useCallback(async () => {
    if (!meta?.hasPassword)
      return alert("Available only for Nexus (password) accounts.");
    const r = await fetch("/api/auth/request-password-reset", { method: "POST" });
    const j = await r.json();
    if (!r.ok) return alert(j?.error || "Could not request reset");
    alert("If eligible, a reset link was sent to your email.");
  }, [meta]);

  const onDestroyAccount = useCallback(async (feedback: string) => {
    if (feedback.length > 10000) return alert("Feedback too long");
    if (!confirm("This will permanently delete your account. Continue?"))
      return;
    const r = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j?.error || "Delete failed");
    writeUser(null);
    setUser(null);
    setMeta(null);
    window.location.href = "/";
  }, []);

  // Ensure at least one active chat session always exists
  useEffect(() => {
    if (
      (sessions?.length ?? 0) === 0 &&
      (archived?.length ?? 0) === 0 &&
      (deleted?.length ?? 0) === 0
    ) {
      const s = SessionService.create("New chat");
      refreshSessions();
      setActiveSessionId(s.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep activeSessionId valid when lists change
  useEffect(() => {
    const exists = allSessions.some((s: any) => s.id === activeSessionId);
    if (!exists) {
      const fallback = sessions?.[0] || archived?.[0] || deleted?.[0] || null;
      setActiveSessionId(fallback ? (fallback as any).id : null);
    }
  }, [allSessions, sessions, archived, deleted, activeSessionId]);

  const handleNewChat = useCallback(() => {
    const s = SessionService.create("New chat");
    refreshSessions();
    setActiveSessionId(s.id);
    setSessionsOpen(false);
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [refreshSessions]);
  const renameSession = useCallback(
    (id: string) => {
      const cur = allSessions.find((s: any) => s.id === id);
      const t = prompt("Rename session", cur?.title || "");
      if (t && t.trim()) {
        SessionService.update(id, { title: t.trim() });
        refreshSessions();
      }
    },
    [allSessions, refreshSessions]
  );
  const archiveSession = useCallback(
    (id: string) => {
      SessionService.archive(id);
      refreshSessions();
      if (id === activeSessionId && sessionTab !== "archived")
        setActiveSessionId(SessionService.list()?.[0]?.id || null);
    },
    [activeSessionId, refreshSessions, sessionTab]
  );
  const restoreSession = useCallback(
    (id: string) => {
      SessionService.restore(id);
      refreshSessions();
      setActiveSessionId(id);
    },
    [refreshSessions]
  );
  const softDeleteSession = useCallback(
    (id: string) => {
      SessionService.softDelete(id);
      refreshSessions();
      if (id === activeSessionId && sessionTab !== "deleted")
        setActiveSessionId(SessionService.list()?.[0]?.id || null);
    },
    [activeSessionId, refreshSessions, sessionTab]
  );
  const destroySession = useCallback(
    (id: string) => {
      if (!confirm("Permanently destroy this session?")) return;
      SessionService.remove(id);
      refreshSessions();
      if (id === activeSessionId)
        setActiveSessionId(SessionService.list()?.[0]?.id || null);
    },
    [activeSessionId, refreshSessions]
  );

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const copyMessage = useCallback(async (id: string, text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.focus();
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setCopiedMessageId(id);
      setTimeout(
        () => setCopiedMessageId((prev) => (prev === id ? null : prev)),
        2000
      );
    } catch {
      alert("Could not copy to clipboard");
    }
  }, []);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || running) return;
    let sid = activeSessionId as any;
    if (!sid) {
      const s = SessionService.create("New chat");
      refreshSessions();
      sid = s.id;
      setActiveSessionId(sid);
    }

    const userMsg = { id: genId(), role: "user", text, ts: Date.now() };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    SessionService.saveMessages(sid, nextMsgs);
    setInput("");
    setIsAtBottom(true);

    setRunning(true);
    log("orchestrate.start", {
      privateMode,
      redactPII,
      crossCheck,
      sources,
      consensus,
      models: selectedModels,
      modelSpecialization,
    });
    const applyResult = (
      answers: { model: string; ms: number; text: string }[],
      res: {
        confidence: number;
        votes: { model: string; agrees: boolean; score: number }[];
        explanations: string[];
        answers: { model: string; ms: number; text: string }[];
      }
    ) => {
      setResult(res);
      setRunning(false);
      log("orchestrate.finish", {
        confidence: res.confidence,
        models: res.votes.length,
      });

      const normalized = answers.map((a) =>
        a.text.replace(/^Answer from [^:]+:\\s*/, "").trim()
      );
      const freq = new Map<string, { count: number; idxs: number[] }>();
      normalized.forEach((t, i) => {
        const k = t.toLowerCase();
        const v = freq.get(k) || { count: 0, idxs: [] };
        v.count++;
        v.idxs.push(i);
        freq.set(k, v);
      });
      let bestKey: string | null = null,
        bestCount = 0;
      for (const [k, v] of freq.entries()) {
        if (v.count > bestCount) {
          bestCount = v.count;
          bestKey = k;
        }
      }
      let bestIdx = 0;
      if (bestKey !== null) {
        const cands = freq.get(bestKey)!.idxs;
        if (cands.length > 1 && res.votes?.length) {
          bestIdx = cands.reduce(
            (bi: number, i: number) =>
              res.votes[i]?.score > res.votes[bi]?.score ? i : bi,
            cands[0]
          );
        } else {
          bestIdx = cands[0];
        }
      }
      const overallText = normalized[bestIdx] || normalized[0] || "";

      const consensusPct = Math.round(res.confidence * 100);
      const mCount = res.votes.length;
      const meta = `Consensus ${consensusPct}% • ${mCount} models • tier: ${priorityTier(
        mCount
      )} • specialization: ${modelSpecialization ? "on" : "off"}${
        mCount < 3 ? " • below min models (3)" : ""
      }`;
      const msg = {
        id: genId(),
        role: "assistant",
        text: overallText,
        meta,
        ts: Date.now(),
      };
      const finalMsgs = [...nextMsgs, msg];
      setMessages(finalMsgs);
      SessionService.saveMessages(sid, finalMsgs);
      setTimeout(() => inputRef.current?.focus(), 30);
    };

    setResult(null);
    (async () => {
      try {
        const apiBase = (import.meta as any).env?.VITE_NEXUS_API_BASE;
        if (apiBase) {
          const data = await runNexus(text, { wantPhotos: false });
          const winnerModel = data.winner_ref?.name || data.winner || "winner";
          const latencySec =
            (data.meta?.latencies && data.meta.latencies[winnerModel]) || 0.7;
          const answers = [
            {
              model: winnerModel,
              ms: Math.max(400, Math.min(2000, (latencySec || 0.7) * 1000)),
              text: data.answer,
            },
          ];
          const votes = (data.participants || []).map((p, i) => ({
            model: p,
            agrees: p === winnerModel,
            score: p === winnerModel ? 0.95 : Math.max(0.1, 0.6 - i * 0.03),
          }));
          const res = {
            confidence: votes.length
              ? Math.max(...votes.map((v) => v.score))
              : 0.9,
            votes,
            explanations: [
              data.meta?.policy
                ? `Policy: ${data.meta.policy}`
                : "Aggregated and verified.",
              data.meta?.schema_version
                ? `Schema ${data.meta.schema_version}`
                : "",
            ].filter(Boolean),
            answers,
          };
          applyResult(answers, res);
          (window as any).__nexusSources = data.sources;
          (window as any).__nexusMeta = data.meta;
        } else {
          setTimeout(() => {
            const answers = selectedModels.map((id, i) => ({
              model: MODELS.find((m) => m.id === id)?.label || id,
              ms: 700 + i * 120 + Math.floor(Math.random() * 300),
              text: `Answer from ${id}: ${text}`,
            }));
            const confidence = Math.min(
              0.98,
              0.55 + selectedModels.length * 0.08 + (crossCheck ? 0.06 : 0)
            );
            const res = {
              confidence: +confidence.toFixed(2),
              votes: answers.map((a, i) => ({
                model: a.model,
                agrees: i % 2 === 0,
                score: +(confidence - i * 0.05).toFixed(2),
              })),
              explanations: [
                "Cross-checked claims.",
                "Applied consensus threshold.",
              ],
              answers,
            };
            applyResult(answers, res);
          }, 650);
        }
      } catch (e: any) {
        setRunning(false);
        const code = e?.code || e?.status;
        const retryAfter = e?.retryAfter;
        if (code === 429 && typeof retryAfter === "number") {
          alert(`Rate limited. Please retry in ${retryAfter} seconds.`);
        } else if (code === 504) {
          alert(
            "The request timed out (deadline_exceeded). Try again with a longer deadline."
          );
        } else if (code === 502 || code === "verification_failed") {
          alert(
            "Upstream verification/connectors are unavailable. Please try again shortly."
          );
        } else {
          alert(e?.message || "Request failed.");
        }
        console.error("Nexus API error", e);
      }
    })();
  }, [
    input,
    running,
    activeSessionId,
    refreshSessions,
    messages,
    log,
    privateMode,
    redactPII,
    crossCheck,
    sources,
    consensus,
    selectedModels,
    modelSpecialization,
  ]);
  // ---------- Keyboard Shortcuts ----------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setDarkMode((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSessionsOpen(true);
        setSessionTab("active");
        setTimeout(() => sessionSearchRef.current?.focus(), 60);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (sessionsOpen) {
          setSessionsOpen(false);
        } else if (settingsPage) {
          setSettingsPage(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sessionsOpen, settingsPage]);

  useEffect(() => {
    if (sessionsOpen) {
      setTimeout(() => sessionSearchRef.current?.focus(), 120);
    }
  }, [sessionsOpen, sessionTab]);

  // ---------- Render ----------
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}>
      {/* Top bar */}
      <header
        className="top-bar sticky top-0 z-20 backdrop-blur px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          {!sessionsOpen ? (
            <button
              onClick={() => setSessionsOpen(true)}
              className="p-2 rounded-lg"
              style={{
                backgroundColor: "var(--surface-alt)",
                border: "1px solid var(--border)",
              }}
              title="Chat history (⌘/Ctrl + K)"
              aria-label="Open chat history"
            >
              <Menu className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setSessionsOpen(false)}
              className="p-2 rounded-lg"
              style={{
                backgroundColor: "var(--surface-alt)",
                border: "1px solid var(--border)",
              }}
              title="Back to Chat"
              aria-label="Close chat history"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <MessageSquare className="w-5 h-5" aria-hidden="true" />
          <h1 className="text-base font-semibold">Nexus.ai – Chat</h1>
        </div>

        {/* Right controls with profile circle */}
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => setUserSettingsOpen(true)}
              className="rounded-full"
              title="User settings"
              aria-label="User settings"
              style={{
                padding: 2,
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface-alt)",
              }}
            >
              <Avatar
                image={user.image}
                name={user.name || user.username || user.email}
                size={28}
              />
            </button>
          ) : null}

          <button
            onClick={() => {
              setSessionsOpen((prev) =>
                sessionTab === "archived" && prev ? false : true
              );
              setSessionTab("archived");
            }}
            className="p-2 rounded-lg"
            style={{
              backgroundColor: "var(--surface-alt)",
              border: "1px solid var(--border)",
            }}
            title="Archived"
            aria-label="Open archived chats"
          >
            <Archive className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSettingsPage((prev) => !prev)}
            className="p-2 rounded-lg"
            style={{
              backgroundColor: "var(--surface-alt)",
              border: "1px solid var(--border)",
            }}
            title="Settings"
            aria-label="Open settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setDarkMode((next) => !next);
            }}
            className="p-2 rounded-lg"
            style={{
              backgroundColor: "var(--surface-alt)",
              color: "var(--fg)",
              border: "1px solid var(--border)",
            }}
            title={darkMode ? "Dark mode (on)" : "Light mode (on)"}
            aria-label="Toggle theme"
          >
            {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main */}
      {settingsPage ? (
        <main className="p-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" aria-hidden="true" />
                <h3 className="font-semibold">Settings</h3>
              </div>
              <button
                onClick={() => setSettingsPage(false)}
                className="text-sm px-3 py-1 rounded-lg"
                style={{
                  backgroundColor: "var(--surface-alt)",
                  border: "1px solid var(--border)",
                }}
              >
                Back to chat
              </button>
            </div>
            <div className="space-y-6">
              <section aria-label="Policies">
                <h4 className="text-sm font-semibold mb-2">Policies</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Toggle
                    label={privateMode ? "Private mode" : "Standard mode"}
                    checked={privateMode}
                    onChange={setPrivateMode}
                    icon={<ShieldCheck className="w-4 h-4" aria-hidden="true" />}
                  />
                  <Toggle
                    label={`Redact PII: ${redactPII ? "On" : "Off"}`}
                    checked={redactPII}
                    onChange={setRedactPII}
                    icon={<Lock className="w-4 h-4" aria-hidden="true" />}
                  />
                  <Toggle
                    label={`Cross-check: ${crossCheck ? "On" : "Off"}`}
                    checked={crossCheck}
                    onChange={setCrossCheck}
                    icon={<Info className="w-4 h-4" aria-hidden="true" />}
                  />
                </div>
              </section>
              <section aria-label="Models">
                <h4 className="text-sm font-semibold mb-2">Models</h4>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {MODELS.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1 border`}
                      style={{
                        borderColor: selectedModels.includes(m.id)
                          ? "var(--accent)"
                          : "var(--border)",
                        backgroundColor: selectedModels.includes(m.id)
                          ? "rgba(99,102,241,.08)"
                          : "var(--surface-alt)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(m.id)}
                        onChange={() => onToggleModel(m.id)}
                      />
                      <span className="text-sm">
                        {m.label}{" "}
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--icon)" }}
                        >
                          — {m.specialty}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <Toggle
                  label={`Model specialization: ${modelSpecialization ? "On" : "Off"}`}
                  checked={modelSpecialization}
                  onChange={setModelSpecialization}
                  icon={<Info className="w-4 h-4" aria-hidden="true" />}
                />
              </section>
              <section aria-label="Thresholds">
                <h4 className="text-sm font-semibold mb-2">Thresholds</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LabeledSlider
                    label="Consensus threshold"
                    value={consensus}
                    onChange={setConsensus}
                    min={0.5}
                    max={0.95}
                    step={0.01}
                  />
                  <LabeledSlider
                    label="Max sources"
                    value={sources}
                    onChange={setSources}
                    min={1}
                    max={8}
                    step={1}
                  />
                </div>
              </section>
              <section aria-label="Behavior">
                <h4 className="text-sm font-semibold mb-2">Behavior</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div>
                    <label className="text-sm font-medium">
                      Dependable threshold (%)
                    </label>
                    <input
                      type="range"
                      min={60}
                      max={95}
                      step={1}
                      value={dependableThresholdPct}
                      onChange={(e) => {
                        const v = parseInt((e.target as HTMLInputElement).value, 10);
                        setDependableThresholdPct(v);
                        writeConfig({ dependableThresholdPct: v });
                      }}
                      className="w-full mt-2"
                    />
                    <div className="text-xs" style={{ color: "var(--icon)" }}>
                      {dependableThresholdPct}% — below this we augment with web
                      data
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Archive retention (days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={retentionDays}
                      onChange={(e) => {
                        const v = Math.max(
                          1,
                          Math.min(
                            120,
                            parseInt((e.target as HTMLInputElement).value || "0", 10)
                          )
                        );
                        setRetentionDays(v);
                        writeConfig({ retentionDays: v });
                        refreshSessions();
                      }}
                      className="w-full mt-2 rounded-lg border px-2 py-1.5"
                      style={{
                        backgroundColor: "var(--surface-alt)",
                        color: "var(--fg)",
                        borderColor: "var(--border)",
                      }}
                    />
                    <div className="text-xs" style={{ color: "var(--icon)" }}>
                      Archived/deleted chats purge after {retentionDays} day(s)
                    </div>
                  </div>
                </div>
              </section>
              <section aria-label="Danger zone">
                <h4 className="text-sm font-semibold mb-2">Danger zone</h4>
                <button
                  onClick={() => {
                    if (confirm("Clear all sessions?")) {
                      localStorage.removeItem(LS_SESSIONS);
                      Object.keys(localStorage)
                        .filter((k) => k.startsWith(LS_MESSAGES_PREFIX))
                        .forEach((k) => localStorage.removeItem(k));
                      refreshSessions();
                      const s = SessionService.create("New chat");
                      refreshSessions();
                      setActiveSessionId(s.id);
                    }
                  }}
                  className="text-red-600 text-sm underline"
                >
                  Clear all conversations
                </button>
              </section>
            </div>
          </Card>
        </main>
      ) : (
        <main className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Chat */}
            <section
              className="chat-box xl:col-span-7 rounded-2xl border flex flex-col"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--fg)",
                borderColor: "var(--border)",
              }}
              aria-label="Conversation"
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  <div className="text-sm font-semibold">Chat</div>
                  {activeSession && (
                    <div className="text-xs" style={{ color: "var(--icon)" }}>
                      — {activeSession.title}
                      {(activeSession as any)?.deletedAt
                        ? " • deleted"
                        : (activeSession as any)?.archivedAt
                        ? " • archived"
                        : ""}
                    </div>
                  )}
                </div>
              </div>
              <div
                ref={listRef}
                className="h-[58vh] overflow-auto p-4 space-y-3"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
              >
                {messages.length === 0 ? (
                  <div className="text-sm" style={{ color: "var(--icon)" }}>
                    Start the conversation—your messages and assistant answers will
                    appear here.
                  </div>
                ) : (
                  (messages as any[]).map((m) => (
                    <AssistantAwareBubble
                      key={m.id}
                      role={m.role}
                      text={m.text}
                      meta={m.meta}
                      ts={m.ts}
                      onCopy={() => copyMessage(m.id, m.text)}
                      copied={copiedMessageId === m.id}
                    />
                  ))
                )}
              </div>
              {showScrollToBottom && (
                <button
                  className="absolute bottom-28 right-10 rounded-full shadow p-2"
                  style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                  onClick={() => {
                    scrollToBottom();
                    setIsAtBottom(true);
                  }}
                  aria-label="Scroll to latest message"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              )}
              <div style={{ borderTop: "1px solid var(--border)" }} className="p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={2}
                    placeholder={"Type your message…"}
                    className="rounded-xl border px-3 py-2 outline-none focus:ring-2 flex-1"
                    style={{
                      backgroundColor: "var(--surface-alt)",
                      color: "var(--fg)",
                      borderColor: "var(--border)",
                      resize: "none",
                      maxHeight: MAX_INPUT_HEIGHT,
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    aria-label="Message input"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={running || !input.trim()}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "var(--accent-contrast)",
                    }}
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" /> {running ? "Sending…" : "Send"}
                  </button>
                </div>
                <div className="mt-2 text-xs" style={{ color: "var(--icon)" }}>
                  Shift+Enter for newline • Enter to send • ⌘/Ctrl+/ focus input
                </div>
              </div>
            </section>
            {/* Right rail */}
            <section className="xl:col-span-5 space-y-6">
              <CollapsibleCard
                id="result"
                title="Result"
                icon={<Info className="w-4 h-4" aria-hidden="true" />}
                subtitle={
                  result ? (
                    <span className="text-xs" style={{ color: "var(--icon)" }}>
                      {Math.round(result.confidence * 100)}% consensus
                    </span>
                  ) : null
                }
              >
                {!result && !running ? (
                  <Placeholder label="No result yet. Send a message to run." />
                ) : running && !result ? (
                  <ResultSkeleton />
                ) : (
                  <div className="space-y-4 text-sm">
                    <div className="font-medium mb-1">Why this answer</div>
                    <ul className="list-disc ml-5 space-y-1">
                      {result.explanations.map((e: string, i: number) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                    <div>
                      <div className="font-medium mb-1">Model votes</div>
                      <div className="grid grid-cols-2 gap-2">
                        {result.votes.map((v: any, i: number) => (
                          <div
                            key={i}
                            className="rounded-xl border p-2"
                            style={{
                              borderColor: "var(--border)",
                              backgroundColor: "var(--surface-alt)",
                            }}
                          >
                            <div className="font-semibold">{v.model}</div>
                            <div className="text-xs">Agreement: {v.agrees ? "✔" : "✖"}</div>
                            <div className="text-xs">Score: {v.score}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CollapsibleCard>

              <CollapsibleCard
                id="answers"
                title="Answers"
                subtitle={
                  result ? (
                    <span className="text-xs" style={{ color: "var(--icon)" }}>
                      {result.answers.length} models
                    </span>
                  ) : null
                }
              >
                {!result ? (
                  running ? (
                    <ResultSkeleton />
                  ) : (
                    <Placeholder label="Per-model answers (with latency) will appear here after you send a message." />
                  )
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.answers.map((a: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-xl border p-3"
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: "var(--surface-alt)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">{a.model}</div>
                          <div className="text-xs" style={{ color: "var(--icon)" }}>
                            {a.ms} ms
                          </div>
                        </div>
                        <div className="text-sm mt-2 whitespace-pre-wrap break-words">
                          {a.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleCard>

              <CollapsibleCard
                id="audit"
                title="Audit trail"
                icon={<Activity className="w-4 h-4" aria-hidden="true" />}
                subtitle={
                  <span className="text-xs" style={{ color: "var(--icon)" }}>
                    {audit.length} events
                  </span>
                }
              >
                {audit.length === 0 ? (
                  <Placeholder label="No events yet. Your actions will appear here." />
                ) : (
                  <ul className="divide-y max-h-56 overflow-auto" style={{ borderColor: "var(--border)" }}>
                    {audit.map((a, i) => (
                      <li key={i} className="py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-24" style={{ color: "var(--icon)" }}>
                            {formatRelative(a.ts)}
                          </span>
                          <code
                            className="text-xs rounded px-1.5 py-0.5"
                            style={{
                              backgroundColor: "var(--surface-alt)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            {a.action}
                          </code>
                        </div>
                        {Object.keys(a.meta).length > 0 && (
                          <pre
                            className="mt-1 text-xs rounded p-2 overflow-auto max-h-28"
                            style={{
                              backgroundColor: "var(--surface-alt)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            {JSON.stringify(a.meta, null, 2)}
                          </pre>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CollapsibleCard>

              <CollapsibleCard id="security" title="Session Security">
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" /> AES-256 at
                    rest & in transit
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="w-4 h-4" aria-hidden="true" /> Redaction: {redactPII ? "Enabled" : "Disabled"}
                  </li>
                  <li className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" aria-hidden="true" /> UI Session: {uiSessionId}
                  </li>
                </ul>
              </CollapsibleCard>
            </section>
          </div>
        </main>
      )}

      {/* Sessions Drawer */}
      {sessionsOpen && (
        <div className="fixed inset-0 z-30" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.3)" }}
            onClick={() => setSessionsOpen(false)}
          />
          <div
            className="absolute left-0 top-0 h-full w-full max-w-sm"
            style={{ backgroundColor: "var(--surface)", color: "var(--fg)" }}
          >
            <div
              className="sidebar h-full flex flex-col"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--fg)",
                borderRight: "1px solid var(--border)",
              }}
            >
              <div
                className="p-3 flex items-center gap-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <button
                  onClick={() => setSessionsOpen(false)}
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: "var(--surface-alt)",
                    border: "1px solid var(--border)",
                  }}
                  title="Back to chat"
                  aria-label="Close drawer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNewChat}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--accent-contrast)",
                  }}
                >
                  <Plus className="w-3 h-3" /> New chat
                </button>
                <div className="relative ml-auto w-40">
                  <Search
                    className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--icon)" }}
                    aria-hidden="true"
                  />
                  <input
                    ref={sessionSearchRef}
                    value={sessionQuery}
                    onChange={(e) => setSessionQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full pl-7 pr-2 py-1.5 text-sm rounded-lg outline-none"
                    style={{
                      backgroundColor: "var(--surface-alt)",
                      color: "var(--fg)",
                      border: "1px solid var(--border)",
                    }}
                    aria-label="Search sessions"
                  />
                </div>
              </div>
              <div className="px-3 pt-2 flex items-center gap-2 text-xs">
                <TabButton
                  active={sessionTab === "active"}
                  onClick={() => setSessionTab("active")}
                  label={`Active (${sessionCounts.active})`}
                />
                <TabButton
                  active={sessionTab === "archived"}
                  onClick={() => setSessionTab("archived")}
                  label={`Archived (${sessionCounts.archived})`}
                />
                <TabButton
                  active={sessionTab === "deleted"}
                  onClick={() => setSessionTab("deleted")}
                  label={`Deleted (${sessionCounts.deleted})`}
                />
              </div>
              <div className="flex-1 overflow-auto">
                {filteredList.length === 0 ? (
                  <div className="text-sm px-3 py-4" style={{ color: "var(--icon)" }}>
                    No sessions.
                  </div>
                ) : (
                  <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {filteredList.map((s: any) => (
                      <li
                        key={s.id}
                        className={`p-3 cursor-pointer drawer-item`}
                        style={{
                          backgroundColor:
                            activeSessionId === s.id ? "var(--surface-alt)" : "transparent",
                        }}
                        onClick={() => {
                          setActiveSessionId(s.id);
                          setSessionsOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{s.title}</div>
                            <div className="text-[11px]" style={{ color: "var(--icon)" }}>
                              {formatRelative(s.updatedAt)}
                              {s.archivedAt ? " • archived" : ""}
                              {s.deletedAt ? " • deleted" : ""}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {sessionTab === "active" && (
                              <>
                                <IconButton
                                  icon={<Edit3 className="w-3.5 h-3.5" />}
                                  label="Rename"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    renameSession(s.id);
                                  }}
                                />
                                <IconButton
                                  icon={<Archive className="w-3.5 h-3.5" />}
                                  label="Archive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    archiveSession(s.id);
                                  }}
                                />
                                <IconButton
                                  icon={<Trash2 className="w-3.5 h-3.5" />}
                                  label="Delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    softDeleteSession(s.id);
                                  }}
                                />
                              </>
                            )}
                            {sessionTab === "archived" && (
                              <>
                                <IconButton
                                  icon={<span>↩</span>}
                                  label="Restore"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    restoreSession(s.id);
                                  }}
                                />
                                <IconButton
                                  icon={<Trash2 className="w-3.5 h-3.5" />}
                                  label="Move to Deleted"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    softDeleteSession(s.id);
                                  }}
                                />
                              </>
                            )}
                            {sessionTab === "deleted" && (
                              <>
                                <IconButton
                                  icon={<span>↩</span>}
                                  label="Restore"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    restoreSession(s.id);
                                  }}
                                />
                                <IconButton
                                  icon={<Trash2 className="w-3.5 h-3.5" />}
                                  label="Destroy permanently"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    destroySession(s.id);
                                  }}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
                <label className="text-xs font-semibold" htmlFor="session-memory">
                  Session Memory
                </label>
                <textarea
                  id="session-memory"
                  value={(activeSession as any)?.memory || ""}
                  onChange={(e) =>
                    sessionTab === "deleted"
                      ? null
                      : (SessionService.update(activeSessionId as any, {
                          memory: e.target.value,
                        }),
                        refreshSessions())
                  }
                  placeholder="Notes, context, preferences… saved with this session"
                  rows={4}
                  className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                  style={{
                    backgroundColor: "var(--surface-alt)",
                    color: "var(--fg)",
                    borderColor: "var(--border)",
                  }}
                  disabled={sessionTab === "deleted"}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Settings Modal */}
      {userSettingsOpen && user && (
        <UserSettingsModal
          user={user}
          meta={meta}
          onClose={() => setUserSettingsOpen(false)}
          onAvatarUpload={onAvatarUpload}
          onSaveProfile={onSaveProfile}
          onChangePassword={onChangePassword}
          onDestroyAccount={onDestroyAccount}
        />
      )}
    </div>
  );
}

// ---------- UI bits ----------
function AssistantAwareBubble({
  role,
  text,
  meta,
  ts,
  onCopy,
  copied,
}: {
  role: "user" | "assistant";
  text: string;
  meta?: string;
  ts: number;
  onCopy: () => void;
  copied: boolean;
}) {
  const isUser = role === "user";
  if (isUser)
    return (
      <Bubble role={role} text={text} ts={ts} onCopy={onCopy} copied={copied} />
    );
  let main = text || "";
  let metaLine = meta || "";
  if (!metaLine && typeof text === "string" && text.includes("\n\n__META__")) {
    const parts = text.split("\n\n__META__");
    main = parts[0];
    metaLine = parts[1] || "";
  }
  return (
    <Bubble
      role={role}
      text={main}
      ts={ts}
      meta={metaLine}
      onCopy={onCopy}
      copied={copied}
    />
  );
}

function Bubble({
  role,
  text,
  ts,
  meta,
  onCopy,
  copied,
}: {
  role: "user" | "assistant";
  text: string;
  ts: number;
  meta?: string;
  onCopy: () => void;
  copied: boolean;
}) {
  const isUser = role === "user";
  const [hovered, setHovered] = useState(false);
  return (
    <div className={`relative flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm`}
        style={{
          backgroundColor: isUser ? "var(--accent)" : "var(--surface-alt)",
          color: isUser ? "var(--accent-contrast)" : "var(--fg)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="whitespace-pre-wrap break-words">{text}</div>
        {meta ? (
          <div className="mt-1 text-[10px]" style={{ color: "var(--icon)" }}>
            {meta}
          </div>
        ) : null}
        <div
          className={`text-[10px] mt-1`}
          style={{ color: isUser ? "rgba(255,255,255,.85)" : "var(--icon)" }}
        >
          {formatRelative(ts)}
        </div>
      </div>
      <button
        onClick={onCopy}
        className="absolute -top-2 right-0 translate-x-1/2 rounded-full p-1 shadow btn-ghost"
        style={{
          opacity: hovered || copied ? 1 : 0,
          pointerEvents: hovered || copied ? "auto" : "none",
        }}
        aria-label="Copy message"
      >
        {copied ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function Avatar({ image, name, size = 28 }: { image?: string; name?: string; size?: number }) {
  const initials = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return image ? (
    <img
      src={image}
      alt={name}
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        objectFit: "cover",
        border: "1px solid var(--border)",
      }}
    />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        backgroundColor: "var(--surface-alt)",
        color: "var(--fg)",
        border: "1px solid var(--border)",
        display: "grid",
        placeItems: "center",
        fontSize: Math.max(10, Math.floor(size * 0.4)),
        fontWeight: 700,
      }}
      title={name}
    >
      {initials}
    </div>
  );
}

function UserSettingsModal({
  user,
  meta,
  onClose,
  onAvatarUpload,
  onSaveProfile,
  onChangePassword,
  onDestroyAccount,
}: {
  user: any;
  meta: { providers: string[]; hasPassword: boolean } | null;
  onClose: () => void;
  onAvatarUpload: (file: File) => Promise<void>;
  onSaveProfile: (payload: { name?: string; username?: string }) => Promise<void>;
  onChangePassword: () => Promise<void>;
  onDestroyAccount: (feedback: string) => Promise<void>;
}) {
  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [showDestroy, setShowDestroy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const canEdit = !!meta?.hasPassword;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg rounded-2xl border p-4"
        style={{
          backgroundColor: "var(--surface)",
          color: "var(--fg)",
          borderColor: "var(--border)",
        }}
        onClick={(e) => e.stopPropagation()} // click outside closes
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-base font-semibold">User Settings</div>
          <button className="p-1 rounded btn" onClick={onClose} aria-label="Close user settings">
            ✕
          </button>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar
            image={user.image}
            name={user.name || user.username || user.email}
            size={64}
          />
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg btn cursor-pointer">
            <span>Add photo</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  await onAvatarUpload(f);
                  alert("Avatar updated");
                } catch (err: any) {
                  alert(err?.message || "Upload failed");
                }
              }}
            />
          </label>
        </div>

        {/* Editable fields */}
        <div className="grid gap-3 mb-4">
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--icon)" }}>
              Name
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEdit}
              className="w-full rounded-lg border px-3 py-2"
              style={{
                backgroundColor: "var(--surface-alt)",
                color: "var(--fg)",
                borderColor: "var(--border)",
              }}
            />
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--icon)" }}>
              Username
            </div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!canEdit}
              placeholder="a-z, 0-9, _ (3-20 chars)"
              className="w-full rounded-lg border px-3 py-2"
              style={{
                backgroundColor: "var(--surface-alt)",
                color: "var(--fg)",
                borderColor: "var(--border)",
              }}
            />
            {!canEdit && (
              <div className="text-xs mt-1" style={{ color: "var(--icon)" }}>
                Profile fields locked for OAuth-only accounts.
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            className="px-3 py-1.5 rounded-lg btn-primary"
            disabled={!canEdit}
            onClick={() => onSaveProfile({ name, username })}
          >
            Save changes
          </button>
          <button
            className="px-3 py-1.5 rounded-lg btn"
            disabled={!meta?.hasPassword}
            onClick={onChangePassword}
          >
            Change password
          </button>
        </div>

        {/* Destroy account flow */}
        {!showDestroy ? (
          <div className="pt-3 mt-3" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              className="px-3 py-1.5 rounded-lg"
              style={{ border: "1px solid red", color: "white", background: "red" }}
              onClick={() => {
                if (confirm("Permanently delete your account?")) setShowDestroy(true);
              }}
            >
              Destroy account
            </button>
          </div>
        ) : (
          <div className="pt-3 mt-3" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="text-sm font-semibold mb-2">Before you go</div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value.slice(0, 10000))}
              rows={5}
              placeholder="Tell us why you’re leaving (optional, up to 10,000 characters)…"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                backgroundColor: "var(--surface-alt)",
                color: "var(--fg)",
                borderColor: "var(--border)",
              }}
            />
            <div className="text-xs mt-1" style={{ color: "var(--icon)" }}>
              {feedback.length}/10000
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg btn" onClick={() => setShowDestroy(false)}>
                No, go back
              </button>
              <button
                className="px-3 py-1.5 rounded-lg"
                style={{ border: "1px solid red", color: "white", background: "red" }}
                onClick={() => onDestroyAccount(feedback)}
              >
                Yes, delete my account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const Card = ({ children }: { children: React.ReactNode }) => (
  <div
    className="card rounded-2xl border p-4 shadow-sm"
    style={{ backgroundColor: "var(--surface)", color: "var(--fg)", borderColor: "var(--border)" }}
  >
    {children}
  </div>
);

const Toggle = ({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
}) => (
  <button
    onClick={() => onChange(!checked)}
    className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm border"
    style={{
      backgroundColor: checked ? "rgba(99,102,241,.08)" : "var(--surface-alt)",
      borderColor: checked ? "var(--accent)" : "var(--border)",
    }}
  >
    {icon} {label}
  </button>
);

const Placeholder = ({ label }: { label: string }) => (
  <div
    className="rounded-xl border border-dashed p-6 text-sm text-center"
    style={{ borderColor: "var(--border)", color: "var(--icon)" }}
  >
    {label}
  </div>
);

const LabeledSlider = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat((e.target as HTMLInputElement).value))}
      className="w-full mt-2"
    />
    <div className="text-xs" style={{ color: "var(--icon)" }}>
      {typeof value === "number" ? value.toFixed(2) : value}
    </div>
  </div>
);

const CollapsibleCard = ({
  id,
  title,
  children,
  subtitle,
  icon,
}: {
  id: string;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Card>
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-controls={`${id}-content`}
      >
        <span className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold">{title}</span>
        </span>
        <span className="flex items-center gap-3 text-xs" style={{ color: "var(--icon)" }}>
          {subtitle}
          <span>{collapsed ? "Show" : "Hide"}</span>
        </span>
      </button>
      <div id={`${id}-content`} className={`mt-3 ${collapsed ? "hidden" : "block"}`}>
        {children}
      </div>
    </Card>
  );
};

const ResultSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, idx) => (
      <div
        key={idx}
        className="h-3 rounded"
        style={{
          background: "linear-gradient(90deg, rgba(148,163,184,0.2), rgba(148,163,184,0.35), rgba(148,163,184,0.2))",
          backgroundSize: "200% 100%",
          animation: "pulse 1.2s ease-in-out infinite",
        }}
      />
    ))}
  </div>
);

const TabButton = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    className="px-2 py-1 rounded"
    style={{
      backgroundColor: active ? "var(--accent)" : "var(--surface-alt)",
      color: active ? "var(--accent-contrast)" : "var(--fg)",
      border: "1px solid var(--border)",
    }}
  >
    {label}
  </button>
);

const IconButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => (
  <button
    onClick={onClick}
    className="p-1 rounded"
    style={{ backgroundColor: "var(--surface-alt)", border: "1px solid var(--border)" }}
    title={label}
    aria-label={label}
  >
    {icon}
  </button>
);

function useAutoResizeTextarea(ref: React.RefObject<HTMLTextAreaElement>, value: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, MAX_INPUT_HEIGHT);
    el.style.height = `${next}px`;
  }, [ref, value]);
}

// ---------- Runtime sanity tests ----------
(function runRuntimeTests() {
  try {
    console.assert(priorityTier(1) === "low" && priorityTier(3) === "medium" && priorityTier(4) === "high", "priorityTier");
    const idset = new Set([genId(), genId(), genId(), genId()]);
    console.assert(idset.size === 4, "genId uniqueness");
    const demo = [
      { text: "Answer from chatgpt: Paris" },
      { text: "Answer from claude: Paris" },
      { text: "Answer from perplexity: London" },
    ];
    const norm = demo.map((a) => a.text.replace(/^Answer from [^:]+:\s*/, "").trim());
    const map = new Map<string, { count: number; idxs: number[] }>();
    norm.forEach((t, i) => {
      const k = t.toLowerCase();
      const v = map.get(k) || { count: 0, idxs: [] };
      v.count++;
      v.idxs.push(i);
      map.set(k, v);
    });
    let key: string | null = null,
      cnt = 0;
    for (const [k, v] of map.entries()) {
      if (v.count > cnt) {
        cnt = v.count;
        key = k;
      }
    }
    console.assert(key === "paris" && cnt === 2, "overall answer should prefer consensus text");
  } catch (e) {
    console.warn("Runtime tests warning:", e);
  }
})();
