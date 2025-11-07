import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Filter, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { useTelemetryErrors, useTelemetryUsage } from "@/queries/telemetry";
import type { TelemetryErrorsResponse, TelemetryPoint } from "@/types/models";

const RANGES = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
] as const;

type ErrorsPoint = TelemetryErrorsResponse["points"][number];
type ChartPoint = TelemetryPoint | ErrorsPoint;
type MetricKey = "requests" | "tokens" | "latency" | "failures";

const EMPTY_USAGE_POINTS: TelemetryPoint[] = [];
const EMPTY_ERROR_POINTS: ErrorsPoint[] = [];

export default function TelemetryPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]["value"]>("7d");
  const [provider, setProvider] = useState<string>("all");

  const usageQuery = useTelemetryUsage({ range, provider: provider === "all" ? undefined : provider });
  const errorsQuery = useTelemetryErrors({ range, provider: provider === "all" ? undefined : provider });

  const usagePoints = usageQuery.data?.points ?? EMPTY_USAGE_POINTS;
  const errorPoints = errorsQuery.data?.points ?? EMPTY_ERROR_POINTS;

  const providerOptions = useMemo(() => {
    const unique = Array.from(new Set(usagePoints.map((point) => point.provider)));
    return ["all", ...unique];
  }, [usagePoints]);

  const loading = usageQuery.isLoading || errorsQuery.isLoading;

  const requests = usagePoints;
  const failures = errorPoints;

  const sumRequests = useMemo(() => requests.reduce((acc, point) => acc + point.requests, 0), [requests]);
  const sumTokens = useMemo(() => requests.reduce((acc, point) => acc + point.tokens, 0), [requests]);
  const avgLatency = useMemo(() => (requests.length ? requests.reduce((acc, point) => acc + point.latency, 0) / requests.length : 0), [requests]);
  const sumFailures = useMemo(() => failures.reduce((acc, point) => acc + point.failures, 0), [failures]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Telemetry"
        description="Monitor usage, latency, and guardrail health across your Nexus providers."
      />

      <section className="rounded-3xl border border-app bg-panel p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-ink">Usage trends</h2>
            <p className="text-sm text-muted">Data updates automatically from the mock API.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-app bg-app px-3 py-2 text-xs text-muted">
              <Filter className="h-4 w-4" aria-hidden="true" />
              <select
                value={provider}
                onChange={(event) => setProvider(event.target.value)}
                className="bg-transparent text-sm text-ink focus:outline-none"
              >
                {providerOptions.map((option) => (
                  <option key={option} value={option} className="bg-panel text-ink">
                    {option === "all" ? "All providers" : option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-app bg-app px-3 py-2 text-xs text-muted">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <select
                value={range}
                onChange={(event) =>
                  setRange(event.target.value as (typeof RANGES)[number]["value"])
                }
                className="bg-transparent text-sm text-ink focus:outline-none"
              >
                {RANGES.map((option) => (
                  <option key={option.value} value={option.value} className="bg-panel text-ink">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-56" />
            ))}
          </div>
        ) : requests.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <MetricCard title="Requests" value={sumRequests.toLocaleString()} points={requests} dataKey="requests" accent="#1E40AF" />
            <MetricCard title="Tokens" value={sumTokens.toLocaleString()} points={requests} dataKey="tokens" accent="#64748b" />
            <MetricCard title="Latency p95" value={`${Math.round(avgLatency)} ms`} points={requests} dataKey="latency" accent="#14b8a6" />
            <MetricCard title="Failures" value={sumFailures.toLocaleString()} points={failures} dataKey="failures" accent="#f97316" />
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState title="No telemetry" description="Run a few sessions to populate telemetry analytics." />
          </div>
        )}
      </section>
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
  points: ChartPoint[];
  dataKey: MetricKey;
  accent: string;
};

function MetricCard({ title, value, points, dataKey, accent }: MetricCardProps) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-3xl border border-app bg-panel p-5 shadow-lg">
      <div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="text-2xl font-semibold text-ink">{value}</p>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accent} stopOpacity={0.8} />
                <stop offset="95%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis dataKey="date" stroke="rgba(148,163,184,0.7)" tick={{ fontSize: 12 }} />
            <YAxis stroke="rgba(148,163,184,0.7)" tick={{ fontSize: 12 }} width={60} />
            <Tooltip
              contentStyle={{ borderRadius: 16, borderColor: accent, background: "var(--surface)" }}
              labelStyle={{ color: "var(--text-muted)" }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={accent} fill={`url(#gradient-${dataKey})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
