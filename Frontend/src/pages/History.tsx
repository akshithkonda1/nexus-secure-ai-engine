import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  created:
    "bg-[rgba(var(--accent-emerald),0.18)] text-[rgb(var(--accent-emerald-ink))]",
  renamed: "bg-[rgba(var(--accent-sky),0.2)] text-brand",
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

const RANGE_STORAGE_KEY = "nexus.history.range.v1";
const TYPE_STORAGE_KEY = "nexus.history.type.v1";
const LIVE_POLL_INTERVAL_MS = 60_000;

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

  if (isSameDay) {
    return "Today";
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) {
    return "Yesterday";
  }

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settingsHydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || settingsHydratedRef.current) {
      return;
    }

    let storedRange: (typeof RANGE_OPTIONS)[number] | undefined;
    let storedType: AuditEvent["type"] | "all" | undefined;

    try {
      const rawRange = window.localStorage.getItem(RANGE_STORAGE_KEY);
      if (rawRange) {
        storedRange = sanitizeStoredRange(JSON.parse(rawRange));
      }
    } catch (error) {
      console.error("Failed to parse stored range", error);
    }

    try {
      const rawType = window.localStorage.getItem(TYPE_STORAGE_KEY);
      if (rawType) {
        storedType = sanitizeStoredType(JSON.parse(rawType));
      }
    } catch (error) {
      console.error("Failed to parse stored type", error);
    }

    if (storedRange) {
      setSelectedRange(storedRange);
    }
    if (storedType) {
      setSelectedType(storedType);
    }

    settingsHydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !settingsHydratedRef.current) {
      return;
    }

    try {
      window.localStorage.setItem(
        RANGE_STORAGE_KEY,
        JSON.stringify({ label: selectedRange.label, hours: selectedRange.hours }),
      );
    } catch (error) {
      console.error("Failed to persist range", error);
    }
  }, [selectedRange]);

  useEffect(() => {
    if (typeof window === "undefined" || !settingsHydratedRef.current) {
      return;
    }

    try {
      window.localStorage.setItem(TYPE_STORAGE_KEY, JSON.stringify(selectedType));
    } catch (error) {
      console.error("Failed to persist type", error);
    }
  }, [selectedType]);

  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(searchInput.trim()), 200);
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

  const visibleEvents = useMemo(() => {
    const filteredByType =
      selectedType === "all"
        ? events
        : events.filter((event) => event.type === selectedType);

    if (!searchQuery) {
      return filteredByType;
    }

    const loweredQuery = searchQuery.toLowerCase();

    return filteredByType.filter((event) => {
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
    return visibleEvents.reduce<
      Array<{ label: string; entries: AuditEvent[] }>
    >((accumulator, event) => {
      const date = new Date(event.at);
      const label = Number.isNaN(date.getTime()) ? "Unknown" : getDayLabel(date);
      const existingGroup = accumulator.find((group) => group.label === label);

      if (existingGroup) {
        existingGroup.entries.push(event);
      } else {
        accumulator.push({ label, entries: [event] });
      }

      return accumulator;
    }, []);
  }, [visibleEvents]);

  const resetFilters = () => {
    setSelectedRange(RANGE_OPTIONS[0]);
    setSelectedType("all");
    setSearchInput("");
    setSearchQuery("");
  };

  return (
    <div className="px-[var(--page-padding)] py-6">
      <div
        className="card p-5"
        role="region"
        aria-label="Workspace activity"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[rgb(var(--text))]">
            Activity
          </h2>
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

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.75)]">
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
          <div className="ml-auto flex flex-wrap items-center gap-2 text-xs text-[rgba(var(--subtle),0.7)]">
            <label htmlFor="history-type-filter" className="sr-only">
              Event type
            </label>
            <span aria-hidden="true">Event type</span>
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

        <div className="mt-3 flex items-center">
          <label htmlFor="history-search" className="sr-only">
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
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-3" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="h-14 rounded-2xl border border-[rgba(var(--border),0.2)] bg-[rgba(var(--panel),0.6)] animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <div
            className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.45)] p-6 text-center text-sm text-[rgb(var(--subtle))]"
            aria-live="polite"
          >
            <p>We couldn&apos;t load the audit trail.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="btn btn-ghost btn-neo text-brand"
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
            <div className="flex size-16 items-center justify-center rounded-full bg-[rgba(var(--border),0.15)]" aria-hidden="true">
              <Clock className="size-7 text-[rgba(var(--subtle),0.7)]" />
            </div>
            <div className="space-y-1 text-[rgb(var(--text))]">
              <p className="text-base font-semibold">No activity yet</p>
              <p className="text-sm text-[rgba(var(--subtle),0.75)]">
                Your audit trail will appear here once work starts flowing.
              </p>
              <p className="text-xs text-[rgba(var(--subtle),0.65)]">
                Changes in Workspace, Outbox, and Chat will be logged automatically.
              </p>
            </div>
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-[rgba(var(--border),0.25)] bg-[rgba(var(--panel),0.5)] p-8 text-center text-sm text-[rgba(var(--subtle),0.8)]">
            <p className="text-base font-semibold text-[rgb(var(--text))]">
              No events match your filters
            </p>
            <p className="text-sm">
              Adjust your range, event type, or search to see more activity.
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
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-[rgba(var(--border),0.2)] text-left text-sm">
              <thead className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.7)]">
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
                    {group.entries.map((event) => (
                      <tr
                        key={event.id}
                        className="transition hover:bg-[rgba(var(--panel),0.4)]"
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <span
                              className={`chip px-2 py-1 text-[11px] font-semibold ${
                                TYPE_ACCENTS[event.type] ?? TYPE_ACCENTS.created
                              }`}
                            >
                              {formatTypeLabel(event.type)}
                            </span>
                            <span className="text-sm font-semibold text-[rgb(var(--text))]">
                              {event.details ?? "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-[rgba(var(--subtle),0.85)]">
                          {event.actor ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-[rgba(var(--subtle),0.75)]">
                          {event.sessionId ?? event.projectId ?? "workspace"}
                        </td>
                        <td className="px-4 py-2.5 text-[rgba(var(--subtle),0.7)]">
                          {formatRelativeTime(event.at)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
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
