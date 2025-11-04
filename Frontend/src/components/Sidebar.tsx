import { type ReactNode, useMemo, useState, useCallback, useEffect } from "react";
import { NavLink } from "react-router-dom";
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

const navIconClasses = "h-5 w-5";

type SidebarProps = {
  onNavigate?: () => void;
  variant: "desktop" | "mobile";
};

type NavItem = {
  label: string;
  to: string;
  icon: ReactNode;
};

const FEEDBACK_MAX = 20000;

export function Sidebar({ onNavigate, variant }: SidebarProps) {
  // Feedback modal state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const remaining = FEEDBACK_MAX - feedbackText.length;

  // Lock page scroll when modal open (nice for mobile)
  useEffect(() => {
    if (isFeedbackOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isFeedbackOpen]);

  const openFeedback = useCallback(() => setIsFeedbackOpen(true), []);
  const closeFeedback = useCallback(() => {
    setIsFeedbackOpen(false);
    setSubmitting(false);
  }, []);

  const onSubmitFeedback = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!feedbackText.trim() || feedbackText.length > FEEDBACK_MAX) return;

      setSubmitting(true);

      // Persist to localStorage as a stub (easy to swap for API later)
      const bucketKey = "nexusUserFeedback";
      const existing = (() => {
        try {
          return JSON.parse(localStorage.getItem(bucketKey) || "[]");
        } catch {
          return [];
        }
      })();

      const record = {
        id: crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        text: feedbackText.trim(),
        createdAt: new Date().toISOString(),
        source: "Sidebar",
        variant,
      };

      try {
        localStorage.setItem(bucketKey, JSON.stringify([record, ...existing]));
      } catch {
        // Swallow storage errors (quota, etc.)
      }

      // Simple UX: reset and close
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
      { label: "Sessions", to: "/projects", icon: <Folder className={navIconClasses} aria-hidden="true" /> },
      { label: "Templates", to: "/templates", icon: <Sparkles className={navIconClasses} aria-hidden="true" /> },
      { label: "Documents", to: "/documents", icon: <FileText className={navIconClasses} aria-hidden="true" /> },
      { label: "Telemetry", to: "/telemetry", icon: <BarChart3 className={navIconClasses} aria-hidden="true" /> },
      { label: "History", to: "/history", icon: <History className={navIconClasses} aria-hidden="true" /> },
      { label: "Settings", to: "/settings", icon: <SettingsIcon className={navIconClasses} aria-hidden="true" /> },
    ],
    [],
  );

  return (
    <>
      <aside
        className={`flex h-full flex-col justify-between ${
          variant === "desktop" ? "w-64 border-r border-app" : "w-full"
        } bg-panel px-4 pb-6 pt-8 text-ink shadow-2xl backdrop-blur`}
      >
        <nav aria-label="Primary">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "border border-trustBlue/60 bg-trustBlue/10 text-ink shadow-lg"
                        : "text-muted hover:scale-105 hover:bg-panel hover:text-ink"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg`
                  }
                  onClick={onNavigate}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          isActive ? "bg-trustBlue/20 text-trustBlue" : "bg-panel text-trustBlue"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-trustBlue"
                        />
                      ) : null}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

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
              Explore Nexus.ai with unrestricted debates. Your feedback helps orchestrate trustworthy AI debates and chats. This is the first 
              Nexus is experimental—errors can happen. During this period Nexus is free to use; sharing feedback helps
              us launch a better experience for you. Enjoy Nexus.
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
                  onChange={(e) => {
                    const next = e.target.value.slice(0, FEEDBACK_MAX);
                    setFeedbackText(next);
                  }}
                  maxLength={FEEDBACK_MAX}
                  className="min-h-48 w-full resize-y rounded-xl border border-app bg-panel p-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-trustBlue/70"
                  placeholder="Tell us what worked well, what didn’t, and what you’d love to see next. We want to know what you think of Nexus but also what could be better."
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
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg ${
                    submitting || !feedbackText.trim()
                      ? "bg-trustBlue/40 cursor-not-allowed"
                      : "bg-trustBlue hover:bg-trustBlue/90"
                  }`}
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
