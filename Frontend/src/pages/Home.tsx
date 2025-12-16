import { Layout, Image, Code, FileText, Paperclip, Mic, Globe, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function HomePage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const handlePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate("/toron", { state: { initialPrompt: prompt } });
    }
  };

  const cards = [
    { label: "Write copy", icon: FileText, color: "bg-yellow-100 text-yellow-600", to: "/toron" },
    { label: "Image generation", icon: Image, color: "bg-blue-100 text-blue-600", to: "/toron" },
    { label: "Create avatar", icon: Layout, color: "bg-green-100 text-green-600", to: "/workspace" },
    { label: "Write code", icon: Code, color: "bg-pink-100 text-pink-600", to: "/toron" },
  ];

  return (
    <div className="flex h-full flex-col font-sans">
      {/* Center Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-10 pb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-center"
        >
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-strong)]">Welcome to Ryuzen</h1>
          <p className="mx-auto max-w-lg text-[var(--text-muted)]">
            Get started by giving Ryuzen a task and Chat can do the rest. Not sure where to start?
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-2"
        >
          {cards.map((card) => (
            <button
              key={card.label}
              onClick={() => navigate(card.to)}
              className="group flex items-center justify-between rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-base)] p-4 transition-all hover:border-[var(--accent)] hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <span className="font-medium text-[var(--text-strong)]">{card.label}</span>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--layer-muted)] opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowUp className="h-4 w-4 rotate-45" />
              </span>
            </button>
          ))}
        </motion.div>
      </div>

      {/* Bottom Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-auto w-full max-w-4xl shrink-0"
      >
        <form 
          onSubmit={handlePrompt}
          className="relative rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-base)] p-4 shadow-sm transition-all focus-within:ring-1 focus-within:ring-[var(--accent)]"
        >
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Summarize the latest..."
            className="mb-10 w-full bg-transparent text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button type="button" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--layer-muted)] hover:text-[var(--text-primary)]">
                <Paperclip className="h-4 w-4" />
                <span>Attach</span>
              </button>
              <button type="button" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--layer-muted)] hover:text-[var(--text-primary)]">
                <Mic className="h-4 w-4" />
                <span>Voice Message</span>
              </button>
              <button type="button" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--layer-muted)] hover:text-[var(--text-primary)]">
                <Globe className="h-4 w-4" />
                <span>Browse Prompts</span>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-muted)]">{prompt.length} / 3,000</span>
              <button 
                type="submit"
                disabled={!prompt.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-white transition-all disabled:opacity-50"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </form>
        <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
          Ryuzen may generate inaccurate information about people, places, or facts. Model: Ryuzen AI v1.3
        </p>
      </motion.div>
    </div>
  );
}
