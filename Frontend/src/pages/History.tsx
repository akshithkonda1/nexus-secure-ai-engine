import React, { useMemo, useState } from "react";
import { Clock, Filter, RefreshCcw } from "lucide-react";

import { useHistory } from "@/queries/history";
import type { AuditEvent } from "@/types/models";
import { formatRelativeTime } from "@/lib/formatters";

const RANGE_OPTIONS = [
  { label: "24h", hours: 24 },
  { label: "7d", hours: 24 * 7 },
  { label: "30d", hours: 24 * 30 },
] as const;

const TYPE_ACCENTS: Partial<Record<AuditEvent["type"], string>> = {
  created: "bg-[rgba(var(--accent-emerald),0.18)] text-[rgb(var(--accent-emerald-ink))]",
  renamed: "bg-[rgba(var(--accent-sky),0.2)] text-brand",
  message: "bg-[rgba(var(--accent-lilac),0.28)] text-[rgb(var(--text))]",
  archived: "bg-[rgba(var(--status-warning),0.25)] text-[rgb(var(--status-warning))]",
  restored: "bg-[rgba(var(--brand),0.18)] text-brand",
  deleted: "bg-[rgba(var(--status-critical),0.25)] text-[rgb(var(--status-critical))]",
  exported: "bg-[rgba(var(--accent-amber),0.2)] text-[rgb(var(--accent-amber-ink))]",
  modelRun: "bg-[rgba(var(--brand-soft),0.22)] text-brand",
};

function computeRange(hours: number) {
  const to = new Date();
  const from = new Date(to.getTime() - hours * 60 * 60 * 1000);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function formatTypeLabel(type: AuditEvent["type"]) {
  return type
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

const rows = [
  { when: "2m", who: "Avery", what: "Ran prompt ‘Roadmap brief’" },
  { when: "1h", who: "Jordan", what: "Uploaded 5 docs" },
  { when: "3h", who: "Avery", what: "Changed retention to 30d" },
];

export function History() {
  const [selectedRange, setSelectedRange] = useState<(typeof RANGE_OPTIONS)[number]>(RANGE_OPTIONS[0]);
  const [selectedType, setSelectedType] = useState<AuditEvent["type"] | "all">("all");
  const filters = useMemo(() => {
    const base = computeRange(selectedRange.hours);
    return {
      ...base,
      type: selectedType === "all" ? undefined : selectedType,
    };
  }, [selectedRange.hours, selectedType]);

  const { data, isLoading, isError, refetch, isRefetching } = useHistory(filters);
  const events = data?.events ?? [];

  const visibleEvents = useMemo(() => {
    if (selectedType === "all") return events;
    return events.filter((event) => event.type === selectedType);
  }, [events, selectedType]);

  return (
    <div className="px-[var(--page-padding)] py-6">
      <div className="card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Activity</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[rgba(var(--subtle),0.75)]">
            <Clock className="size-4" />
            Workspace audit trail • {visibleEvents.length} events
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.75)]">
            <Filter className="size-4" /> Range
          </div>
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setSelectedRange(option)}
              className={`chip border ${
                selectedRange.label === option.label
                  ? "border-[rgba(var(--brand),0.4)] bg-[rgba(var(--brand),0.14)] text-brand"
                  : "border-[rgba(var(--border),0.25)] bg-[rgba(var(--panel),0.5)] text-[rgba(var(--subtle),0.8)] hover:border-[rgba(var(--brand),0.25)]"
              }`}
            >
              {option.label}
            </button>
          ))}
          <div className="ml-auto flex flex-wrap items-center gap-2 text-xs text-[rgba(var(--subtle),0.7)]">
            <span>Event type</span>
            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value as AuditEvent["type"] | "all")}
              className="rounded-full border border-[rgba(var(--border),0.3)] bg-[rgba(var(--surface),0.92)] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--text))] shadow-sm focus:border-[rgba(var(--brand),0.35)] focus:outline-none"
            >
              <option value="all">All</option>
              <option value="created">Created</option>
              <option value="renamed">Renamed</option>
              <option value="message">Message</option>
              <option value="archived">Archived</option>
              <option value="restored">Restored</option>
              <option value="deleted">Deleted</option>
              <option value="exported">Exported</option>
              <option value="modelRun">Model run</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-3" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-16 rounded-2xl border border-[rgba(var(--border),0.2)] bg-[rgba(var(--panel),0.6)] animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.45)] p-6 text-center text-sm text-[rgb(var(--subtle))]">
            <p>We couldn&apos;t load the audit trail.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--brand),0.4)] px-4 py-2 text-sm font-semibold text-brand"
            >
              <RefreshCcw className={`size-4 ${isRefetching ? "animate-spin" : ""}`} /> Try again
            </button>
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-[rgba(var(--border),0.25)] bg-[rgba(var(--panel),0.5)] p-6 text-sm text-[rgba(var(--subtle),0.85)]">
            <p>No events in this window. Activity will appear as soon as requests hit the backend.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-[rgba(var(--border),0.2)] text-left text-sm">
              <thead className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.7)]">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(var(--border),0.12)]">
                {visibleEvents.map((event) => (
                  <tr key={event.id} className="transition hover:bg-[rgba(var(--panel),0.4)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`badge ${TYPE_ACCENTS[event.type] ?? TYPE_ACCENTS.created}`}>{formatTypeLabel(event.type)}</span>
                        <span className="text-sm font-semibold text-[rgb(var(--text))]">{event.details ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[rgba(var(--subtle),0.85)]">{event.actor}</td>
                    <td className="px-4 py-3 text-[rgba(var(--subtle),0.75)]">
                      {event.sessionId ?? event.projectId ?? "workspace"}
                    </td>
                    <td className="px-4 py-3 text-[rgba(var(--subtle),0.7)]">{formatRelativeTime(event.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
