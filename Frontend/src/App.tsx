import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import Chat from "./components/Chat";
import StatusPage from "./pages/StatusPage";
import AdminPage from "./pages/AdminPage";
import WebhooksPage from "./pages/WebhooksPage";
import AuditPage from "./pages/AuditPage";
import SettingsModal from "./components/SettingsModal";
import { initTheme } from "./state/session";

type HeaderProps = { onSettings: () => void };

function Header({ onSettings }: HeaderProps) {
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        Nexus.ai
      </Link>
      <nav>
        <NavLink to="/" end>
          Chat
        </NavLink>
        <NavLink to="/status">Status</NavLink>
        <NavLink to="/admin">Admin</NavLink>
        <NavLink to="/webhooks">Webhooks</NavLink>
        <NavLink to="/audit">Audit</NavLink>
      </nav>
      <button aria-label="Settings" className="icon-btn" onClick={onSettings}>
        ⚙️
      </button>
    </header>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <BrowserRouter>
      <Header onSettings={() => setOpen(true)} />
      <main className="container">
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/webhooks" element={<WebhooksPage />} />
          <Route path="/audit" element={<AuditPage />} />
        </Routes>
      </main>
      <footer className="footer">Secured by Nexus</footer>
      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </BrowserRouter>
  );
}
