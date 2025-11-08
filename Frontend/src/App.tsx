import { useMemo } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Home } from "./pages/Home";
import { Chat } from "./pages/Chat";
import { Settings } from "./pages/Settings";

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = useMemo(() => location.pathname || "/home", [location.pathname]);

  return (
    <>
      <Header />
      <Sidebar active={active} onNavigate={(p) => navigate(p)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        {/* stubs for nav items so buttons don’t break */}
        <Route path="/sessions" element={<Home />} />
        <Route path="/templates" element={<Home />} />
        <Route path="/docs" element={<Home />} />
        <Route path="/metrics" element={<Home />} />
        <Route path="/history" element={<Home />} />
      </Routes>
    </>
  );
}

export default function App() {
  // BrowserRouter lives here to keep Shell clean
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
