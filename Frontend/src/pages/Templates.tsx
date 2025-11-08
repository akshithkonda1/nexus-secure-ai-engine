import { Layers, Sparkles, Wand2 } from "lucide-react";

const data = [
  { icon: Sparkles, title: "Brainstorm brief", desc: "Rapid idea generation", tag: "creative" },
  { icon: Wand2, title: "Summarize paper", desc: "Academic summary", tag: "research" },
  { icon: Layers, title: "Debate compare", desc: "Model vs model", tag: "orchestration" },
];

export function Templates() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">Templates</h2>
        <span className="text-xs text-subtle">Script-style collection</span>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((t) => (
          <button
            key={t.title}
            className="text-left rounded-2xl bg-[rgb(var(--panel))] border border-border/60 p-6 shadow-[0_10px_28px_rgba(0,0,0,0.22)] hover:bg-surface/50"
          >
            <div className="size-10 rounded-xl bg-[color:var(--brand)]/10 grid place-items-center mb-3">
              <t.icon className="size-5" style={{ color: "var(--brand)" }} />
            </div>
            <div className="font-medium">{t.title}</div>
            <div className="text-sm text-subtle mt-1">{t.desc}</div>
            <div className="text-xs mt-3 inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-border/60">
              {t.tag}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Templates;
