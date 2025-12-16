import { MessageSquare, Layout, Brain, Sparkles, Zap, Send, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function HomePage() {
  const navigate = useNavigate();
  const [quickPrompt, setQuickPrompt] = useState("");

  const handleQuickPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPrompt.trim()) {
      navigate("/toron");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      className="flex min-h-full flex-col items-center py-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex w-full max-w-5xl flex-col items-center gap-14">
        {/* Hero Section */}
        <motion.header className="flex max-w-3xl flex-col items-center space-y-4 text-center" variants={itemVariants}>
          <span className="rounded-full bg-[var(--pill)] px-4 py-1.5 text-xs font-medium text-[var(--accent)]">Welcome to Ryuzen</span>
          <h1 className="bg-gradient-to-r from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)] bg-clip-text text-4xl font-semibold text-transparent md:text-5xl">
            Your AI-Powered Workspace
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--text-muted)]">
            Start in Toron to chat with AI, organize your projects in Workspace, or let ALOE enhance your workflow with intelligent automation.
          </p>
        </motion.header>

        {/* Feature Cards */}
        <motion.div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-3" variants={itemVariants}>
          {/* Toron Card */}
          <motion.button
            onClick={() => navigate("/toron")}
            className="group relative rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-8 text-left transition-all duration-200 hover:border-[var(--accent)]"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="space-y-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--pill)] text-[var(--accent)]">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--text-strong)]">Toron</h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                  Conversational AI assistant for deep, focused discussions and problem-solving.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                <span>Start chatting</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </motion.button>

          {/* Workspace Card */}
          <motion.button
            onClick={() => navigate("/workspace")}
            className="group relative rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-8 text-left transition-all duration-200 hover:border-[var(--accent)]"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="space-y-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--pill)] text-[var(--accent)]">
                <Layout className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--text-strong)]">Workspace</h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                  Organize projects, documents, and templates in one centralized hub.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                <span>Open workspace</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </motion.button>

          {/* ALOE Card */}
          <motion.button
            className="group relative rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-8 text-left transition-all duration-200 hover:border-[var(--accent)]"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="space-y-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--pill)] text-[var(--accent)]">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--text-strong)]">ALOE</h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                  Autonomous Learning & Optimization Engine for intelligent workflow automation.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                <span>Coming soon</span>
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Quick Prompt Section */}
        <motion.div className="w-full max-w-3xl space-y-4" variants={itemVariants}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[var(--text-strong)]">Quick Start</h2>
            <motion.div
              className="h-px flex-1 bg-[var(--line-subtle)]"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
          </div>

          <motion.form
            onSubmit={handleQuickPrompt}
            className="rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-6 transition-all duration-200 hover:border-[var(--accent)]"
            whileHover={{ scale: 1.005 }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--pill)] text-[var(--accent)]">
                  <Zap className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="Ask anything... (routes to Toron)"
                  className="flex-1 bg-transparent text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                />
                <motion.button
                  type="submit"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition-all duration-150 disabled:opacity-50"
                  whileHover={{ scale: quickPrompt.trim() ? 1.05 : 1 }}
                  whileTap={{ scale: quickPrompt.trim() ? 0.95 : 1 }}
                  disabled={!quickPrompt.trim()}
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Press Enter or click send to start a conversation in Toron
              </p>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </motion.section>
  );
}
