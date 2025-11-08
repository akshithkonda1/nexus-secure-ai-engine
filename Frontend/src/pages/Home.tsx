// Frontend/src/pages/Home.tsx
import { Link } from "react-router-dom";

type Action = { title: string; desc: string; to: string };

const quickActions: Action[] = [
  { title: "New session", desc: "Start a fresh multi-model debate.", to: "/chat" },
  { title: "Import transcript", desc: "Upload past debates for auditing.", to: "/documents" },
  { title: "Templates", desc: "Kick off workflows fast.", to: "/templates" },
  { title: "Settings", desc: "Tune guardrails & providers.", to: "/settings" },
];

function QuickCard({ title, desc, to }: Action) {
  return (
    <Link
      to={to}
      className="panel rounded-xl p-6 block hover:shadow-glow border"
      style={{ borderColor: "rgb(var(--border))" }}
    >
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-subtle mt-1">{desc}</p>
    </Link>
  );
}

export function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-6 py-8">
      {/* Hero */}
      <section className="mb-8">
        <div className="panel rounded-2xl px-8 py-10 border" style={{ borderColor: "rgb(var(--border))" }}>
          <h1 className="text-2xl font-semibold">Welcome to Nexus</h1>
          <p className="text-subtle mt-2">
            Aggregate models, debate outputs, and ship reliable answers.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/chat" className="px-4 py-2 rounded-lg border hover:shadow-glow" style={{ borderColor: "rgb(var(--border))" }}>
              Open Chat
            </Link>
            <Link to="/settings" className="px-4 py-2 rounded-lg border hover:shadow-glow" style={{ borderColor: "rgb(var(--border))" }}>
              Settings
            </Link>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <QuickCard key={action.title} {...action} />
        ))}
      </section>
    </div>
  );
}
