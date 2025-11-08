import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Upload, FileCog, Settings as Cog } from "lucide-react";
import { sessionStore } from "@/store/sessionStore";

function ActionCard(props: { title: string; desc: string; onClick: () => void; icon: ReactNode; gradient: string; }) {
  const { title, desc, onClick, icon, gradient } = props;
  return (
    <button onClick={onClick} className={`text-left rounded-2xl p-5 md:p-6 border border-white/10 shadow-soft hover:shadow-glow transition-all ${gradient}`}>
      <div className="flex items-center gap-3 mb-3"><div className="p-2 rounded-lg bg-black/20">{icon}</div><h3 className="font-semibold">{title}</h3></div>
      <p className="text-sm text-gray-300">{desc}</p>
    </button>
  );
}

export function Home() {
  const nav = useNavigate();
  const { createSession, importTranscript, sessions } = sessionStore.use();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div className="rounded-2xl border border-white/10 bg-[var(--nexus-card)] p-8 shadow-soft">
        <div className="text-center space-y-3">
          <div className="text-xs tracking-[0.35em] text-gray-400">NEXUS BETA</div>
          <h1 className="text-3xl md:text-4xl font-bold">Welcome to Nexus.ai</h1>
          <p className="text-gray-300">Launch sessions, import transcripts, apply templates, and manage your workspace.</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20" onClick={() => nav("/sessions")}>Launch Console</button>
            <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white" onClick={() => nav("/templates")}>Browse Templates</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <ActionCard title="New session" desc="Spin up an AI copilot session in seconds."
          onClick={() => { const id = createSession({ title: "New session" }); nav(`/sessions/${id}`); }}
          icon={<PlayCircle className="h-5 w-5 text-blue-300" />} gradient="bg-gradient-to-b from-white/5 to-transparent" />
        <ActionCard title="Import transcript" desc="Bring an existing chat log to continue seamlessly."
          onClick={() => importTranscript().then(id => id && nav(`/sessions/${id}`))}
          icon={<Upload className="h-5 w-5 text-emerald-300" />} gradient="bg-gradient-to-b from-emerald-500/10 to-transparent" />
        <ActionCard title="Templates" desc="Start faster with pre-built frameworks."
          onClick={() => nav("/templates")}
          icon={<FileCog className="h-5 w-5 text-purple-300" />} gradient="bg-gradient-to-b from-purple-500/10 to-transparent" />
        <ActionCard title="Settings" desc="Tweak preferences, providers, and quotas."
          onClick={() => nav("/settings")}
          icon={<Cog className="h-5 w-5 text-yellow-300" />} gradient="bg-gradient-to-b from-yellow-500/10 to-transparent" />
      </div>

      <section className="rounded-2xl border border-white/10 bg-[var(--nexus-card)] p-5 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Last 5 sessions</h2>
          <button className="text-sm px-3 py-1 rounded-md bg-white/10 border border-white/10 hover:bg-white/20" onClick={() => nav("/sessions")}>View all sessions</button>
        </div>
        <div className="space-y-2">
          {sessions.slice(0,5).map(s => (
            <div key={s.id} className="flex items-center justify-between rounded-lg px-4 py-3 bg-black/20 border border-white/10">
              <div><div className="font-medium">{s.title}</div><div className="text-xs text-gray-400">{new Date(s.updatedAt).toLocaleString()}</div></div>
              <button className="text-sm px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white" onClick={() => nav(`/sessions/${s.id}`)}>Resume</button>
            </div>
          ))}
          {sessions.length === 0 && <div className="text-sm text-gray-400">No sessions yet.</div>}
        </div>
      </section>
    </div>
  );
}
