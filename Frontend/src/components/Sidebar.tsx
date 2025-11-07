// src/components/Sidebar.tsx
import { useMemo, useState, useCallback, useEffect, type ReactNode } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  MessageCircle,
  Folder,
  Sparkles,
  FileText,
  BarChart3,
  History,
  Settings as SettingsIcon,
  Home as HomeIcon,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

type SidebarProps = {
  onNavigate?: () => void;
  variant: "desktop" | "mobile";
};

type NavItem = {
  label: string;
  to: string;
  icon: ReactNode;
};

type FeedbackRecord = {
  id: string;
  text: string;
  createdAt: string;
  source: string;
  variant: SidebarProps["variant"];
};

const isFeedbackRecord = (value: unknown): value is FeedbackRecord => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.text === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.source === "string" &&
    typeof record.variant === "string"
  );
};

const navIconClasses = "h-5 w-5";
const FEEDBACK_MAX = 20_000;

export function Sidebar({ onNavigate, variant }: SidebarProps) {
  const PUBLIC_BASE = import.meta.env.BASE_URL || "/";
  const LOGO_DARK = `${PUBLIC_BASE}assets/nexus-logo.png`;
  const LOGO_LIGHT = `${PUBLIC_BASE}assets/nexus-logo-inverted.png`;

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const remaining = FEEDBACK_MAX - feedbackText.length;

  useEffect(() => {
    if (!isFeedbackOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isFeedbackOpen]);

  const openFeedback = useCallback(() => setIsFeedbackOpen(true), []);
  const closeFeedback = useCallback(() => {
    setIsFeedbackOpen(false);
    setSubmitting(false);
  }, []);

  const onSubmitFeedback = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = feedbackText.trim();
      if (!text || text.length > FEEDBACK_MAX) return;

      setSubmitting(true);

      const bucketKey = "nexusUserFeedback";
      const existing = (() => {
        try {
          const parsed = JSON.parse(localStorage.getItem(bucketKey) || "[]");
          return Array.isArray(parsed) ? parsed.filter(isFeedbackRecord) : [];
        } catch {
          return [];
        }
      })();

      const record: FeedbackRecord = {
        id: crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        text,
        createdAt: new Date().toISOString(),
        source: "Sidebar",
        variant,
      };

      try {
        localStorage.setItem(bucketKey, JSON.stringify([record, ...existing]));
      } catch {
        // ignore storage quota errors
      }

      setFeedbackText("");
      setSubmitting(false);
      setIsFeedbackOpen(false);
    },
    [feedbackText, variant],
  );

  const items = useMemo<NavItem[]>(
    () => [
      { label: "Home", to: "/", icon: <HomeIcon className={navIconClasses} aria-hidden="true" /> },
      { label: "Chat", to: "/chat", icon: <MessageCircle className={navIconClasses} aria-hidden="true" /> },
      { label: "Sessions", to: "/sessions", icon: <Folder className={navIconClasses} aria-hidden="true" /> },
      { label: "Templates", to: "/templates", icon: <Sparkles className={navIconClasses} aria-hidden="true" /> },
      { label: "Documents", to: "/documents", icon: <FileText className={navIconClasses} aria-hidden="true" /> },
      { label: "Telemetry", to: "/telemetry", icon: <BarChart3 className={navIconClasses} aria-hidden="true" /> },
      { label: "History", to: "/history", icon: <History className={navIconClasses} aria-hidden="true" /> },
      { label: "Settings", to: "/settings", icon: <SettingsIcon className={navIconClasses} aria-hidden="true" /> },
    ],
    [],
  );

  const asideBase =
    "flex h-full w-full flex-col bg-elevated/95 px-4 pb-6 pt-20 text-white shadow-card backdrop-blur" +
    (variant === "desktop" ? " border-r border-white/10" : "");

  return (
    <>
      <aside className={asideBase}>
        <div className="flex flex-1 flex-col">
          <Link
            to="/"
            onClick={onNavigate}
            aria-label="Go to Home"
            className="mb-8 inline-flex items-center gap-3 rounded-lg px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <img src={LOGO_DARK} alt="Nexus" className="hidden h-9 w-auto select-none dark:block" draggable={false} />
            <img src={LOGO_LIGHT} alt="Nexus" className="block h-9 w-auto select-none dark:hidden" draggable={false} />
          </Link>

          <nav aria-label="Primary" className="flex-1 space-y-1">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? "bg-primary/10 text-white"
                      : "text-muted hover:bg-white/5 hover:text-white",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-lg border border-white/5",
                        isActive ? "bg-primary/20 text-primary" : "bg-surface/60 text-muted",
                      ].join(" ")}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-xl border border-white/10 bg-surface/50 p-4 text-xs text-muted">
            <p className="text-sm font-semibold text-white">Production Beta</p>
            <p className="mt-2 leading-relaxed">
              Nexus is evolving quickly. Share feedback to help us shape a trustworthy AI orchestration experience.
            </p>
            <button
              type="button"
              onClick={openFeedback}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-haspopup="dialog"
              aria-controls="feedback-modal"
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              Send Feedback
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <ThemeToggle />
        </div>
      </aside>

      {isFeedbackOpen ? (
        <div
          id="feedback-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
          aria-describedby="feedback-desc"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") closeFeedback();
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-elevated/95 p-6 text-white shadow-card backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="feedback-title" className="text-lg font-semibold text-white">
                  Share feedback
                </h2>
                <p id="feedback-desc" className="mt-1 text-sm text-muted">
                  Help us build the script-style Nexus experience. Max {FEEDBACK_MAX.toLocaleString()} characters.
                </p>
              </div>
              <button
                type="button"
                onClick={closeFeedback}
                className="rounded-lg p-1 text-muted transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close feedback form"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={onSubmitFeedback} className="mt-4 space-y-4">
              <div>
                <label htmlFor="feedback-text" className="sr-only">
                  Feedback
                </label>
                <textarea
                  id="feedback-text"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value.slice(0, FEEDBACK_MAX))}
                  maxLength={FEEDBACK_MAX}
                  className="min-h-48 w-full resize-y rounded-xl border border-white/10 bg-surface/80 p-4 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="Tell us what worked well, what didn’t, and what you’d love to see next."
                  aria-describedby="char-remaining"
                />
                <div id="char-remaining" className="mt-2 text-right text-xs text-muted">
                  {remaining.toLocaleString()} characters remaining
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeFeedback}
                  className="rounded-lg px-4 py-2 text-sm text-muted transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !feedbackText.trim()}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    submitting || !feedbackText.trim() ? "bg-primary/50" : "bg-primary hover:bg-blue-500"
                  }`}
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Sidebar;
