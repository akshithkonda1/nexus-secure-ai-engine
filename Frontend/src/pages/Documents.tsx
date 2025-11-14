import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CloudCog,
  FolderPlus,
  Loader2,
  RefreshCcw,
  Search,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { useDocuments, useUploadDocument } from "@/queries/documents";
import type { DocumentItem } from "@/types/models";
import { formatFileSize, formatRelativeTime } from "@/lib/formatters";
import SkeletonBlock from "@/components/SkeletonBlock";

const EMPTY_ITEMS: DocumentItem[] = [];
const SORT_KEY_STORAGE_KEY = "nexus.documents.sortKey.v1";
const SORT_DIRECTION_STORAGE_KEY = "nexus.documents.sortDirection.v1";

type SortKey = "name" | "size" | "updatedAt";
type SortDirection = "asc" | "desc";

const focusRingClass =
  "focus:outline-none focus:ring-2 focus:ring-[rgba(var(--brand),0.8)] focus:ring-offset-1 focus:ring-offset-[rgb(var(--surface))]";

const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "updatedAt", label: "Updated" },
  { key: "name", label: "Name" },
  { key: "size", label: "Size" },
];

const getUpdatedTime = (value: DocumentItem["updatedAt"]): number => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export function Documents() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading, isError, refetch, isRefetching } = useDocuments();
  const uploadDocument = useUploadDocument();

  const items = data?.items ?? EMPTY_ITEMS;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let restoredKey: SortKey | null = null;
    try {
      const storedKeyRaw = window.localStorage.getItem(SORT_KEY_STORAGE_KEY);
      if (storedKeyRaw) {
        const parsedKey = JSON.parse(storedKeyRaw) as SortKey;
        if (sortOptions.some((option) => option.key === parsedKey)) {
          restoredKey = parsedKey;
          setSortKey(parsedKey);
        }
      }
    } catch (error) {
      console.error(error);
    }

    let restoredDirection: SortDirection | null = null;
    try {
      const storedDirectionRaw = window.localStorage.getItem(
        SORT_DIRECTION_STORAGE_KEY,
      );
      if (storedDirectionRaw) {
        const parsedDirection = JSON.parse(storedDirectionRaw) as SortDirection;
        if (parsedDirection === "asc" || parsedDirection === "desc") {
          restoredDirection = parsedDirection;
          setSortDirection(parsedDirection);
        }
      }
    } catch (error) {
      console.error(error);
    }

    if (!restoredDirection) {
      const fallbackKey = restoredKey ?? "updatedAt";
      setSortDirection(fallbackKey === "updatedAt" ? "desc" : "asc");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        SORT_KEY_STORAGE_KEY,
        JSON.stringify(sortKey),
      );
    } catch (error) {
      console.error(error);
    }

    try {
      window.localStorage.setItem(
        SORT_DIRECTION_STORAGE_KEY,
        JSON.stringify(sortDirection),
      );
    } catch (error) {
      console.error(error);
    }
  }, [sortKey, sortDirection]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handle = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 200);

    return () => {
      window.clearTimeout(handle);
    };
  }, [query]);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => {
      const name = (item.name ?? "").toLowerCase();
      const type = (item.type ?? "").toLowerCase();
      const category = item?.folder ? "folder" : "document";
      return (
        name.includes(needle) ||
        type.includes(needle) ||
        category.includes(needle)
      );
    });
  }, [items, debouncedQuery]);

  const sorted = useMemo(() => {
    const directionMultiplier = sortDirection === "asc" ? 1 : -1;
    return [...filtered].sort((first, second) => {
      const nameA = (first.name ?? "").toLowerCase();
      const nameB = (second.name ?? "").toLowerCase();

      if (sortKey === "name") {
        const comparison = nameA.localeCompare(nameB);
        if (comparison !== 0) {
          return comparison * directionMultiplier;
        }
        const updatedComparison =
          getUpdatedTime(first.updatedAt) - getUpdatedTime(second.updatedAt);
        if (updatedComparison !== 0) {
          return updatedComparison * directionMultiplier;
        }
        return comparison;
      }

      if (sortKey === "size") {
        const sizeA =
          typeof first.size === "number" && Number.isFinite(first.size)
            ? first.size
            : 0;
        const sizeB =
          typeof second.size === "number" && Number.isFinite(second.size)
            ? second.size
            : 0;
        const comparison = sizeA - sizeB;
        if (comparison !== 0) {
          return comparison * directionMultiplier;
        }
        const fallbackName = nameA.localeCompare(nameB);
        if (fallbackName !== 0) {
          return fallbackName * directionMultiplier;
        }
        return 0;
      }

      const updatedComparison =
        getUpdatedTime(first.updatedAt) - getUpdatedTime(second.updatedAt);
      if (updatedComparison !== 0) {
        return updatedComparison * directionMultiplier;
      }
      return nameA.localeCompare(nameB) * directionMultiplier;
    });
  }, [filtered, sortDirection, sortKey]);

  const handleUpload = async (file?: File) => {
    const source = file ?? fileInputRef.current?.files?.[0];
    if (!source) {
      toast.info("Select a file to upload to Nexus.");
      fileInputRef.current?.click();
      return;
    }

    try {
      await uploadDocument.mutateAsync({
        name: source.name,
        size: source.size,
        type: source.type || "application/octet-stream",
      });
      toast.success(`Uploaded ${source.name}`);
      if (typeof refetch === "function") {
        try {
          await refetch();
        } catch (refreshError) {
          console.error(refreshError);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Please try again.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSortChange = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "updatedAt" ? "desc" : "asc");
  };

  const handleClearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  const handleConnectDrive = () => {
    toast.info("Drive connectors are ready once the backend issues credentials.");
  };

  const totalItems = items.length;
  const displayedItems = sorted.length;

  return (
    <div className="px-[var(--page-padding)] py-6">
      <div
        role="region"
        aria-label="Documents library"
        className="card card-hover rounded-3xl border border-[rgba(var(--border),0.25)] bg-[rgb(var(--surface))] p-5 shadow-[var(--shadow-soft)] transition dark:bg-[rgb(var(--panel))]"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={() => handleUpload()}
        />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="accent-ink text-lg font-semibold text-[rgb(var(--text))]">
              Documents
            </h2>
            <p className="text-sm text-[rgba(var(--subtle),0.82)]">
              Connect storage providers or upload transcripts, evidence, and
              knowledge packs.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[rgba(var(--subtle),0.7)]" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search documents"
                  className="input w-full pl-10 pr-12"
                  disabled={uploadDocument.isPending}
                />
                {query.trim().length > 0 ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className={`absolute right-3 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-xs text-[rgba(var(--subtle),0.75)] transition hover:text-[rgb(var(--text))] disabled:cursor-not-allowed disabled:opacity-50 ${focusRingClass}`}
                    aria-label="Clear search"
                    disabled={uploadDocument.isPending}
                  >
                    ×
                  </button>
                ) : null}
              </div>
              <div className="flex items-center gap-1 rounded-full border border-[rgba(var(--border),0.4)] bg-[rgba(var(--surface),0.65)] px-1 py-1 text-xs font-medium dark:bg-[rgba(var(--panel),0.65)]">
                {sortOptions.map((option) => {
                  const isActive = sortKey === option.key;
                  const indicator = isActive
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : null;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleSortChange(option.key)}
                      className={`${focusRingClass} relative flex items-center gap-1 rounded-full px-3 py-1 transition ${
                        isActive
                          ? "bg-[rgba(var(--brand),0.15)] text-brand"
                          : "text-[rgba(var(--subtle),0.85)] hover:text-[rgb(var(--text))]"
                      }`}
                      aria-pressed={isActive}
                    >
                      <span>{option.label}</span>
                      {indicator ? (
                        <span className="text-[0.65rem]">{indicator}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`btn btn-primary btn-neo ripple rounded-full disabled:cursor-not-allowed disabled:opacity-75 ${focusRingClass}`}
                disabled={uploadDocument.isPending}
                aria-label="Upload document"
              >
                {uploadDocument.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}{" "}
                Upload
              </button>
              <button
                type="button"
                onClick={handleConnectDrive}
                className={`btn btn-ghost btn-neo btn-quiet rounded-full text-[rgba(var(--subtle),0.85)] transition hover:text-brand disabled:cursor-not-allowed disabled:opacity-60 ${focusRingClass}`}
                disabled={uploadDocument.isPending}
              >
                <CloudCog className="size-4" /> Connect Drive
              </button>
            </div>
            {debouncedQuery.length > 0 ? (
              <p className="text-xs text-[rgba(var(--subtle),0.75)]">
                Showing {displayedItems} of {totalItems} items
              </p>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} />
            ))}
          </div>
        ) : isError ? (
          <div
            className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--surface),0.72)] p-6 text-center text-sm text-[rgb(var(--subtle))] shadow-[var(--shadow-soft)] dark:bg-[rgba(var(--panel),0.7)]"
            aria-live="polite"
          >
            <p>Documents are offline right now.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className={`btn btn-ghost btn-neo btn-quiet text-brand ${focusRingClass}`}
            >
              <RefreshCcw
                className={`size-4 ${isRefetching ? "animate-spin" : ""}`}
              />{" "}
              Retry sync
            </button>
          </div>
        ) : totalItems === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-3xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--surface),0.8)] p-10 text-center shadow-[var(--shadow-soft)] dark:bg-[rgba(var(--panel),0.7)]">
            <span className="inline-flex size-14 items-center justify-center rounded-3xl bg-[rgba(var(--brand),0.12)] text-brand">
              <FolderPlus className="size-6" />
            </span>
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-[rgb(var(--text))]">
                No documents yet
              </h3>
              <p className="max-w-sm text-sm text-[rgba(var(--subtle),0.78)]">
                Upload a file or connect storage to start building your Nexus library.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`btn btn-primary btn-neo ripple rounded-full ${focusRingClass}`}
                aria-label="Upload document"
                disabled={uploadDocument.isPending}
              >
                <Upload className="size-4" /> Upload a file
              </button>
              <button
                type="button"
                onClick={handleConnectDrive}
                className={`btn btn-ghost btn-neo btn-quiet text-[rgba(var(--subtle),0.85)] hover:text-brand ${focusRingClass}`}
                disabled={uploadDocument.isPending}
              >
                <CloudCog className="size-4" /> Connect Drive
              </button>
            </div>
          </div>
        ) : displayedItems === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--surface),0.82)] p-8 text-center shadow-[var(--shadow-soft)] dark:bg-[rgba(var(--panel),0.7)]">
            <p className="text-sm font-semibold text-[rgb(var(--text))]">
              No documents match your search.
            </p>
            <p className="text-xs text-[rgba(var(--subtle),0.75)]">
              Try a different keyword or clear the search.
            </p>
            <button
              type="button"
              onClick={handleClearSearch}
              className={`btn btn-ghost btn-neo btn-quiet rounded-full text-brand ${focusRingClass}`}
            >
              Clear search
            </button>
          </div>
        ) : (
          <ul className="mt-6 space-y-2">
            {sorted.map((item) => {
              const isFolder = Boolean(item?.folder);
              const categoryLabel = isFolder ? "Folder" : "Document";
              const displayType = item?.type || "—";
              const hasSizeValue =
                typeof item?.size === "number" && Number.isFinite(item.size);
              const fileSizeLabel = hasSizeValue
                ? formatFileSize(item.size)
                : "—";
              const updatedLabel = item?.updatedAt
                ? formatRelativeTime(item.updatedAt)
                : "—";

              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[rgba(var(--border),0.25)] bg-[rgb(var(--surface))] p-3 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] dark:bg-[rgb(var(--panel))]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[rgba(var(--brand),0.12)] text-brand">
                        <FolderPlus className="size-5" />
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[rgb(var(--text))]">
                          {item.name || "Untitled"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-[rgba(var(--subtle),0.75)]">
                          <span className="rounded-full bg-[rgba(var(--subtle),0.12)] px-2 py-0.5 font-semibold uppercase tracking-wide text-[rgba(var(--subtle),0.9)]">
                            {categoryLabel}
                          </span>
                          <span>{displayType}</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-[rgba(var(--border),0.45)] bg-[rgba(var(--surface),0.6)] px-2.5 py-1 text-[0.7rem] font-medium text-[rgba(var(--subtle),0.85)] dark:bg-[rgba(var(--panel),0.6)]">
                      {fileSizeLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[rgba(var(--subtle),0.75)]">
                    <span>Updated {updatedLabel}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`btn btn-ghost btn-neo btn-quiet rounded-full border-[rgba(var(--border),0.3)] px-3 py-1.5 font-semibold text-[rgba(var(--subtle),0.85)] hover:border-[rgba(var(--brand),0.35)] hover:text-brand ${focusRingClass}`}
                        onClick={() =>
                          toast.info(
                            `Opening ${item.name ?? "document"} from storage soon`,
                          )
                        }
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        className={`btn btn-ghost btn-neo btn-quiet rounded-full border-[rgba(var(--status-warning),0.35)] px-3 py-1.5 font-semibold text-[rgb(var(--status-warning))] hover:border-[rgba(var(--status-warning),0.55)] ${focusRingClass}`}
                        onClick={() =>
                          toast.info(
                            `Share settings for ${item.name ?? "this document"} will live here.`,
                          )
                        }
                      >
                        Share
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Documents;
