import React from "react";
import { ArrowUpRight, Folder, Sparkles, Upload } from "lucide-react";

const files = [
  { name: "Ryuzen Roadmap.md", type: "Document", updated: "2h ago", active: true },
  { name: "Nimbus Diagrams.fig", type: "Design", updated: "4h ago" },
  { name: "Toron Logs.csv", type: "Data", updated: "12h ago" },
  { name: "Connector Spec.pdf", type: "Reference", updated: "1d ago" },
];

const insights = {
  uploads: 12,
  summaries: 8,
  tags: ["multimodal", "connectors", "security"],
  breakdown: [
    { label: "Documents", value: 42 },
    { label: "Data", value: 28 },
    { label: "Design", value: 18 },
    { label: "Other", value: 12 },
  ],
};

export default function WorkspacePage() {
  return (
    <div className="min-h-screen bg-black/60 bg-aurora-edge px-6 py-10 text-white backdrop-blur-3xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Nimbus Workspace</p>
            <h1 className="text-3xl font-semibold">Files & Research</h1>
            <p className="text-sm text-slate-200">Glass-black canvas with aurora edges and neon folder cues.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_40px_rgba(56,189,248,0.35)] transition hover:border-cyan-400/50 hover:bg-cyan-500/15">
              <Upload className="h-4 w-4" />
              Upload
            </button>
            <button className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-cyan-400/50 hover:bg-cyan-500/10">
              <Sparkles className="h-4 w-4" />
              Auto-summarize
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {files.map((file) => (
                <div
                  key={file.name}
                  className={`card-aurora group relative overflow-hidden p-4 ${file.active ? "ring-2 ring-cyan-400/60 shadow-[0_0_50px_rgba(56,189,248,0.45)] animate-pulse" : ""}`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.2),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.2),transparent_55%)]" />
                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-white/10 text-cyan-100">
                        <Folder className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold">{file.name}</p>
                        <p className="text-xs text-slate-300">{file.type}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-200">{file.updated}</span>
                  </div>
                  <div className="relative mt-3 flex items-center justify-between text-sm text-cyan-100">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.7)]" />
                      {file.active ? "Active folder" : "Available"}
                    </span>
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="card-aurora relative overflow-hidden p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.2),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.25),transparent_60%)]" />
            <div className="relative space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Workspace Insights</p>
                <h2 className="text-xl font-semibold text-white">Telemetry-lite</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-200">Recent uploads</p>
                <p className="text-2xl font-semibold text-white">{insights.uploads}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-200">Summaries generated</p>
                <p className="text-2xl font-semibold text-white">{insights.summaries}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-200">Smart tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {insights.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-200">File types</p>
                <div className="mt-3 space-y-2">
                  {insights.breakdown.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm text-white">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/10">
                        <div
                          className="progress-flowline h-full"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
