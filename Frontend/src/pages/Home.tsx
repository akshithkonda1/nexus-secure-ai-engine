import { Layout, Image, Code, FileText, ArrowUp, MessageSquare, Zap, Sparkles, Workflow, Database, GitBranch, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn, bg, text, border, shadow, animations } from "../utils/theme";

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
    { label: "Write copy", icon: FileText, color: "text-amber-500", to: "/toron" },
    { label: "Image generation", icon: Image, color: "text-blue-500", to: "/toron" },
    { label: "Optimize Workflow", icon: Layout, color: "text-emerald-500", to: "/workspace" },
    { label: "Write Code", icon: Code, color: "text-pink-500", to: "/toron" },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto font-sans bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div
        aria-hidden
        className="
          pointer-events-none fixed inset-0
          bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_60%)]
          dark:bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.06),transparent_60%)]
        "
      />
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center gap-12 pt-20 pb-16">
        {/* ALOE Badge */}
        <div className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2",
          "text-[length:var(--font-size-13)] font-[var(--font-weight-medium)]",
          bg.accentSubtle,
          border.subtle,
          text.accent
        )}>
          <Sparkles className="h-4 w-4" />
          Powered by ALOE Framework
        </div>

        {/* Main Heading */}
        <div className="space-y-6 text-center">
          <h1 className={cn(
            "text-[length:var(--font-size-36)] font-[var(--font-weight-semibold)]",
            "tracking-[var(--letter-spacing-tight)] leading-[var(--line-height-tight)]",
            text.primary
          )}>
            Welcome to Ryuzen
          </h1>
          <p className={cn(
            "mx-auto max-w-[500px]",
            "text-[length:var(--font-size-18)] leading-[var(--line-height-relaxed)]",
            text.secondary
          )}>
            Unleash the power of autonomous AI agents. <br />
            What shall we build together today?
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 px-6 md:px-0">
          {cards.map((card) => (
            <button
              key={card.label}
              onClick={() => navigate(card.to)}
              className={cn(
                "group relative flex flex-col items-start gap-4 rounded-xl border p-5 text-left",
                bg.surface,
                border.subtle,
                shadow.sm,
                animations.fast,
                "hover:border-[var(--border-default)] hover:shadow-md hover:scale-[1.01]"
              )}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                card.label === "Write copy" ? "bg-amber-100 dark:bg-amber-900/30" :
                card.label === "Image generation" ? "bg-blue-100 dark:bg-blue-900/30" :
                card.label === "Optimize Workflow" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                "bg-pink-100 dark:bg-pink-900/30"
              }`}>
                <card.icon className={`h-6 w-6 ${
                  card.label === "Write copy" ? "text-amber-600 dark:text-amber-400" :
                  card.label === "Image generation" ? "text-blue-600 dark:text-blue-400" :
                  card.label === "Optimize Workflow" ? "text-emerald-600 dark:text-emerald-400" :
                  "text-pink-600 dark:text-pink-400"
                }`} />
              </div>
              <div className="flex w-full items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-slate-100">{card.label}</span>
                <ArrowUp className="h-4 w-4 text-gray-400 transition-all group-hover:text-gray-600 dark:text-slate-500 dark:group-hover:text-slate-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Platform Overview Section */}
      <div className="px-6 py-16 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className={cn(
              "text-[length:var(--font-size-30)] font-[var(--font-weight-semibold)] mb-4",
              "tracking-[var(--letter-spacing-tight)]",
              text.primary
            )}>
              Three Powerful Tools, One Unified Platform
            </h2>
            <p className={cn(
              "max-w-2xl mx-auto text-[length:var(--font-size-18)] leading-[var(--line-height-relaxed)]",
              text.secondary
            )}>
              Ryuzen combines conversational AI, project management, and automation into a seamless experience
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Toron Card */}
            <button
              onClick={() => navigate("/toron")}
              className={cn(
                "group text-left rounded-xl border p-5",
                bg.surface,
                border.subtle,
                shadow.sm,
                animations.fast,
                "hover:shadow-md hover:-translate-y-1"
              )}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className={cn(
                "mb-2 text-[length:var(--font-size-20)] font-[var(--font-weight-semibold)]",
                text.primary
              )}>
                Toron AI
              </h3>
              <p className={cn(
                "mb-4 text-[length:var(--font-size-15)] leading-[var(--line-height-relaxed)]",
                text.secondary
              )}>
                Your autonomous AI assistant. Have natural conversations, get intelligent responses, and let AI handle complex tasks.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                Try Toron
                <ArrowUp className="h-4 w-4 rotate-45 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            {/* Workspace Card */}
            <button
              onClick={() => navigate("/workspace")}
              className={cn(
                "group text-left rounded-xl border p-5",
                bg.surface,
                border.subtle,
                shadow.sm,
                animations.fast,
                "hover:shadow-md hover:-translate-y-1"
              )}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                <Layout className="h-6 w-6 text-white" />
              </div>
              <h3 className={cn(
                "mb-2 text-[length:var(--font-size-20)] font-[var(--font-weight-semibold)]",
                text.primary
              )}>
                Workspace
              </h3>
              <p className={cn(
                "mb-4 text-[length:var(--font-size-15)] leading-[var(--line-height-relaxed)]",
                text.secondary
              )}>
                Organize projects, manage tasks, and collaborate with your team. Everything you need in one intelligent workspace.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                Open Workspace
                <ArrowUp className="h-4 w-4 rotate-45 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            {/* ALOE Card */}
            <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 dark:border-orange-800 dark:from-orange-950/20 dark:to-amber-950/20">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className={cn(
                "mb-2 text-[length:var(--font-size-20)] font-[var(--font-weight-semibold)]",
                text.primary
              )}>
                ALOE Framework
              </h3>
              <p className={cn(
                "mb-4 text-[length:var(--font-size-15)] leading-[var(--line-height-relaxed)]",
                text.secondary
              )}>
                AI as a Life Orchestration Engine. The intelligent foundation that powers autonomous agents and seamless workflows.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                <Sparkles className="h-4 w-4" />
                Built on ALOE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ALOE Features Section */}
      <div className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
              <Zap className="h-4 w-4" />
              What Makes ALOE Different
            </div>
            <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-slate-100">
              AI as a Life Orchestration Engine
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-slate-400">
              ALOE isn&apos;t just another AI framework—it&apos;s a complete paradigm for how AI integrates into your life and work
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Feature 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Workflow className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Autonomous Orchestration
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  ALOE doesn&apos;t just respond—it anticipates, plans, and executes complex multi-step workflows without constant guidance.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Contextual Memory
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  Remembers your preferences, learns from interactions, and maintains context across all your projects and conversations.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <GitBranch className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Unified Integration
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  Seamlessly connects Toron&apos;s intelligence with Workspace&apos;s organization, creating a cohesive AI-powered environment.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30">
                  <Shield className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Privacy-First Architecture
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  Built with security at its core. Your data stays yours, with enterprise-grade encryption and transparent data handling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="mx-auto w-full max-w-3xl shrink-0 px-6 pb-12">
        <form
          onSubmit={handlePrompt}
          className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-blue-500"
        >
          <div className="flex items-center gap-3">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Ryuzen anything..."
              className="flex-1 bg-transparent text-lg font-medium text-gray-900 outline-none placeholder:text-gray-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-all hover:shadow-lg hover:scale-105 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:scale-100 dark:disabled:from-slate-700 dark:disabled:to-slate-700"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-xs font-medium text-gray-500 dark:text-slate-500">
          Ryuzen AI Engine v2.0 • Powered by ALOE Framework • Secure Enclave Active
        </p>
      </div>
    </div>
  );
}
