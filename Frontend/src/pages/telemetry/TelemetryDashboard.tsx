import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const latency = [
  { label: "Mon", value: 320 },
  { label: "Tue", value: 290 },
  { label: "Wed", value: 310 },
  { label: "Thu", value: 270 },
  { label: "Fri", value: 250 },
  { label: "Sat", value: 240 },
  { label: "Sun", value: 230 },
];

const thinkingVsOutput = [
  { label: "Mon", thinking: 120, output: 60 },
  { label: "Tue", thinking: 110, output: 70 },
  { label: "Wed", thinking: 115, output: 65 },
  { label: "Thu", thinking: 105, output: 60 },
  { label: "Fri", thinking: 98, output: 55 },
  { label: "Sat", thinking: 95, output: 50 },
  { label: "Sun", thinking: 90, output: 45 },
];

const throughput = [
  { index: 0, tokens: 800 },
  { index: 1, tokens: 1040 },
  { index: 2, tokens: 900 },
  { index: 3, tokens: 1200 },
  { index: 4, tokens: 980 },
  { index: 5, tokens: 1320 },
  { index: 6, tokens: 1280 },
];

const drift = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 10 },
  { label: "Wed", value: 9 },
  { label: "Thu", value: 11 },
  { label: "Fri", value: 8 },
  { label: "Sat", value: 7 },
  { label: "Sun", value: 6 },
];

const divergenceHeatmap = [
  [14, 8, 12, 6],
  [9, 15, 11, 7],
  [6, 10, 8, 5],
];

const engineDistribution = [
  { label: "GPT-5", value: 40 },
  { label: "Sonnet", value: 22 },
  { label: "Qwen", value: 18 },
  { label: "DeepSeek", value: 12 },
  { label: "Other", value: 8 },
];

const connectorHealth = [
  { label: "Drive", score: 92 },
  { label: "Calendar", score: 88 },
  { label: "GitHub", score: 95 },
  { label: "Notion", score: 85 },
  { label: "Outlook", score: 80 },
];

const queryVolume = [
  { label: "Mon", value: 1100 },
  { label: "Tue", value: 1240 },
  { label: "Wed", value: 1300 },
  { label: "Thu", value: 1180 },
  { label: "Fri", value: 1400 },
  { label: "Sat", value: 1520 },
  { label: "Sun", value: 1680 },
];

const colors = ["#38bdf8", "#818cf8", "#22d3ee", "#c084fc", "#67e8f9"];

export default function TelemetryDashboard() {
  return (
    <div className="min-h-screen bg-black/60 bg-aurora-edge px-6 py-10 text-white backdrop-blur-3xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Nimbus Telemetry</p>
          <h1 className="text-3xl font-semibold">Model Performance</h1>
          <p className="text-sm text-slate-200">Frontend-only visuals for latency, cadence, drift, and engine allocation.</p>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          <TelemetryCard title="Model Latency" subtitle="p95 in ms" className="fade-slide-up">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latency}>
                  <defs>
                    <linearGradient id="latency" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.6)" tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.6)" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} />
                  <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3 }} fill="url(#latency)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TelemetryCard>

          <TelemetryCard title="Thinking vs Output" subtitle="Cadence balance" className="fade-slide-up">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={thinkingVsOutput}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.6)" tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.6)" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} />
                  <Bar dataKey="thinking" fill="url(#thinkingGradient)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="output" fill="url(#outputGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="thinkingGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="outputGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#312e81" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TelemetryCard>

          <TelemetryCard title="Token Throughput" subtitle="Live sparkline" className="fade-slide-up">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={throughput}>
                  <defs>
                    <linearGradient id="throughput" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="index" stroke="rgba(255,255,255,0.6)" tickLine={false} hide />
                  <YAxis stroke="rgba(255,255,255,0.6)" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} />
                  <Area type="monotone" dataKey="tokens" stroke="#22d3ee" fill="url(#throughput)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TelemetryCard>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <TelemetryCard title="Drift Index" subtitle="Embedding variance" className="fade-slide-up">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={drift}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.6)" tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.6)" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} />
                  <Line type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TelemetryCard>

          <TelemetryCard title="Divergence Heatmap" subtitle="Abstracted" className="fade-slide-up">
            <div className="grid h-full grid-cols-4 gap-3 p-2">
              {divergenceHeatmap.flat().map((value, index) => (
                <div
                  key={index}
                  className="flex h-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold"
                  style={{
                    background: `linear-gradient(135deg, rgba(56,189,248,${0.35 + value / 40}), rgba(99,102,241,${0.25 + value / 40}))`,
                    boxShadow: "0 0 30px rgba(56,189,248,0.25)",
                  }}
                >
                  {value}
                </div>
              ))}
            </div>
          </TelemetryCard>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <TelemetryCard title="Active Engine Distribution" subtitle="Holographic" className="fade-slide-up">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={engineDistribution} dataKey="value" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {engineDistribution.map((entry, index) => (
                      <Cell key={entry.label} fill={colors[index % colors.length]} stroke="rgba(255,255,255,0.2)" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-200">
              {engineDistribution.map((engine, index) => (
                <span
                  key={engine.label}
                  className="rounded-full border border-white/10 px-3 py-1"
                  style={{ background: `${colors[index % colors.length]}22` }}
                >
                  {engine.label}: {engine.value}%
                </span>
              ))}
            </div>
          </TelemetryCard>

          <TelemetryCard title="Connector Health" subtitle="Signal fidelity" className="fade-slide-up">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={connectorHealth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.6)" tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.6)" tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} />
                  <Bar dataKey="score" radius={[10, 10, 0, 0]}>
                    {connectorHealth.map((entry, index) => (
                      <Cell key={entry.label} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TelemetryCard>

          <TelemetryCard title="Query Volume" subtitle="Abstracted" className="fade-slide-up">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={queryVolume}>
                  <defs>
                    <linearGradient id="queries" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.6)" tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.6)" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} />
                  <Area type="monotone" dataKey="value" stroke="#38bdf8" fill="url(#queries)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TelemetryCard>
        </div>

        <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
          <TelemetryCard title="Hallucination Count" subtitle="Guardrail surface" className="fade-slide-up">
            <div className="flex h-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
              <div>
                <p className="text-sm text-slate-200">Last 24h</p>
                <p className="text-4xl font-semibold text-white">3</p>
              </div>
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400/30 via-slate-900 to-indigo-500/30 shadow-[0_0_40px_rgba(56,189,248,0.4)]" />
            </div>
          </TelemetryCard>

          <TelemetryCard title="Active Engines" subtitle="Command center sync" className="fade-slide-up">
            <div className="flex h-full flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              {engineDistribution.map((engine, index) => (
                <span
                  key={engine.label}
                  className="rounded-full border border-white/10 px-3 py-1"
                  style={{
                    background: `${colors[index % colors.length]}22`,
                    boxShadow: "0 0 25px rgba(56,189,248,0.3)",
                  }}
                >
                  {engine.label}
                </span>
              ))}
            </div>
          </TelemetryCard>
        </div>
      </div>
    </div>
  );
}

function TelemetryCard({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`card-aurora relative overflow-hidden p-5 ${className ?? ""}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.2),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.2),transparent_55%)]" />
      <div className="relative flex flex-col gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">{subtitle}</p>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}

function ChartContainer({ children }: { children: React.ReactNode }) {
  return <div className="h-56 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3">{children}</div>;
}

const tooltipStyle = {
  background: "rgba(15, 23, 42, 0.8)",
  border: "1px solid rgba(148, 163, 184, 0.4)",
  borderRadius: 12,
  color: "#e2e8f0",
  backdropFilter: "blur(12px)",
};

const tooltipLabel = { color: "#94a3b8" };
