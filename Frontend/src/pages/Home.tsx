import { PenTool, Sparkles, User, Code, Paperclip, Mic, List, Send } from "lucide-react";
import ActionCard from "../components/ActionCard";

export default function HomePage() {
  return (
    <section className="flex h-full flex-col">
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 pb-24">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Welcome to Script</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Get started by Script a task and Chat can do the rest. Not sure where to start?
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
          <ActionCard
            title="Write copy"
            icon={PenTool}
            iconBg="bg-gradient-to-br from-orange-400 to-orange-500"
          />
          <ActionCard
            title="Image generation"
            icon={Sparkles}
            iconBg="bg-gradient-to-br from-blue-400 to-blue-500"
          />
          <ActionCard
            title="Create avatar"
            icon={User}
            iconBg="bg-gradient-to-br from-green-400 to-green-500"
          />
          <ActionCard
            title="Write code"
            icon={Code}
            iconBg="bg-gradient-to-br from-pink-400 to-pink-500"
          />
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="border-t border-[var(--line-subtle)] bg-[var(--layer-surface)] px-6 pb-6 pt-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-3 rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] p-3">
            <div className="flex flex-1 flex-col gap-3">
              <input
                type="text"
                placeholder="Summarize the latest"
                className="flex-1 bg-transparent px-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] transition hover:bg-[var(--layer-surface)] hover:text-[var(--text-primary)]">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>Attach</span>
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] transition hover:bg-[var(--layer-surface)] hover:text-[var(--text-primary)]">
                    <Mic className="h-3.5 w-3.5" />
                    <span>Voice Message</span>
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] transition hover:bg-[var(--layer-surface)] hover:text-[var(--text-primary)]">
                    <List className="h-3.5 w-3.5" />
                    <span>Browse Prompts</span>
                  </button>
                </div>
                <div className="text-xs text-[var(--text-muted)]">20 / 3,000</div>
              </div>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)] text-white transition hover:opacity-90">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
            Script may generate inaccurate information about people, places, or facts. Model: Script AI v1.3
          </p>
        </div>
      </div>
    </section>
  );
}
