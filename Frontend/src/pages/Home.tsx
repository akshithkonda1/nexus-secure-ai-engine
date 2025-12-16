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
      <div className="flex w-full max-w-4xl flex-col items-center gap-12">
        {/* Hero Section */}
        <motion.header className="flex max-w-3xl flex-col items-center space-y-4 text-center" variants={itemVariants}>
          <motion.div
            className="rounded-full bg-gradient-to-r from-[var(--ryuzen-dodger)]/10 to-[var(--ryuzen-purple)]/10 px-4 py-1.5"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--accent)]">Welcome to Ryuzen</p>
          </motion.div>
          <h1 className="bg-gradient-to-r from-[var(--text-strong)] to-[var(--text-primary)] bg-clip-text text-5xl font-bold text-transparent">
            Your AI-Powered Workspace
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--text-muted)]">
            Start in Toron to chat with AI, organize your projects in Workspace, or let ALOE enhance your workflow with intelligent automation.
          </p>
        </motion.header>

        {/* Feature Cards */}
        <motion.div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3" variants={itemVariants}>
          {/* Toron Card */}
          <motion.button
            onClick={() => navigate("/toron")}
            className="group relative overflow-hidden rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-6 text-left transition-all hover:border-[var(--accent)] hover:shadow-lg"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--ryuzen-dodger)]/5 to-[var(--ryuzen-purple)]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ryuzen-dodger)] to-[var(--ryuzen-azure)] shadow-md">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--text-strong)]">Toron</h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                  Conversational AI assistant for deep, focused discussions and problem-solving.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                <span>Start chatting</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </motion.button>

          {/* Workspace Card */}
          <motion.button
            onClick={() => navigate("/workspace")}
            className="group relative overflow-hidden rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-6 text-left transition-all hover:border-[var(--accent)] hover:shadow-lg"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--ryuzen-azure)]/5 to-[var(--ryuzen-purple)]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ryuzen-azure)] to-[var(--ryuzen-purple)] shadow-md">
                <Layout className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--text-strong)]">Workspace</h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                  Organize projects, documents, and templates in one centralized hub.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                <span>Open workspace</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </motion.button>

          {/* ALOE Card */}
          <motion.button
            className="group relative overflow-hidden rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-6 text-left transition-all hover:border-[var(--accent)] hover:shadow-lg"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--ryuzen-purple)]/5 to-[var(--ryuzen-dodger)]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ryuzen-purple)] to-[var(--ryuzen-dodger)] shadow-md">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--text-strong)]">ALOE</h3>
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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Quick Start</h2>
            <motion.div
              className="h-px flex-1 bg-gradient-to-r from-[var(--ryuzen-dodger)]/20 to-[var(--ryuzen-purple)]/20 ml-4"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </div>

          <motion.form
            onSubmit={handleQuickPrompt}
            className="rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-6 shadow-sm transition-all hover:border-[var(--accent)] hover:shadow-md"
            whileHover={{ scale: 1.01 }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)]">
                  <Zap className="h-5 w-5 text-white" />
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
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)] text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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
