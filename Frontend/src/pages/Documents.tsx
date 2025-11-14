import React, { useMemo, useRef, useState } from "react";
import {
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

/* ------------------------------------------------------------------ */
/* Brand Logos                                                        */
/* ------------------------------------------------------------------ */

const GoogleDriveLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M7.2 3L3 10l3.6 6.2L10.8 9 7.2 3z"
      fill="#0F9D58"
    />
    <path
      d="M16.8 3H7.2L10.8 9h9.6L16.8 3z"
      fill="#4285F4"
    />
    <path
      d="M21 10h-9.6L6.6 16.2 10.8 23H19l2-3.5L21 10z"
      fill="#F4B400"
    />
    <path
      d="M3 10L2 13.5 5 21h5.8L6.6 16.2 3 10z"
      fill="#DB4437"
    />
  </svg>
);

const DropboxLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M7 3L3 5.7l4 2.7 4-2.7L7 3zm10 0l-4 2.7 4 2.7 4-2.7L17 3zM7 11.1L3 13.8l4 2.7 4-2.7-4-2.7zm10 0l-4 2.7 4 2.7 4-2.7-4-2.7z"
      fill="#0061FF"
    />
    <path
      d="M11 14.5L7 17.2l4 2.6 4-2.6-4-2.7z"
      fill="#0061FF"
      opacity="0.9"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

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

  const handleConnectGoogle = () => {
    toast.info(
      "Google Drive connector will be available once backend credentials are configured.",
    );
  };

  const handleConnectDropbox = () => {
    toast.info(
      "Dropbox connector will be available once backend credentials are configured.",
    );
  };

  return (
    <div className="px-[var(--page-padding)] py-6">
      <div className="card rounded-3xl border border-[rgba(var(--border),0.45)] bg-[rgb(var(--surface))] p-5 shadow-[var(--elev-1)]">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={() => handleUpload()}
        />

        {/* HEADER */}
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
            {/* Search */}
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

            {/* Upload */}
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

            {/* Google Drive */}
            <button
              type="button"
              onClick={handleConnectGoogle}
              className="btn btn-ghost btn-neo btn-quiet flex items-center gap-2 rounded-full text-[rgba(var(--subtle),0.9)] hover:text-brand"
            >
              <GoogleDriveLogo className="h-4 w-4" />
              <span>Google Drive</span>
            </button>

            {/* Dropbox */}
            <button
              type="button"
              onClick={handleConnectDropbox}
              className="btn btn-ghost btn-neo btn-quiet flex items-center gap-2 rounded-full text-[rgba(var(--subtle),0.9)] hover:text-brand"
            >
              <DropboxLogo className="h-4 w-4" />
              <span>Dropbox</span>
            </button>
          </div>
        </div>

        {/* BODY */}
        {isLoading ? (
          <div className="mt-6 space-y-3" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-20 rounded-2xl border border-[rgba(var(--border),0.2)] bg-[rgba(var(--panel),0.6)] animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.45)] p-6 text-center text-sm text-[rgb(var(--subtle))]">
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
          <div className="mt-6">
            <SkeletonBlock />
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-[rgba(var(--border),0.25)] bg-[rgba(var(--surface),0.96)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] dark:bg-[rgba(var(--panel),0.9)]"
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
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[rgba(var(--subtle),0.7)]">
                        <span className="inline-flex items-center rounded-full bg-[rgba(var(--panel),0.9)] px-2 py-0.5">
                          {item.folder ? "Folder" : "Document"}
                        </span>
                        <span>{item.type}</span>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-[rgba(var(--border),0.4)] bg-[rgba(var(--panel),0.8)] px-2.5 py-1 text-[10px] font-medium text-[rgba(var(--subtle),0.9)]">
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
