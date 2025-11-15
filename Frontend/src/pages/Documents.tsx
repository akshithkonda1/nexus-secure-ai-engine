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

// Official SVG assets (must live in Frontend/src/assets/)
import googleDriveLogoUrl from "../assets/google-drive-1.svg";
import dropboxLogoUrl from "../assets/dropbox.svg";

const EMPTY_ITEMS: DocumentItem[] = [];

/* ------------------------------------------------------------------ */
/* EXTRA METADATA + HELPERS                                           */
/* ------------------------------------------------------------------ */

// Allow API to gradually add richer metadata without breaking UI
type DocumentMeta = DocumentItem & {
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
  source?: "local" | "google-drive" | "dropbox" | string;
  mimeType?: string;
};

function getSourceLabel(source?: DocumentMeta["source"]): string {
  if (!source) return "Local";
  switch (source) {
    case "google-drive":
      return "Google Drive";
    case "dropbox":
      return "Dropbox";
    case "local":
      return "Local";
    default:
      return source.charAt(0).toUpperCase() + source.slice(1);
  }
}

// OAuth endpoints – wire these to your backend / gateway
const GOOGLE_DRIVE_OAUTH_URL =
  import.meta.env.VITE_GOOGLE_DRIVE_OAUTH_URL ?? "/api/auth/google-drive";

const DROPBOX_OAUTH_URL =
  import.meta.env.VITE_DROPBOX_OAUTH_URL ?? "/api/auth/dropbox";

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export function Documents() {
  const [query, setQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useDocuments();
  const uploadDocument = useUploadDocument();

  // Cast to richer metadata type but stay compatible with existing API
  const items = (data?.items ?? EMPTY_ITEMS) as DocumentMeta[];

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;

    return items.filter((item) => {
      const name = item.name.toLowerCase();
      const type =
        (item.type ?? item.mimeType ?? "application/octet-stream").toLowerCase();
      return name.includes(needle) || type.includes(needle);
    });
  }, [items, query]);

  const handleUpload = async (file?: File) => {
    const source = file ?? fileInputRef.current?.files?.[0];

    if (!source) {
      toast.info("Select a file to upload to ZORA.");
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

  const handleConnectGoogleDrive = () => {
    toast.info("Redirecting to Google Drive OAuth…");
    window.location.href = GOOGLE_DRIVE_OAUTH_URL;
  };

  const handleConnectDropbox = () => {
    toast.info("Redirecting to Dropbox OAuth…");
    window.location.href = DROPBOX_OAUTH_URL;
  };

  return (
    <div className="px-[var(--page-padding)] py-6">
      <div className="card p-5">
        {/* Hidden input for local uploads */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={() => handleUpload()}
        />

        {/* HEADER ----------------------------------------------------- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[rgb(var(--text))]">
              Documents
            </h2>
            <p className="text-sm text-[rgba(var(--subtle),0.82)]">
              Connect cloud drives or upload transcripts, evidence, and
              knowledge packs.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative sm:mr-2">
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
              className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--brand))] px-4 py-2 text-sm font-semibold text-[rgb(var(--on-accent))] shadow-[0_0_30px_rgba(0,133,255,0.25)] transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-[0_0_36px_rgba(0,133,255,0.32)] hover:scale-[1.01] active:translate-y-[0px] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75"
              disabled={uploadDocument.isPending}
            >
              {uploadDocument.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Upload className="mr-2 size-4" />
              )}
              Upload
            </button>
          </div>
        </div>

        {/* CLOUD DRIVES ---------------------------------------------- */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.75)]">
            Cloud drives
          </span>

          {/* Google Drive – always white */}
          <button
            type="button"
            onClick={handleConnectGoogleDrive}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#1A73E8] shadow-[0_8px_24px_rgba(15,23,42,0.45)] transition hover:shadow-[0_10px_32px_rgba(15,23,42,0.6)]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#E3EEFF] shadow-sm">
              <img
                src={googleDriveLogoUrl}
                alt="Google Drive"
                className="h-4 w-4"
                loading="lazy"
              />
            </span>
            <span>Google Drive</span>
          </button>

          {/* Dropbox – stays blue */}
          <button
            type="button"
            onClick={handleConnectDropbox}
            className="inline-flex items-center gap-2 rounded-full bg-[#0085FF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.45)] transition hover:bg-[#0074e0] hover:shadow-[0_10px_32px_rgba(15,23,42,0.6)]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(255,255,255,0.96)] shadow-sm">
              <img
                src={dropboxLogoUrl}
                alt="Dropbox"
                className="h-4 w-4"
                loading="lazy"
              />
            </span>
            <span>Dropbox</span>
          </button>
        </div>

        {/* STATES ----------------------------------------------------- */}
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
              className="btn btn-ghost rounded-full text-brand"
            >
              <RefreshCcw
                className={`mr-2 size-4 ${
                  isRefetching ? "animate-spin" : ""
                }`}
              />
              Retry sync
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6">
            <SkeletonBlock />
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {filtered.map((item) => {
              const doc = item as DocumentMeta;
              const sourceLabel = getSourceLabel(doc.source);
              const createdLabel =
                doc.createdAt && formatRelativeTime(doc.createdAt);
              const updatedLabel =
                (doc.updatedAt || doc.createdAt) &&
                formatRelativeTime(doc.updatedAt ?? doc.createdAt!);

              return (
                <li
                  key={doc.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[rgba(var(--border),0.25)] bg-[rgba(var(--surface),0.96)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-[rgba(var(--brand),0.14)] text-brand">
                        <FolderPlus className="size-5" />
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[rgb(var(--text))]">
                          {doc.name}
                        </p>
                        <p className="text-xs text-[rgba(var(--subtle),0.7)]">
                          {doc.folder ? "Folder" : "Document"} • {doc.type}
                        </p>
                      </div>
                    </div>
                    <span className="chip chip--ok badge bg-[rgba(var(--accent-emerald),0.14)] text-[rgb(var(--accent-emerald-ink))]">
                      {formatFileSize(doc.size)}
                    </span>
                  </div>

                  {/* Metadata row ------------------------------------------------ */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[rgba(var(--subtle),0.75)]">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>
                        <span className="font-semibold">Source:</span>{" "}
                        {sourceLabel}
                      </span>
                      {doc.owner && (
                        <span>
                          <span className="font-semibold">Owner:</span>{" "}
                          {doc.owner}
                        </span>
                      )}
                      {createdLabel && (
                        <span>
                          <span className="font-semibold">Created:</span>{" "}
                          {createdLabel}
                        </span>
                      )}
                      {updatedLabel && (
                        <span>
                          <span className="font-semibold">Updated:</span>{" "}
                          {updatedLabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost btn-quiet rounded-full border-[rgba(var(--border),0.3)] px-3 py-1.5 font-semibold text-[rgba(var(--subtle),0.85)] hover:border-[rgba(var(--brand),0.35)] hover:text-brand"
                        onClick={() =>
                          toast.info(`Opening ${doc.name} from storage soon`)
                        }
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-quiet rounded-full border-[rgba(var(--status-warning),0.35)] px-3 py-1.5 font-semibold text-[rgb(var(--status-warning))] hover:border-[rgba(var(--status-warning),0.55)]"
                        onClick={() =>
                          toast.info(
                            `Share settings for ${doc.name} will live here.`,
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
