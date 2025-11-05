// Frontend/src/App.tsx
import { Component, type ReactNode, Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";

const HomePage = lazy(() => import("@/pages/Home"));
const ChatPage = lazy(() => import("@/pages/Chat"));
const SessionsPage = lazy(() => import("@/pages/SessionsPage"));
const TemplatesPage = lazy(() => import("@/pages/TemplatesPage"));
const DocumentsPage = lazy(() => import("@/pages/DocumentsPage"));
const TelemetryPage = lazy(() => import("@/pages/TelemetryPage"));
const HistoryPage = lazy(() => import("@/pages/HistoryPage"));
const SettingsPage = lazy(() => import("@/pages/Settings"));

const queryClient = new QueryClient();

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
      console.error("App error boundary caught", { error, info });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-app px-6 text-center text-muted">
          <h1 className="text-3xl font-semibold text-ink">Something went wrong</h1>
          <p className="mt-4 max-w-md text-sm text-muted">
            We encountered an unexpected error. Refresh the page to continue exploring Nexus.ai.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-trustBlue px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:id" element={<ChatPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="telemetry" element={<TelemetryPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Route>
      <Route
        path="/not-found"
        element={
          <div className="flex min-h-screen flex-col items-center justify-center bg-app px-6 text-center text-muted">
            <div className="max-w-md rounded-3xl border border-app bg-panel p-8 shadow-2xl">
              <h1 className="text-3xl font-semibold text-ink">Page not found</h1>
              <p className="mt-4 text-sm text-muted">
                The route you requested isn’t available yet. Return to the dashboard to keep exploring.
              </p>
              <a
                href="/"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-trustBlue px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
              >
                Go home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Suspense
            fallback={
              <div
                className="flex min-h-screen items-center justify-center bg-app text-muted"
                role="status"
                aria-live="polite"
              >
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-app/40 border-t-trustBlue" />
                <span className="sr-only">Loading Nexus.ai</span>
              </div>
            }
          >
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
