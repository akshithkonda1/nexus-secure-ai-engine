import React, { useMemo, useRef, useState } from "react";
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

export function Documents() {
  const [query, setQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading, isError, refetch, isRefetching } = useDocuments();
  const uploadDocument = useUploadDocument();

  const items = data?.items ?? EMPTY_ITEMS;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(needle) ||
        item.type.toLowerCase().includes(needle),
    );
  }, [items, query]);

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
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Please try again.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="px-[var(--page-padding)] py-6">
      <div className="panel panel--glassy panel--hover panel--immersive panel--edge panel--alive card card-hover p-5">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={() => handleUpload()}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="accent-ink text-lg font-semibold text-[rgb(var(--text))]">
              Documents
            </h2>
            <p className="text-sm text-[rgba(var(--subtle),0.82)]">
              Connect storage providers or upload transcripts, evidence, and
              knowledge packs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[rgba(var(--subtle),0.7)]" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search documents"
                className="input w-64 pl-10 pr-4"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary btn-neo ripple rounded-full disabled:cursor-not-allowed disabled:opacity-75"
              disabled={uploadDocument.isPending}
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
              onClick={() =>
                toast.info(
                  "Drive connectors are ready once the backend issues credentials.",
                )
              }
              className="btn btn-ghost btn-neo btn-quiet rounded-full text-[rgba(var(--subtle),0.85)] hover:text-brand"
            >
              <CloudCog className="size-4" /> Connect Drive
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-3" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="panel panel--glassy panel--hover panel--immersive h-20 rounded-2xl border border-[rgba(var(--border),0.2)] bg-[rgba(var(--panel),0.6)] animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="panel panel--glassy panel--hover panel--immersive panel--alive mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.45)] p-6 text-center text-sm text-[rgb(var(--subtle))]">
            <p>Documents are offline right now.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="btn btn-ghost btn-neo btn-quiet text-brand"
            >
              <RefreshCcw
                className={`size-4 ${isRefetching ? "animate-spin" : ""}`}
              />{" "}
              Retry sync
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel panel--glassy panel--hover panel--immersive panel--alive mt-6">
            <SkeletonBlock />
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="panel panel--glassy panel--hover panel--immersive panel--alive flex flex-col gap-4 rounded-2xl border border-[rgba(var(--border),0.25)] bg-[rgba(var(--surface),0.88)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] dark:bg-[rgba(var(--panel),0.6)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-[rgba(var(--brand),0.14)] text-brand">
                      <FolderPlus className="size-5" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[rgb(var(--text))]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[rgba(var(--subtle),0.7)]">
                        {item.folder ? "Folder" : "Document"} • {item.type}
                      </p>
                    </div>
                  </div>
                  <span className="chip chip--ok badge bg-[rgba(var(--accent-emerald),0.14)] text-[rgb(var(--accent-emerald-ink))]">
                    {formatFileSize(item.size)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[rgba(var(--subtle),0.75)]">
                  <span>Updated {formatRelativeTime(item.updatedAt)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost btn-neo btn-quiet rounded-full border-[rgba(var(--border),0.3)] px-3 py-1.5 font-semibold text-[rgba(var(--subtle),0.85)] hover:border-[rgba(var(--brand),0.35)] hover:text-brand"
                      onClick={() =>
                        toast.info(`Opening ${item.name} from storage soon`)
                      }
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-neo btn-quiet rounded-full border-[rgba(var(--status-warning),0.35)] px-3 py-1.5 font-semibold text-[rgb(var(--status-warning))] hover:border-[rgba(var(--status-warning),0.55)]"
                      onClick={() =>
                        toast.info(
                          `Share settings for ${item.name} will live here.`,
                        )
                      }
                    >
                      Share
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Documents;
