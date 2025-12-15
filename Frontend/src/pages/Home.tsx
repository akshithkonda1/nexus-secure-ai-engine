import { ArrowRight, PenTool, Sparkles, User, Code, Paperclip, Mic, List, Send } from "lucide-react";
import { Link } from "react-router-dom";
import ActionCard from "../components/ActionCard";

export default function HomePage() {
  return (
    <section className="flex min-h-full flex-col items-center gap-12">
      <header className="flex w-full max-w-3xl flex-col items-center space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">Home</p>
        <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Welcome to Ryuzen</h1>
        <p className="max-w-2xl text-sm text-[var(--text-muted)]">
          Start in Toron to chat or open Workspace to organize your work. Pick an entry point and begin.
        </p>
      </header>

      <div className="flex w-full justify-center">
        <div className="flex w-full max-w-3xl flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/toron"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--line-strong)] bg-[var(--layer-active)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]"
            >
              Toron
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/workspace"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--line-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--line-strong)]"
            >
              Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-col items-center space-y-1 text-center">
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">Start here</p>
            <h2 className="text-xl font-semibold text-[var(--text-strong)]">Choose your flow</h2>
          </div>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <ActionCard title="Write copy" icon={PenTool} iconBg="bg-gradient-to-br from-orange-400 to-orange-500" />
            <ActionCard title="Image generation" icon={Sparkles} iconBg="bg-gradient-to-br from-blue-400 to-blue-500" />
            <ActionCard title="Create avatar" icon={User} iconBg="bg-gradient-to-br from-green-400 to-green-500" />
            <ActionCard title="Write code" icon={Code} iconBg="bg-gradient-to-br from-pink-400 to-pink-500" />
          </div>
          <div className="w-full space-y-3 rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-6">
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">Quick prompt</p>
            <div className="flex flex-col gap-3 rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] p-3">
              <input
                type="text"
                placeholder="Summarize yesterday's progress"
                className="flex-1 rounded-lg bg-[var(--layer-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] transition hover:bg-[var(--layer-surface)] hover:text-[var(--text-primary)]">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>Attach</span>
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] transition hover:bg-[var(--layer-surface)] hover:text-[var(--text-primary)]">
                    <Mic className="h-3.5 w-3.5" />
                    <span>Voice</span>
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] transition hover:bg-[var(--layer-surface)] hover:text-[var(--text-primary)]">
                    <List className="h-3.5 w-3.5" />
                    <span>Prompts</span>
                  </button>
                </div>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)] text-white transition hover:opacity-90">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Routes to Toron for deeper threads.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
