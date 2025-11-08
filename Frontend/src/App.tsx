import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { History } from './pages/History';
import { Templates } from './pages/Templates';
import { Projects } from './pages/Projects';
import { Documents } from './pages/Documents';
import { Community } from './pages/Community';
import { Settings } from './pages/Settings';

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = useMemo(() => location.pathname || '/home', [location.pathname]);

  return (
    <div className="min-h-screen grid grid-cols-[64px_1fr]">
      <Sidebar active={active} onNavigate={(p) => navigate(p)} />
      <div className="min-h-screen">
        <Header />
        <main className="px-8 pb-16 pt-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/history" element={<History />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/community" element={<Community />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <Shell />;
}
