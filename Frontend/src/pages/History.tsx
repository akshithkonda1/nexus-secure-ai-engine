import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Archive,
  Clock,
  FileText,
  Filter,
  MessageCircle,
  RefreshCcw,
  Sparkles,
  Trash2,
  Undo2,
  UploadCloud,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useHistory } from "@/queries/history";
import type { AuditEvent } from "@/types/models";
import { formatRelativeTime } from "@/lib/formatters";

const RANGE_OPTIONS = [
  { label: "24h", hours: 24 },
  { label: "7d", hours: 24 * 7 },
  { label: "30d", hours: 24 * 30 },
] as const;

const QUICK_TYPE_FILTERS: Array<{
  label: string;
  type: AuditEvent["type"] | "all";
}> = [
  { label: "All events", type: "all" },
  { label: "Model runs", type: "modelRun" },
  { label: "Messages", type: "message" },
  { label: "Workspace changes", type: "created" }, // semantic anchor, still “all” via select
];

const TYPE_ACCENTS: Partial<Record<AuditEvent["type"], string>> = {
  created:
    "bg-[rgba(var(--accent-emerald),0.18)] text-[rgb(var(--accent-emerald-ink))]",
  renamed: "bg-[rgba(var(--accent-sky),0.22)] text-brand",
  message: "bg-[rgba(var(--accent-lilac),0.28)] text-[rgb(var(--text))]",
  archived:
    "bg-[rgba(var(--status-warning),0.25)] text-[rgb(var(--status-warning))]",
  restored: "bg-[rgba(var(--brand),0.18)] text-brand",
  deleted:
    "bg-[rgba(var(--status-critical),0.25)] text-[rgb(var(--status-critical))]",
  exported:
    "bg-[rgba(var(--accent-amber),0.2)] text-[rgb(var(--accent-amber-ink))]",
  modelRun: "bg-[rgba(var(--brand-soft),0.22)] text-brand",
};

const TYPE_ICONS: Partial<Record<AuditEvent["type"], LucideIcon>> = {
  created: Sparkles,
  renamed: FileText,
  message: MessageCircle,
  archived: Archive,
  restored: Undo2,
  deleted: Trash2,
  exported: UploadCloud,
  modelRun: Sparkles,
};

const RANGE_STORAGE_KEY = "nexus.history.range.v1";
const TYPE_STORAGE_KEY = "nexus.history.type.v1";
const LIVE_POLL_INTERVAL_MS = 60_000;
const NEW_EVENT_WINDOW_MS = 5 * 60_000;

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

function getDayLabel(date: Date) {
  const today = new Date();
  const isSameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (isSameDay) return "Today";

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) return "Yesterday";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: today.getFullYear() === date.getFullYear() ? undefined : "numeric",
  }).format(date);
}

function sanitizeStoredRange(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "label" in value &&
    "hours" in value
  ) {
    const match = RANGE_OPTIONS.find(
      (option) => option.label === (value as { label: string }).label,
    );
    return match ?? RANGE_OPTIONS[0];
  }
  return RANGE_OPTIONS[0];
}

function sanitizeStoredType(value: unknown) {
  if (typeof value === "string") {
    if (value === "all") return "all";
    return [
      "created",
      "renamed",
      "message",
      "archived",
      "restored",
      "deleted",
      "exported",
      "modelRun",
    ].includes(value)
      ? (value as AuditEvent["type"])
      : "all";
  }
  return "all";
}

export function History() {
  const [selectedRange, setSelectedRange] = useState<
    (typeof RANGE_OPTIONS)[number]
  >(RANGE_OPTIONS[0]);
  const [selectedType, setSelectedType] = useState<AuditEvent["type"] | "all">(
    "all",
  );
  const [isLive, setIsLive] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settingsHydratedRef = useRef(false);

  // Hydrate filters from localStorage once
  useEffect(() => {
    if (typeof window === "undefined" || settingsHydratedRef.current) return;

    let storedRange: (typeof RANGE_OPTIONS)[number] | undefined;
    let storedType: AuditEvent["type"] | "all" | undefined;

    try {
      const rawRange = window.localStorage.getItem(RANGE_STORAGE_KEY);
      if (rawRange) storedRange = sanitizeStoredRange(JSON.parse(rawRange));
    } catch (error) {
      console.error("Failed to parse stored range", error);
    }

    try {
      const rawType = window.localStorage.getItem(TYPE_STORAGE_KEY);
      if (rawType) storedType = sanitizeStoredType(JSON.parse(rawType));
    } catch (error) {
      console.error("Failed to parse stored type", error);
    }

    if (storedRange) setSelectedRange(storedRange);
    if (storedType) setSelectedType(storedType);

    settingsHydratedRef.current = true;
  }, []);

  // Persist range
  useEffect(() => {
    if (typeof window === "undefined" || !settingsHydratedRef.current) return;
    try {
      window.localStorage.setItem(
        RANGE_STORAGE_KEY,
        JSON.stringify({
          label: selectedRange.label,
          hours: selectedRange.hours,
        }),
      );
    } catch (error) {
      console.error("Failed to persist range", error);
    }
  }, [selectedRange]);

  // Persist type
  useEffect(() => {
    if (typeof window === "undefined" || !settingsHydratedRef.current) return;
    try {
      window.localStorage.setItem(TYPE_STORAGE_KEY, JSON.stringify(selectedType));
    } catch (error) {
      console.error("Failed to persist type", error);
    }
  }, [selectedType]);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(
      () => setSearchQuery(searchInput.trim()),
      200,
    );
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const filters = useMemo(() => {
    const base = computeRange(selectedRange.hours);
    return {
      ...base,
      type: selectedType === "all" ? undefined : selectedType,
    };
  }, [selectedRange.hours, selectedType]);

  const { data, isLoading, isError, refetch, isRefetching } =
    useHistory(filters);

  const events = data?.events ?? [];
  const now = Date.now();

  // Live polling
  useEffect(() => {
    if (!isLive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      refetch();
    }, LIVE_POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLive, refetch]);

  // Quick stats
  const stats = useMemo(() => {
    if (!events.length) {
      return {
        total: 0,
        modelRuns: 0,
        sessions: 0,
        actors: 0,
      };
    }

    const sessions = new Set<string>();
    const actors = new Set<string>();
    let modelRuns = 0;

    for (const event of events) {
      if (event.type === "modelRun") modelRuns += 1;
      if (event.sessionId) sessions.add(event.sessionId);
      if (event.actor) actors.add(event.actor);
    }

    return {
      total: events.length,
      modelRuns,
      sessions: sessions.size,
      actors: actors.size,
    };
  }, [events]);

  const visibleEvents = useMemo(() => {
    const byType =
      selectedType === "all"
        ? events
        : events.filter((event) => event.type === selectedType);

    if (!searchQuery) {
      return byType;
    }

    const loweredQuery = searchQuery.toLowerCase();

    return byType.filter((event) => {
      const details = event.details ?? "";
      const actor = event.actor ?? "";
      const resource = event.sessionId ?? event.projectId ?? "";
      const typeLabel = formatTypeLabel(event.type);
      return [details, actor, resource, typeLabel]
        .join(" ")
        .toLowerCase()
        .includes(loweredQuery);
    });
  }, [events, selectedType, searchQuery]);

  const groupedEvents = useMemo(() => {
    if (visibleEvents.length === 0) return [];

    // newest → oldest
    const sorted = [...visibleEvents].sort(
      (a, b) =>
        new Date(b.at).getTime() - new Date(a.at).getTime(),
    );

    const groupsMap = new Map<string, AuditEvent[]>();

    for (const event of sorted) {
      const date = new Date(event.at);
      const label = Number.isNaN(date.getTime())
        ? "Unknown"
        : getDayLabel(date);
      const existing = groupsMap.get(label);
      if (existing) existing.push(event);
      else groupsMap.set(label, [event]);
    }

    return Array.from(groupsMap.entries()).map(([label, entries]) => ({
      label,
      entries,
    }));
  }, [visibleEvents]);

  const resetFilters = () => {
    setSelectedRange(RANGE_OPTIONS[0]);
    setSelectedType("all");
    setSearchInput("");
    setSearchQuery("");
    setExpandedEventId(null);
  };

  const handleEventClick = (id: string) => {
    setExpandedEventId((current) => (current === id ? null : id));
  };

  const renderActor = (actor?: string | null) => {
    if (!actor) return "—";

    if (actor.toLowerCase() === "you") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--accent-emerald),0.16)] px-2 py-0.5 text-[11px] font-semibold text-[rgb(var(--accent-emerald-ink))]">
          <span className="size-1.5 rounded-full bg-[rgb(var(--accent-emerald))]" />
          You
        </span>
      );
    }

    if (actor.toLowerCase() === "system") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--border),0.25)] px-2 py-0.5 text-[11px] font-semibold text-[rgba(var(--subtle),0.95)]">
          <span className="size-1.5 rounded-full bg-[rgba(var(--subtle),0.6)]" />
          System
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-[rgba(var(--panel),0.85)] px-2 py-0.5 text-[11px] font-medium text-[rgba(var(--subtle),0.95)]">
        {actor}
      </span>
    );
  };

  const renderEventBadge = (event: AuditEvent) => {
    const accent =
      TYPE_ACCENTS[event.type] ?? TYPE_ACCENTS.created ?? "";
    const Icon = TYPE_ICONS[event.type];

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${accent}`}
      >
        {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
        {formatTypeLabel(event.type)}
      </span>
    );
  };

  return (
    <div className="px-[var(--page-padding)] py-6">
      <div
        className="card p-5"
        role="region"
        aria-label="Workspace activity"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[rgb(var(--text))]">
              Activity
            </h2>
            <p className="mt-1 text-xs text-[rgba(var(--subtle),0.8)]">
              Live audit trail for model runs, workspace changes, and messages
              across your Zora workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[rgba(var(--subtle),0.75)]">
            <div className="flex items-center gap-2">
              <Clock className="size-4" aria-hidden="true" />
              <span>
                Workspace audit trail • {visibleEvents.length} events
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLive((prev) => !prev)}
              className={`flex items-center gap-2 rounded-full border border-[rgba(var(--border),0.3)] px-3 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[rgba(var(--brand),0.65)] focus:ring-offset-1 focus:ring-offset-[rgb(var(--surface))] ${
                isLive
                  ? "bg-[rgba(var(--accent-emerald),0.15)] text-[rgb(var(--accent-emerald-ink))]"
                  : "bg-[rgba(var(--border),0.18)] text-[rgba(var(--subtle),0.9)]"
              }`}
              aria-pressed={isLive}
            >
              <span
                className={`size-2.5 rounded-full ${
                  isLive
                    ? "bg-[rgb(var(--accent-emerald))]"
                    : "bg-[rgba(var(--subtle),0.5)]"
                }`}
              />
              {isLive ? "Live" : "Paused"}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.7)] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(var(--subtle),0.8)]">
              Total events
            </p>
            <p className="mt-1 text-lg font-semibold text-[rgb(var(--text))]">
              {stats.total}
            </p>
          </div>
          <div className="rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.7)] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(var(--subtle),0.8)]">
              Model runs
            </p>
            <p className="mt-1 text-lg font-semibold text-[rgb(var(--text))]">
              {stats.modelRuns}
            </p>
          </div>
          <div className="rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.7)] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(var(--subtle),0.8)]">
              Sessions
            </p>
            <p className="mt-1 text-lg font-semibold text-[rgb(var(--text))]">
              {stats.sessions}
            </p>
          </div>
          <div className="rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.7)] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(var(--subtle),0.8)]">
              Actors
            </p>
            <p className="mt-1 text-lg font-semibold text-[rgb(var(--text))]">
              {stats.actors}
            </p>
          </div>
        </div>

        {/* Filters toolbar */}
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.75)]">
              <Filter className="size-4" aria-hidden="true" /> Range
            </div>
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setSelectedRange(option)}
                className={`chip border px-3 py-1 text-xs transition focus:outline-none focus:ring-2 focus:ring-[rgba(var(--brand),0.65)] focus:ring-offset-1 focus:ring-offset-[rgb(var(--surface))] ${
                  selectedRange.label === option.label
                    ? "border-[rgba(var(--brand),0.4)] bg-[rgba(var(--brand),0.14)] text-brand"
                    : "border-[rgba(var(--border),0.25)] bg-[rgba(var(--panel),0.5)] text-[rgba(var(--subtle),0.8)] hover:border-[rgba(var(--brand),0.25)]"
                }`}
                aria-pressed={selectedRange.label === option.label}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[rgba(var(--subtle),0.7)]">
            {/* Quick type filters */}
            <div className="flex flex-wrap items-center gap-1">
              {QUICK_TYPE_FILTERS.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => {
                    setSelectedType(filter.type);
                    setExpandedEventId(null);
                  }}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    selectedType === filter.type || (filter.type === "all" && selectedType === "all")
                      ? "bg-[rgba(var(--brand-soft),0.24)] text-brand"
                      : "bg-[rgba(var(--panel),0.7)] text-[rgba(var(--subtle),0.9)] hover:bg-[rgba(var(--panel),0.9)]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px self-stretch bg-[rgba(var(--border),0.5)]" />

            <label htmlFor="history-type-filter" className="sr-only">
              Event type
            </label>
            <select
              id="history-type-filter"
              value={selectedType}
              onChange={(event) =>
                setSelectedType(
                  event.target.value as AuditEvent["type"] | "all",
                )
              }
              className="rounded-full border border-[rgba(var(--border),0.3)] bg-[rgba(var(--surface),0.92)] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--text))] shadow-sm transition focus:border-[rgba(var(--brand),0.35)] focus:outline-none"
            >
              <option value="all">All types</option>
              <option value="created">Created</option>
              <option value="renamed">Renamed</option>
              <option value="message">Message</option>
              <option value="archived">Archived</option>
              <option value="restored">Restored</option>
              <option value="deleted">Deleted</option>
              <option value="exported">Exported</option>
              <option value="modelRun">Model run</option>
            </select>

            <button
              type="button"
              onClick={() => refetch()}
              className="flex items-center gap-1 rounded-full border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-2.5 py-1 text-[11px] font-semibold text-[rgba(var(--subtle),0.95)] hover:border-[rgba(var(--brand),0.45)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--brand),0.65)] focus:ring-offset-1 focus:ring-offset-[rgb(var(--surface))]"
            >
              <RefreshCcw
                className={`size-3.5 ${isRefetching ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label
            htmlFor="history-search"
            className="sr-only"
          >
            Search events
          </label>
          <div className="relative w-full sm:max-w-md">
            <input
              id="history-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search events (details, actor, resource)…"
              className="w-full rounded-full border border-[rgba(var(--border),0.3)] bg-[rgba(var(--surface),0.9)] px-4 py-2 text-sm text-[rgb(var(--text))] shadow-sm focus:border-[rgba(var(--brand),0.4)] focus:outline-none"
            />
            {searchInput.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-semibold text-brand focus:outline-none focus:ring-2 focus:ring-[rgba(var(--brand),0.65)] focus:ring-offset-1 focus:ring-offset-[rgb(var(--surface))]"
              >
                Clear
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-1 inline-flex items-center justify-center rounded-full border border-[rgba(var(--brand),0.4)] bg-[rgba(var(--brand),0.12)] px-4 py-1.5 text-xs font-semibold text-brand transition hover:border-[rgba(var(--brand),0.6)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--brand),0.65)] focus:ring-offset-1 focus:ring-offset-[rgb(var(--surface))] sm:mt-0"
          >
            Reset filters
          </button>
        </div>

        {/* States */}
        {isLoading ? (
          <div className="mt-6 space-y-3" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div
                key={index}
                className="h-14 rounded-2xl border border-[rgba(var(--border),0.2)] bg-[rgba(var(--panel),0.6)] animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <div
            className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.45)] p-6 text-center text-sm text-[rgb(var(--subtle))]"
            aria-live="polite"
          >
            <p className="text-base font-semibold text-[rgb(var(--text))]">
              We couldn&apos;t load the audit trail.
            </p>
            <p className="text-xs text-[rgba(var(--subtle),0.75)]">
              Check your connection, then try again.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="btn btn-ghost btn-neo mt-1 text-brand"
            >
              <RefreshCcw
                className={`size-4 ${isRefetching ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Try again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-[rgba(var(--border),0.25)] bg-[rgba(var(--panel),0.55)] p-10 text-center text-sm text-[rgba(var(--subtle),0.85)]">
            <div
              className="flex size-16 items-center justify-center rounded-full bg-[rgba(var(--border),0.15)]"
              aria-hidden="true"
            >
              <Clock className="size-7 text-[rgba(var(--subtle),0.7)]" />
            </div>
            <div className="space-y-1 text-[rgb(var(--text))]">
              <p className="text-base font-semibold">No activity yet</p>
              <p className="text-sm text-[rgba(var(--subtle),0.75)]">
                Your audit trail will appear here once work starts flowing.
              </p>
              <p className="text-xs text-[rgba(var(--subtle),0.65)]">
                Model runs, workspace changes, and chat messages will be logged
                automatically.
              </p>
            </div>
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-[rgba(var(--border),0.25)] bg-[rgba(var(--panel),0.5)] p-8 text-center text-sm text-[rgba(var(--subtle),0.8)]">
            <p className="text-base font-semibold text-[rgb(var(--text))]">
              No events match your filters
            </p>
            <p className="text-sm">
              Loosen your range, event type, or search to see more activity.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-[rgba(var(--brand),0.4)] bg-[rgba(var(--brand),0.12)] px-4 py-2 text-sm font-semibold text-brand transition hover:border-[rgba(var(--brand),0.55)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--brand),0.65)] focus:ring-offset-1 focus:ring-offset-[rgb(var(--surface))]"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop: table */}
            <div className="mt-6 hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-[rgba(var(--border),0.2)] text-left text-sm">
                <thead className="sticky top-0 z-[1] bg-[rgba(var(--surface),0.97)] text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.7)] backdrop-blur">
                  <tr>
                    <th scope="col" className="px-4 py-2.5">
                      Event
                    </th>
                    <th scope="col" className="px-4 py-2.5">
                      Actor
                    </th>
                    <th scope="col" className="px-4 py-2.5">
                      Resource
                    </th>
                    <th scope="col" className="px-4 py-2.5">
                      When
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(var(--border),0.12)]">
                  {groupedEvents.map((group) => (
                    <React.Fragment key={group.label}>
                      <tr className="bg-[rgba(var(--panel),0.5)]">
                        <td
                          colSpan={4}
                          className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.9)]"
                        >
                          {group.label}
                        </td>
                      </tr>
                      {group.entries.map((event) => {
                        const createdAt = new Date(event.at);
                        const isNew =
                          now - createdAt.getTime() < NEW_EVENT_WINDOW_MS;
                        const resource =
                          event.sessionId ?? event.projectId ?? "workspace";
                        const isExpanded = expandedEventId === event.id;

                        return (
                          <React.Fragment key={event.id}>
                            <tr
                              onClick={() => handleEventClick(event.id)}
                              className={`cursor-pointer transition ${
                                isExpanded
                                  ? "bg-[rgba(var(--panel),0.55)]"
                                  : "hover:bg-[rgba(var(--panel),0.4)]"
                              }`}
                              aria-expanded={isExpanded}
                            >
                              <td className="px-4 py-2.5">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-3">
                                    {renderEventBadge(event)}
                                    <span className="text-sm font-semibold text-[rgb(var(--text))]">
                                      {event.details ?? "—"}
                                    </span>
                                    {isNew && (
                                      <span className="rounded-full bg-[rgba(var(--accent-emerald),0.18)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[rgb(var(--accent-emerald-ink))]">
                                        New
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                                    {resource}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-2.5">
                                {renderActor(event.actor)}
                              </td>
                              <td className="px-4 py-2.5 text-[rgba(var(--subtle),0.8)]">
                                {event.sessionId ?? event.projectId ?? "workspace"}
                              </td>
                              <td className="px-4 py-2.5 text-[rgba(var(--subtle),0.7)]">
                                {formatRelativeTime(event.at)}
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-4 pb-3 pt-0 text-xs text-[rgba(var(--subtle),0.9)]"
                                >
                                  <div className="mt-1 rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.75)] p-3">
                                    <div className="mb-2 flex flex-wrap gap-4 text-[11px]">
                                      <div>
                                        <span className="font-semibold">
                                          Exact time:
                                        </span>{" "}
                                        {createdAt.toLocaleString()}
                                      </div>
                                      <div>
                                        <span className="font-semibold">
                                          Resource:
                                        </span>{" "}
                                        {resource}
                                      </div>
                                      {event.actor ? (
                                        <div>
                                          <span className="font-semibold">
                                            Actor:
                                          </span>{" "}
                                          {event.actor}
                                        </div>
                                      ) : null}
                                    </div>
                                    <pre className="max-h-60 overflow-auto rounded-xl bg-[rgba(var(--bg),0.9)] p-2 text-[11px] font-mono leading-snug text-[rgba(var(--subtle),0.95)]">
                                      {JSON.stringify(event, null, 2)}
                                    </pre>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: card timeline */}
            <div className="mt-6 space-y-4 md:hidden">
              {groupedEvents.map((group) => (
                <div key={group.label}>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.9)]">
                    {group.label}
                  </div>
                  <div className="space-y-3">
                    {group.entries.map((event) => {
                      const createdAt = new Date(event.at);
                      const isNew =
                        now - createdAt.getTime() < NEW_EVENT_WINDOW_MS;
                      const resource =
                        event.sessionId ?? event.projectId ?? "workspace";
                      const isExpanded = expandedEventId === event.id;

                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => handleEventClick(event.id)}
                          className="w-full rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.8)] p-3 text-left transition hover:border-[rgba(var(--brand),0.45)]"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1 h-full w-px rounded-full bg-[rgba(var(--border),0.6)]" />
                            <div className="flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {renderEventBadge(event)}
                                {isNew && (
                                  <span className="rounded-full bg-[rgba(var(--accent-emerald),0.18)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[rgb(var(--accent-emerald-ink))]">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-[rgb(var(--text))]">
                                {event.details ?? "—"}
                              </p>
                              <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                                {resource}
                              </p>
                              <div className="mt-1 flex items-center justify-between text-[11px] text-[rgba(var(--subtle),0.8)]">
                                <span>{renderActor(event.actor)}</span>
                                <span>{formatRelativeTime(event.at)}</span>
                              </div>
                              {isExpanded && (
                                <div className="mt-2 rounded-xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--surface),0.9)] p-2">
                                  <p className="mb-1 text-[10px] font-semibold text-[rgba(var(--subtle),0.9)]">
                                    Event payload
                                  </p>
                                  <pre className="max-h-52 overflow-auto rounded-lg bg-[rgba(var(--bg),0.9)] p-2 text-[10px] font-mono leading-snug text-[rgba(var(--subtle),0.95)]">
                                    {JSON.stringify(event, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default History;
