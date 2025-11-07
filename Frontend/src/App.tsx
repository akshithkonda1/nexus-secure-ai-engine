import { Routes, Route, NavLink } from "react-router-dom";
import Sidebar from "./components/Sidebar";

function Page({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-gray-400">
          Replace this placeholder with your real {title} view.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-40 border-b"
        style={{ backgroundColor: "rgba(22,27,34,0.9)", borderColor: "var(--nexus-border)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg border"
            style={{ backgroundColor: "rgba(37,99,235,0.20)", borderColor: "rgba(255,255,255,0.08)" }}
          />
          <NavLink to="/" className="text-lg font-semibold">
            Nexus <span className="text-xs text-gray-400 align-top">BETA</span>
          </NavLink>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <input
            placeholder="Search"
            className="h-9 px-3 rounded-lg border text-sm"
            style={{ backgroundColor: "var(--nexus-surface)", color: "var(--nexus-text)", borderColor: "rgba(255,255,255,0.08)" }}
          />
          <button>Join Waitlist</button>
        </div>
      </header>

      {/* Shell */}
      <div className="pt-14 flex">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100dvh-3.5rem)] p-4 md:p-6 ml-64">
          <Routes>
            <Route path="/" element={<Page title="Home" />} />
            <Route path="/chat" element={<Page title="Chat" />} />
            <Route path="/sessions" element={<Page title="Sessions" />} />
            <Route path="/templates" element={<Page title="Templates" />} />
            <Route path="/documents" element={<Page title="Documents" />} />
            <Route path="/analytics" element={<Page title="Analytics" />} />
            <Route path="/history" element={<Page title="History" />} />
            <Route path="/settings" element={<Page title="Settings" />} />
            <Route path="*" element={<Page title="Not Found" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
