// src/components/Sidebar.tsx (or wherever this lives)
import { type ReactNode, useMemo, useState, useCallback, useEffect } from "react";
import { NavLink, Link } from "react-router-dom"; // ⬅️ added Link
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
  // …(state code unchanged)

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

  return (
    <>
      <aside
        className={`flex h-full flex-col justify-between ${
          variant === "desktop" ? "w-64 border-r border-app" : "w-full"
        } bg-panel px-4 pb-6 pt-6 text-ink shadow-2xl backdrop-blur`}
      >
        {/* ── Top column: brand + nav ───────────────────────────── */}
        <div>
          {/* Brand / Logo */}
          <Link
            to="/"
            onClick={onNavigate}
            aria-label="Go to Home"
            className="mb-6 inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
          >
            {/* Dark mode: regular logo */}
            <img
              src="/nexus-logo.png"
              alt="Nexus"
              className="hidden h-9 w-auto dark:block"
              draggable={false}
            />
            {/* Light mode: inverted logo */}
            <img
              src="/nexus-logo-inverted.png"
              alt=""
              aria-hidden="true"
              className="block h-9 w-auto dark:hidden"
              draggable={false}
            />
          </Link>

          {/* Primary nav */}
          <nav aria-label="Primary">
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
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
                          <span aria-hidden="true" className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-trustBlue" />
                        ) : null}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* ── Bottom column: CTA + beta note (unchanged) ───────── */}
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
              Explore Nexus.ai with unrestricted debates. Your feedback helps orchestrate trustworthy AI debates and chats. This is a first of its kind AI engine so we need your help!
              Nexus is experimental—errors can happen but we want to make sure we built a program worth your time and effort. During this period Nexus is completely free; sharing feedback helps us launch a better experience for you. Thank you!
            </p>
          </div>
        </div>
      </aside>

      {/* Feedback Modal (unchanged) */}
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
            {/* …modal content unchanged… */}
          </div>
        </div>
      ) : null}
    </>
  );
}
