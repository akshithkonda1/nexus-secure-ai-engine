import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Home } from "@/pages/Home";
import { Chat } from "@/pages/Chat";
import { Settings } from "@/pages/Settings";

function Shell() {
  return (
    <>
      <Header />
      <Sidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        {/* stubs to keep nav alive */}
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
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
