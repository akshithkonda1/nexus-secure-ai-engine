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
  // —————————————————————————————————
  // Logo paths (work in dev/prod even with custom base)
  // —————————————————————————————————
  const PUBLIC_BASE = import.meta.env.BASE_URL || "/";
  const LOGO_DARK = `${PUBLIC_BASE}assets/nexus-logo.png`;
  const LOGO_LIGHT = `${PUBLIC_BASE}assets/nexus-logo-inverted.png`;

  // —————————————————————————————————
  // Feedback modal state
  // —————————————————————————————————
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const remaining = FEEDBACK_MAX - feedbackText.length;

  // Lock page scroll when modal is open (nice on mobile)
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

      // Persist locally (easy to swap to API later)
      const bucketKey = "nexusUserFeedback";
      const existing = (() => {
        try {
          const parsed = JSON.parse(localStorage.getItem(bucketKey) || "[]");
          return Array.isArray(parsed)
            ? parsed.filter(isFeedbackRecord)
            : [];
        } catch {
          // TODO: recover from malformed stored feedback
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

  // —————————————————————————————————
  // Primary nav items
  // —————————————————————————————————
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

  // —————————————————————————————————
  // UI
  // —————————————————————————————————
  return (
    <>
      <aside
        className={[
          "flex h-full flex-col bg-panel px-4 pb-6 pt-6 text-ink shadow-2xl backdrop-blur",
          variant === "desktop" ? "w-64 border-r border-app" : "w-full",
        ].join(" ")}
      >
        {/* Top: Brand + Nav */}
        <div className="flex flex-1 flex-col">
          {/* Brand / Logo (links Home) */}
          <Link
            to="/"
            onClick={onNavigate}
            aria-label="Go to Home"
            className="mb-6 inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
          >
            {/* Dark mode: regular logo */}
            <img
              src={LOGO_DARK}
              alt="Nexus"
              className="hidden h-9 w-auto select-none dark:block"
              draggable={false}
            />
            {/* Light mode: inverted logo */}
            <img
              src={LOGO_LIGHT}
              alt="Nexus"
              className="block h-9 w-auto select-none dark:hidden"
              draggable={false}
            />
          </Link>

          <nav aria-label="Primary">
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      [
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg",
                        isActive
                          ? "border border-trustBlue/60 bg-trustBlue/10 text-ink shadow-lg"
                          : "text-muted hover:scale-105 hover:bg-panel hover:text-ink",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={[
                            "flex h-8 w-8 items-center justify-center rounded-full",
                            isActive ? "bg-trustBlue/20 text-trustBlue" : "bg-panel text-trustBlue",
                          ].join(" ")}
                        >
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {isActive ? (
                          <span aria-hidden="true" className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-trustBlue" />
                        ) : null}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="px-3 pb-4 border-t border-border/40 mt-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Bottom: Feedback CTA + Beta note */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={openFeedback}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-trustBlue/90 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-trustBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
            aria-haspopup="dialog"
            aria-controls="feedback-modal"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            Send Feedback
          </button>

          <div className="rounded-xl bg-gradient-to-br from-app-text/10 via-app-text/5 to-transparent p-4 text-xs text-muted">
            <p className="font-semibold text-ink">Production Beta</p>
            <p className="mt-1 leading-relaxed">
              Explore Nexus.ai with unrestricted debates. Your chats are not monitored but your feedback is highly apreciated. Your feedback helps orchestrate more trustworthy AI debates and
              chats. Nexus is experimental—errors can happen—but we’re building something worthy of your time. During
              this period, Nexus is free; sharing feedback helps us launch a better experience for everyone. Thank you!
            </p>
          </div>
        </div>
      </aside>

      {/* Feedback Modal */}
      {isFeedbackOpen ? (
        <div
          id="feedback-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
          aria-describedby="feedback-desc"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-app-text/70 p-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") closeFeedback();
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl border border-app bg-panel p-4 text-ink shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="feedback-title" className="text-lg font-semibold text-ink">
                  User Feedback
                </h2>
                <p id="feedback-desc" className="mt-1 text-sm text-muted">
                  Share anything that will help us improve. Max {FEEDBACK_MAX.toLocaleString()} characters.
                </p>
              </div>
              <button
                type="button"
                onClick={closeFeedback}
                className="rounded-lg p-1 text-muted transition hover:bg-panel hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
                aria-label="Close feedback form"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={onSubmitFeedback} className="mt-4 space-y-3">
              <div>
                <label htmlFor="feedback-text" className="sr-only">
                  Feedback
                </label>
                <textarea
                  id="feedback-text"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value.slice(0, FEEDBACK_MAX))}
                  maxLength={FEEDBACK_MAX}
                  className="min-h-48 w-full resize-y rounded-xl border border-app bg-panel p-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-trustBlue/70"
                  placeholder="Tell us what worked well, what didn’t, and what you’d love to see next."
                  aria-describedby="char-remaining"
                />
                <div id="char-remaining" className="mt-1 text-right text-xs text-muted">
                  {remaining.toLocaleString()} characters remaining
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeFeedback}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !feedbackText.trim()}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg",
                    submitting || !feedbackText.trim()
                      ? "cursor-not-allowed bg-trustBlue/40"
                      : "bg-trustBlue hover:bg-trustBlue/90",
                  ].join(" ")}
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Submit Feedback
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
