import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { motion } from "framer-motion";

import { mapClustersToBubbles } from "@/lib/charts/cluster";
import {
  exportCSV,
  exportJSON,
  generateDigest,
  generateRoadmap,
} from "@/lib/api/feedback";
import { useTheme } from "@/theme/useTheme";

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "#22c55e",
  neutral: "#fbbf24",
  negative: "#ef4444",
};

const chartCardClass =
  "rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_90%,transparent)] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.28)]";

export default function FeedbackDashboard() {
  const { resolvedTheme } = useTheme();
  const [actionMessage, setActionMessage] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const feedbackEntries = useMemo(
    () => [
      {
        id: "FB-1042",
        user: "Aria",
        category: "Latency",
        sentiment: "positive",
        priority: 0.92,
        createdAt: "2024-11-01T15:23:00Z",
        summary: "GPU pool saturating during resume clustering",
      },
      {
        id: "FB-1043",
        user: "DevOps",
        category: "Stability",
        sentiment: "neutral",
        priority: 0.74,
        createdAt: "2024-11-02T10:00:00Z",
        summary: "Occasional 429s on Toron insight endpoint",
      },
      {
        id: "FB-1044",
        user: "Iris",
        category: "UX",
        sentiment: "positive",
        priority: 0.68,
        createdAt: "2024-11-03T09:30:00Z",
        summary: "System behavior shortcuts feel natural",
      },
      {
        id: "FB-1045",
        user: "QA",
        category: "Latency",
        sentiment: "negative",
        priority: 0.88,
        createdAt: "2024-11-03T22:15:00Z",
        summary: "Cold starts add 2.4s before first token",
      },
      {
        id: "FB-1046",
        user: "Product",
        category: "Insights",
        sentiment: "positive",
        priority: 0.64,
        createdAt: "2024-11-04T13:42:00Z",
        summary: "Clustered digest captured hiring spikes",
      },
      {
        id: "FB-1047",
        user: "Security",
        category: "Compliance",
        sentiment: "neutral",
        priority: 0.55,
        createdAt: "2024-11-04T16:20:00Z",
        summary: "Need audit trail export for BigQuery",
      },
      {
        id: "FB-1048",
        user: "Ops",
        category: "Integrations",
        sentiment: "positive",
        priority: 0.72,
        createdAt: "2024-11-05T08:10:00Z",
        summary: "S3 export ran in 40s with Toron tags",
      },
      {
        id: "FB-1049",
        user: "Support",
        category: "UX",
        sentiment: "negative",
        priority: 0.61,
        createdAt: "2024-11-05T17:05:00Z",
        summary: "Need clearer prompts on digest failures",
      },
    ],
    [],
  );

  const sentimentDistribution = useMemo(() => {
    return feedbackEntries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.sentiment] = (acc[entry.sentiment] ?? 0) + 1;
      return acc;
    }, {});
  }, [feedbackEntries]);

  const categoryCounts = useMemo(() => {
    const counts = feedbackEntries.reduce<Record<string, { count: number; priority: number }>>(
      (acc, entry) => {
        if (!acc[entry.category]) {
          acc[entry.category] = { count: 0, priority: 0 };
        }
        acc[entry.category].count += 1;
        acc[entry.category].priority += entry.priority;
        return acc;
      },
      {},
    );

    return Object.entries(counts).map(([category, { count, priority }]) => ({
      category,
      count,
      avgPriority: Number((priority / count).toFixed(2)),
    }));
  }, [feedbackEntries]);

  const clusterBubbles = useMemo(
    () =>
      mapClustersToBubbles([
        { id: "c1", label: "Hiring Ops", score: 0.82, volume: 24, sentiment: "positive" },
        { id: "c2", label: "Latency", score: 0.74, volume: 19, sentiment: "neutral" },
        { id: "c3", label: "Data Export", score: 0.69, volume: 16, sentiment: "positive" },
        { id: "c4", label: "UX polish", score: 0.58, volume: 12, sentiment: "negative" },
      ]),
    [],
  );

  const overview = useMemo(() => {
    const total = feedbackEntries.length;
    const avgPriority =
      feedbackEntries.reduce((sum, entry) => sum + entry.priority, 0) / Math.max(total, 1);
    const categoryFrequency = [...categoryCounts].sort((a, b) => b.count - a.count)[0]?.category ?? "–";

    return {
      total,
      avgPriority: avgPriority.toFixed(2),
      topCategory: categoryFrequency,
    };
  }, [categoryCounts, feedbackEntries]);

  const heatmap = useMemo(
    () => [
      { category: "Latency", buckets: [0.92, 0.88, 0.81] },
      { category: "UX", buckets: [0.68, 0.61, 0.55] },
      { category: "Compliance", buckets: [0.55, 0.49, 0.42] },
      { category: "Integrations", buckets: [0.72, 0.64, 0.57] },
    ],
    [],
  );

  const timeline = useMemo(
    () => [
      { label: "Mon", total: 6 },
      { label: "Tue", total: 5 },
      { label: "Wed", total: 7 },
      { label: "Thu", total: 9 },
      { label: "Fri", total: 8 },
      { label: "Sat", total: 4 },
      { label: "Sun", total: 3 },
    ],
    [],
  );

  const clusterGroups = useMemo(
    () => [
      { name: "Hiring Ops", cohesion: 0.82, momentum: "+12%", span: "9 docs" },
      { name: "Latency", cohesion: 0.74, momentum: "+6%", span: "7 docs" },
      { name: "Data Export", cohesion: 0.69, momentum: "+3%", span: "6 docs" },
      { name: "UX polish", cohesion: 0.58, momentum: "-2%", span: "4 docs" },
    ],
    [],
  );

  const mostRecent = useMemo(
    () => [...feedbackEntries].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5),
    [feedbackEntries],
  );

  const highestPriority = useMemo(
    () => [...feedbackEntries].sort((a, b) => b.priority - a.priority).slice(0, 5),
    [feedbackEntries],
  );

  const handleAction = async (label: string, action: () => Promise<unknown>) => {
    setActionLoading(label);
    setActionMessage("");
    try {
      await action();
      setActionMessage(`${label} completed`);
    } catch (error) {
      setActionMessage((error as Error)?.message ?? "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_95%,transparent)] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.5)]">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            resolvedTheme === "dark"
              ? "from-purple-600/25 via-cyan-500/25 to-emerald-400/20"
              : "from-emerald-500/25 via-purple-500/20 to-cyan-400/15"
          }`}
          aria-hidden
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }}
          className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--text-secondary)]">Ryuzen Feedback</p>
            <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Feedback Intelligence Dashboard</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Toron-powered analytics across sentiment, categories, and cluster cohesion. Fully theme-aware and mobile ready.
            </p>
          </div>
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.3 } }}
            className="flex flex-wrap gap-3"
          >
            <button
              onClick={() =>
                handleAction("Export CSV", () => exportCSV("local"))
              }
              className="rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_80%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-[1px]"
            >
              Export CSV
            </button>
            <button
              onClick={() =>
                handleAction("Export JSON", () => exportJSON("local"))
              }
              className="rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_80%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-[1px]"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleAction("Export S3", () => exportCSV("s3"))}
              className="rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_80%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-[1px]"
            >
              Export to S3
            </button>
            <button
              onClick={() => handleAction("Export BigQuery", () => exportJSON("bigquery"))}
              className="rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_80%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-[1px]"
            >
              Export to BigQuery
            </button>
            <button
              onClick={() => handleAction("Weekly Digest", generateDigest)}
              className="rounded-xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--accent-primary)_32%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-[0_12px_40px_rgba(124,93,255,0.3)] transition hover:-translate-y-[1px]"
            >
              Generate Weekly Digest
            </button>
            <button
              onClick={() => handleAction("Roadmap", generateRoadmap)}
              className="rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--accent-secondary)_26%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-[1px]"
            >
              Generate Roadmap
            </button>
          </motion.div>
        </motion.div>
        {actionMessage && (
          <p className="relative pt-3 text-sm text-[var(--text-secondary)]">
            {actionLoading ? `Working: ${actionLoading}` : actionMessage}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard title="Total feedback" value={overview.total.toString()} accent="from-cyan-400/30 to-purple-500/30" />
        <OverviewCard title="Avg priority score" value={overview.avgPriority} accent="from-emerald-400/30 to-cyan-400/20" />
        <OverviewCard title="Most common category" value={overview.topCategory} accent="from-purple-500/30 to-indigo-400/30" />
        <OverviewCard
          title="Sentiment distribution"
          value={`${sentimentDistribution.positive ?? 0}/${sentimentDistribution.neutral ?? 0}/${sentimentDistribution.negative ?? 0}`}
          accent="from-amber-400/25 to-rose-400/25"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={chartCardClass}>
          <SectionHeader title="Sentiment" subtitle="Positive vs neutral vs negative" />
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={Object.entries(sentimentDistribution).map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {Object.entries(sentimentDistribution).map(([name], index) => (
                    <Cell key={name} fill={SENTIMENT_COLORS[name] ?? `hsl(${index * 80},70%,60%)`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--panel-strong)", border: "1px solid var(--border-soft)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={chartCardClass}>
          <SectionHeader title="Categories" subtitle="Volume and normalized priority" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={categoryCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                <XAxis dataKey="category" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--panel-strong)", border: "1px solid var(--border-soft)" }} />
                <Bar dataKey="count">
                  {categoryCounts.map((entry, index) => (
                    <Cell
                      key={entry.category}
                      fill={`hsl(${(index * 60) % 360},70%,${resolvedTheme === "dark" ? "60%" : "50%"})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${chartCardClass} lg:col-span-2`}>
          <SectionHeader title="Feedback timeline" subtitle="Recent arrival cadence" />
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                <XAxis dataKey="label" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--panel-strong)", border: "1px solid var(--border-soft)" }} />
                <Line type="monotone" dataKey="total" stroke="#7c5dff" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={chartCardClass}>
          <SectionHeader title="Priority heatmap" subtitle="Distribution across categories" />
          <div className="grid gap-3">
            {heatmap.map((row) => (
              <div key={row.category} className="space-y-2 rounded-xl bg-[color-mix(in_srgb,var(--panel-strong)_80%,transparent)] p-3">
                <div className="flex items-center justify-between text-sm font-semibold text-[var(--text-primary)]">
                  <span>{row.category}</span>
                  <span className="text-xs text-[var(--text-secondary)]">High → Low</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {row.buckets.map((value, idx) => (
                    <div
                      key={`${row.category}-${idx}`}
                      className="flex h-12 items-center justify-center rounded-lg text-sm font-semibold text-[var(--text-primary)] transition"
                      style={{
                        background:
                          resolvedTheme === "dark"
                            ? `linear-gradient(145deg, rgba(124,93,255,${value / 1.2}), rgba(34,211,238,${value / 1.4}))`
                            : `linear-gradient(145deg, rgba(124,93,255,${value / 1.6}), rgba(34,211,238,${value / 1.8}))`,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                      }}
                    >
                      {value.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${chartCardClass} lg:col-span-2`}>
          <SectionHeader title="Cluster bubble map" subtitle="Toron cohesion across themes" />
          <div className="h-72">
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
                <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
                <ZAxis type="number" dataKey="z" range={[80, 260]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{ background: "var(--panel-strong)", border: "1px solid var(--border-soft)" }}
                  formatter={(value: number, name, props) => {
                    if (name === "z") return `${value} signals`;
                    if (name === "score") return `${value}`;
                    return `${props?.payload?.sentiment ?? name}`;
                  }}
                />
                <Scatter data={clusterBubbles} shape="circle">
                  {clusterBubbles.map((point) => (
                    <Cell key={point.id} fill={point.fill} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={chartCardClass}>
          <SectionHeader title="Cluster groups" subtitle="Cohesion & velocity" />
          <div className="divide-y divide-[var(--border-soft)]">
            {clusterGroups.map((cluster) => (
              <div key={cluster.name} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{cluster.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{cluster.span}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{cluster.cohesion}</p>
                  <p className="text-xs text-emerald-400">{cluster.momentum}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TableCard title="Most recent feedback" subtitle="Live tap" rows={mostRecent} />
        <TableCard title="Highest priority feedback" subtitle="Signal strength" rows={highestPriority} />
        <div className={chartCardClass}>
          <SectionHeader title="Admin summary" subtitle="Digest-ready snapshot" />
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            <li className="flex items-center justify-between">
              <span>Weekly arrivals</span>
              <span className="text-[var(--text-primary)]">42</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Pending actions</span>
              <span className="text-[var(--text-primary)]">7</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Open integrations</span>
              <span className="text-[var(--text-primary)]">S3, BigQuery</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Digest cadence</span>
              <span className="text-[var(--text-primary)]">Weekly @ 08:00 UTC</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.28 } }}
      className="relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_88%,transparent)] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} aria-hidden />
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">{title}</p>
        <p className="pt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
      </div>
    </motion.div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
        {subtitle && <p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>}
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[var(--border-soft)] to-transparent" />
    </div>
  );
}

function TableCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: Array<{ id: string; user: string; category: string; sentiment: string; priority: number; createdAt: string; summary: string }>;
}) {
  return (
    <div className={chartCardClass}>
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="divide-y divide-[var(--border-soft)]">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-col gap-1 py-3">
            <div className="flex items-center justify-between text-sm font-semibold text-[var(--text-primary)]">
              <span>{row.summary}</span>
              <span className="rounded-lg bg-[color-mix(in_srgb,var(--panel-strong)_80%,transparent)] px-2 py-1 text-xs text-[var(--text-secondary)]">
                {row.category}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
              <span className="rounded-full bg-[color-mix(in_srgb,var(--panel-strong)_70%,transparent)] px-2 py-1 font-semibold text-[var(--text-primary)]">
                {row.sentiment}
              </span>
              <span>Priority {row.priority.toFixed(2)}</span>
              <span>By {row.user}</span>
              <span>{new Date(row.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
