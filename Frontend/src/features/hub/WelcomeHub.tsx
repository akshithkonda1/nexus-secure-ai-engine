import { Button } from "@/shared/ui/components/button";
import { Link } from "react-router-dom";

export default function WelcomeHub() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-3xl bg-card/40 border p-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Welcome to Nexus</h1>
        <p className="mt-3 text-muted-foreground">Get started by asking Nexus to do something. Not sure where to start?</p>

        {/* Action chips */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Chip label="Write copy" to="/chat/new?preset=copy" />
          <Chip label="Image generation" to="/chat/new?preset=image" />
          <Chip label="Create avatar" to="/chat/new?preset=avatar" />
          <Chip label="Write code" to="/chat/new?preset=code" />
        </div>

        {/* Prompt bar */}
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="rounded-2xl border bg-background p-2">
            <div className="flex items-center gap-2 px-2 pb-2">
              <Button variant="ghost" size="sm">
                📎 Attach
              </Button>
              <Button variant="ghost" size="sm">
                🎙️ Voice Message
              </Button>
              <Button variant="ghost" size="sm">
                🔍 Browse Prompts
              </Button>
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-3">
              <input className="flex-1 bg-transparent outline-none text-sm" placeholder="Summarize the latest…" />
              <button className="rounded-full p-2 hover:bg-muted" aria-label="Send">
                ➤
              </button>
            </div>
            <div className="px-3 pt-2 pb-1 text-[11px] text-muted-foreground">
              Nexus may generate inaccurate information about people, places, or facts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, to }: { label: string; to: string }) {
  return (
    <Link
      to={to}
      className="group w-full rounded-2xl border bg-background px-4 py-3 flex items-center justify-between hover:bg-muted transition"
    >
      <div className="flex items-center gap-3">
        <span className="size-9 rounded-xl grid place-items-center bg-muted">🟡</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="rounded-full border px-2 text-xs text-muted-foreground group-hover:bg-muted">＋</span>
    </Link>
  );
}
