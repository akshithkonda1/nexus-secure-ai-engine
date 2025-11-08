import { Link } from "react-router-dom";

type Row = { id: string; title: string; ts: string; summary: string };

const rows: Row[] = [
  {
    id: "a",
    title: "Growth strategy review",
    ts: "2 hours ago",
    summary: "Consensus across 3 models; shipped draft deck.",
  },
  {
    id: "b",
    title: "Partner enablement thread",
    ts: "yesterday",
    summary: "Triaged docs, generated playbook outline.",
  },
];

export function History() {
  return (
    <section className="rounded-2xl bg-[rgb(var(--panel))] border border-border/60 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
      <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
        <h2 className="font-medium">All sessions</h2>
        <input
          className="h-9 w-64 max-w-full rounded-lg bg-surface/50 border border-border/60 px-3 text-sm"
          placeholder="Search sessions…"
        />
      </div>
      <div className="divide-y divide-border/60">
        {rows.map((r) => (
          <div key={r.id} className="px-6 py-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.title}</div>
              <div className="text-xs text-subtle mt-0.5">
                {r.ts} • {r.summary}
              </div>
            </div>
            <Link
              to={`/history/${r.id}`}
              className="h-8 px-3 rounded-lg border border-border/60 hover:bg-surface/50"
            >
              Resume
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default History;
