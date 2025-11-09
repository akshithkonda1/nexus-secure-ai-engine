import { useNavigate } from "react-router-dom";
import { PlayCircle, UploadCloud, Sparkles, Settings2 } from "lucide-react";

function Capsule({ Icon, title, onClick }: { Icon: any; title: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="glass lift text-left px-5 py-4 flex items-center gap-4">
      <span className="inline-grid place-items-center h-10 w-10 rounded-xl bg-prism ring-prism">
        <Icon className="h-5 w-5" />
      </span>
      <span className="font-medium">{title}</span>
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  return (
    <main className="p-6">
      <section className="glass bg-grid px-8 py-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs tracking-[0.18em] uppercase text-subtle mb-2">Nexus • Beta</div>
            <h1 className="text-3xl font-semibold">
              Welcome to <span className="bg-prism px-2 py-0.5 rounded-md">Nexus.ai</span>
            </h1>
            <p className="text-sm text-subtle mt-2">Orchestrate, debate, and ship with telemetry you can trust.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-10 px-4 rounded-xl bg-prism lift" onClick={() => navigate("/chat")}>
              Launch Console
            </button>
            <button
              className="h-10 px-4 rounded-xl border border-border/60 bg-surface/50 hover:bg-surface/70"
              onClick={() => navigate("/templates")}
            >
              Browse Templates
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mt-6">
        <Capsule Icon={PlayCircle} title="New session" onClick={() => navigate("/chat")} />
        <Capsule Icon={UploadCloud} title="Import transcript" onClick={() => navigate("/documents")} />
        <Capsule Icon={Sparkles} title="Templates" onClick={() => navigate("/templates")} />
        <Capsule Icon={Settings2} title="Settings" onClick={() => navigate("/settings")} />
      </section>

      {/* Last sessions (stub) */}
      <section className="mt-8 grid gap-3">
        <div className="glass px-5 py-3">
          <div className="text-sm font-medium">Last 5 sessions</div>
          <ul className="mt-2 grid gap-2">
            <li className="flex items-center justify-between">
              <span className="truncate text-sm">Growth strategy review</span>
              <button className="text-xs px-2 py-1 rounded-full border border-border/60 hover:bg-surface/60">
                Resume
              </button>
            </li>
            <li className="flex items-center justify-between">
              <span className="truncate text-sm">Partner enablement thread</span>
              <button className="text-xs px-2 py-1 rounded-full border border-border/60 hover:bg-surface/60">
                Resume
              </button>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
