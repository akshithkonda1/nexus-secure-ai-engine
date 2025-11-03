import { Component, ReactNode, Suspense, lazy, useMemo, useState } from "react";
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const ChatPage = lazy(() => import("@/pages/Chat"));
const SettingsPage = lazy(() => import("@/pages/Settings"));

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    if (import.meta.env.DEV) {
      console.error("App error boundary caught", { error, info });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-100">
          <h1 className="text-3xl font-semibold">Something went wrong</h1>
          <p className="mt-3 max-w-md text-sm text-slate-400">
            We encountered an unexpected error. Reload the page to try again.
          </p>
          <button
            type="button"
            className="mt-6 rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus-visible:static focus-visible:z-50 focus-visible:m-4 focus-visible:inline-block focus-visible:rounded-md focus-visible:bg-slate-200 focus-visible:px-4 focus-visible:py-2 focus-visible:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
    >
      Skip to content
    </a>
  );
}

function Header() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = useMemo(
    () => [
      { to: "/chat", label: "Chat" },
      { to: "/settings", label: "Settings" },
    ],
    [],
  );

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/chat" className="flex items-center gap-2 text-lg font-semibold text-slate-100">
          Nexus.ai
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">Beta</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex" aria-label="Main">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  isActive ? "text-white" : ""
                }`
              }
            >
              {({ isActive }) => (
                <span className="flex items-center gap-2">
                  {link.label}
                  {isActive ? <span className="sr-only">(current)</span> : null}
                  {isActive ? (
                    <span className="absolute inset-x-0 -bottom-3 mx-auto h-0.5 w-full bg-slate-200" aria-hidden="true" />
                  ) : null}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 sm:inline-flex">
            Unlimited Beta
          </span>
          <button
            type="button"
            className="md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X className="h-6 w-6 text-slate-100" /> : <Menu className="h-6 w-6 text-slate-100" />}
          </button>
        </div>
      </div>
      <div className={`md:hidden ${open ? "block" : "hidden"}`}>
        <nav className="space-y-1 border-t border-slate-800 bg-slate-950 px-4 py-3" aria-label="Mobile main">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200 ${
                  isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`
              }
              onClick={() => setOpen(false)}
            >
              <span>{link.label}</span>
              {location.pathname === link.to ? <span className="text-xs uppercase tracking-wide text-slate-400">Current</span> : null}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-slate-200" />
      <span className="sr-only">Loading page…</span>
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto flex min-h-[40vh] w-full max-w-3xl flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-xl">
      <h1 className="text-2xl font-semibold text-white">Page not found</h1>
      <p className="mt-3 text-sm text-slate-300">
        The page you are looking for doesn’t exist. Return to the chat and continue exploring Nexus.ai.
      </p>
      <Link
        to="/chat"
        className="mt-6 inline-flex items-center rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
      >
        Go to chat
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppErrorBoundary>
        <SkipLink />
        <Header />
        <main id="main-content" className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-16 text-slate-100">
          <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col px-4 pt-6 sm:px-6">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}
