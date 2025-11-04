// Frontend/src/App.tsx
import { Component, ReactNode, Suspense, lazy } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";

// Lazily load top-level routes
const HomePage = lazy(() => import("@/pages/Home"));
const ChatPage = lazy(() => import("@/pages/Chat"));
const SettingsPage = lazy(() => import("@/pages/Settings"));

/** ---------- Error Boundary ---------- */
class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    if (import.meta.env.DEV) {
      // Keep noisy logs out of prod
      console.error("App error boundary caught", { error, info });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-silver">
          <h1 className="text-3xl font-semibold text-white">Something went wrong</h1>
          <p className="mt-4 max-w-md text-sm text-silver/70">
            We encountered an unexpected error. Refresh the page to continue
            exploring Nexus.ai.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-trustBlue px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/** ---------- Small helpers / placeholders ---------- */
function Placeholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/70 p-12 text-center text-silver shadow-2xl">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-4 text-sm text-silver/70">{description}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-trustBlue">
        Coming soon
      </p>
    </div>
  );
}

function NotFoundScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-silver">
      <div className="max-w-md rounded-3xl border border-white/10 bg-black/80 p-8 shadow-2xl">
        <h1 className="text-3xl font-semibold text-white">Page not found</h1>
        <p className="mt-4 text-sm text-silver/70">
          The route you requested isn’t available yet. Return to the dashboard
          to keep exploring.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-trustBlue px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

/** ---------- Route tree ---------- */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="chat" element={<ChatPage />} />

        {/* Stubs you can replace with real pages later */}
        <Route
          path="projects"
          element={
            <Placeholder
              title="Sessions"
              description="Review and resume ongoing Nexus.ai sessions."
            />
          }
        />
        <Route
          path="templates"
          element={
            <Placeholder
              title="Templates"
              description="Launch curated compliance and QA templates to accelerate debates."
            />
          }
        />
        <Route
          path="documents"
          element={
            <Placeholder
              title="Documents"
              description="Attach, audit, and govern sensitive documents."
            />
          }
        />
        <Route
          path="telemetry"
          element={
            <Placeholder
              title="Telemetry"
              description="Explore debate metrics, guardrail performance, and anomalies."
            />
          }
        />
        <Route
          path="history"
          element={
            <Placeholder
              title="History"
              description="Browse every debate transcript with consensus scoring."
            />
          }
        />

        <Route path="settings" element={<SettingsPage />} />

        {/* Unknown children under the Layout -> bounce to not-found */}
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Route>

      {/* Standalone not-found route (outside the shell) */}
      <Route path="/not-found" element={<NotFoundScreen />} />
    </Routes>
  );
}

/** ---------- App root ---------- */
export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense
          fallback={
            <div
              className="flex min-h-screen items-center justify-center bg-black text-silver"
              role="status"
              aria-live="polite"
            >
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-trustBlue" />
              <span className="sr-only">Loading Nexus.ai</span>
            </div>
          }
        >
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
