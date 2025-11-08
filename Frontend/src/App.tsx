import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@/theme/useTheme';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Home } from '@/pages/Home';
import { Chat } from '@/pages/Chat';
import { Settings } from '@/pages/Settings';

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = useMemo(() => location.pathname || '/home', [location.pathname]);

  return (
    <>
      <Header />
      <Sidebar active={active} onNavigate={(p) => navigate(p)} />
      <main className="pt-16 pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            {/* stubs to keep buttons non-breaking */}
            <Route path="/sessions" element={<Home />} />
            <Route path="/templates" element={<Home />} />
            <Route path="/docs" element={<Home />} />
            <Route path="/metrics" element={<Home />} />
            <Route path="/history" element={<Home />} />
          </Routes>
        </div>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Shell />
      </ThemeProvider>
    </BrowserRouter>
  );
}
