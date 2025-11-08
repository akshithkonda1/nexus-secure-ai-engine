import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Home } from "@/pages/Home";
import { Chat } from "@/pages/Chat";
import { Settings } from "@/pages/Settings";
import { Sessions } from "@/pages/Sessions";
import { SessionConsole } from "@/pages/SessionConsole";
import { Templates } from "@/pages/Templates";
import { Documents } from "@/pages/Documents";
import { Metrics } from "@/pages/Metrics";
import { History } from "@/pages/History";
import { ThemeProvider } from "@/theme/useTheme";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[var(--nexus-bg)] text-[var(--nexus-text)]">
          <Header />
          <Sidebar />
          <main className="pt-16 pl-16 md:pl-20">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />

              <Route path="/sessions" element={<Sessions />} />
              <Route path="/sessions/:id" element={<SessionConsole />} />

              <Route path="/templates" element={<Templates />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/docs" element={<Navigate to="/documents" replace />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/history" element={<History />} />

              <Route path="/console" element={<Navigate to="/sessions" replace />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
