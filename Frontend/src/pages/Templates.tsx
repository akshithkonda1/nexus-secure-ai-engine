import { useNavigate } from "react-router-dom";
import { sessionStore } from "@/store/sessionStore";

const templates = [
  { id: "market-review", title: "Market review", desc: "Summarize market signals and flags." },
  { id: "bug-triage", title: "Bug triage", desc: "Collect logs, reproduce, propose fixes." },
  { id: "pr-factcheck", title: "PR fact-check", desc: "Verify claims across sources." },
  { id: "spec-drafter", title: "Spec drafter", desc: "Turn requirements into a light RFC." },
];

export function Templates() {
  const nav = useNavigate();
  const { createSession } = sessionStore.use();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Templates</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map(t => (
          <div key={t.id} className="rounded-xl border border-white/10 bg-[var(--nexus-card)] p-5">
            <div className="font-medium">{t.title}</div>
            <div className="text-sm text-gray-300 mt-1">{t.desc}</div>
            <div className="mt-4">
              <button className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
                onClick={() => { const id = createSession({ title: `${t.title} session`, template: t.id }); nav(`/sessions/${id}`); }}>
                Use template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
