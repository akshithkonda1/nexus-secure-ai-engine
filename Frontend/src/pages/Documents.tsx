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
/* Cloud provider metadata + OAuth wiring                             */
/* ------------------------------------------------------------------ */

type CloudProvider = "google-drive" | "dropbox";

interface CloudProviderMeta {
  id: CloudProvider;
  label: string;
  authPath: string; // FE → BE route to kick off OAuth
  scopes: string[];
  description: string;
}

const CLOUD_PROVIDERS: Record<CloudProvider, CloudProviderMeta> = {
  "google-drive": {
    id: "google-drive",
    label: "Google Drive",
    authPath: "/auth/connect/google-drive", // TODO: adjust to your backend route
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    description:
      "Read-only access to your Google Drive for transcripts and reference docs.",
  },
  dropbox: {
    id: "dropbox",
    label: "Dropbox",
    authPath: "/auth/connect/dropbox", // TODO: adjust to your backend route
    scopes: ["files.metadata.read"],
    description:
      "Read-only access to files and metadata in your Dropbox workspace.",
  },
};

function startOAuthFlow(provider: CloudProvider) {
  const meta = CLOUD_PROVIDERS[provider];

  // You can inspect this in dev tools while wiring the backend.
  console.debug("[ZORA OAuth] Starting auth flow:", meta);

  // Minimal “wiring”: navigate to the backend route that creates
  // an OAuth session and redirects to the provider.
  // Replace this with your real implementation when ready.
  try {
    window.location.assign(meta.authPath);
  } catch (error) {
    console.error("[ZORA OAuth] Failed to start OAuth flow", error);
    toast.error(`Could not start ${meta.label} connection. Try again.`);
  }
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export function Documents() {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useDocuments();
  const uploadDocument = useUploadDocument();

  const items = data?.items ?? EMPTY_ITEMS;

  /* ---------------------------- Filtering -------------------------- */

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(needle) ||
        item.type.toLowerCase().includes(needle),
    );
  }, [items, query]);

  /* -------------------------- Selection logic ---------------------- */

  const isSelected = (id: string) => selectedIds.includes(id);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filtered.map((item) => item.id);
    setSelectedIds(visibleIds);
  };

  const clearSelection = () => setSelectedIds([]);

  const allVisibleSelected =
    filtered.length > 0 &&
    filtered.every((item) => selectedIds.includes(item.id));

  /* -------------------------- Actions ------------------------------ */

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

  const handleDeleteDocument = (doc: DocumentItem) => {
    const confirmed = window.confirm(
      `Delete “${doc.name}”? This will remove it from your ZORA workspace.`,
    );
    if (!confirmed) return;

    // TODO: wire to real delete mutation:
    // await deleteDocument.mutateAsync({ id: doc.id });
    toast.info(`Delete for “${doc.name}” will be wired to the API here.`);
  };

  const handleAnalyzeSelected = () => {
    if (selectedIds.length === 0) return;

    const selectedDocs = filtered.filter((item) =>
      selectedIds.includes(item.id),
    );

    // TODO: when you have an analysis endpoint:
    // await analyzeWithZora.mutateAsync({ documentIds: selectedIds });
    console.debug("[ZORA] Analyze selected documents", {
      ids: selectedIds,
      docs: selectedDocs,
    });

    toast.success(
      `ZORA will analyze ${selectedIds.length} document${
        selectedIds.length === 1 ? "" : "s"
      } (API wiring goes here).`,
    );
  };

  /* ----------------------------- Render ---------------------------- */

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

        {/* CLOUD DRIVES + ANALYZE ------------------------------------- */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.75)]">
            Cloud drives
          </span>

          {/* Google Drive – locked white pill in all themes */}
          <button
            type="button"
            onClick={() => startOAuthFlow("google-drive")}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1967D2] shadow-[0_0_24px_rgba(15,23,42,0.35)] transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-[0_0_32px_rgba(15,23,42,0.5)] active:translate-y-[0px]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
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
            onClick={() => startOAuthFlow("dropbox")}
            className="inline-flex items-center gap-2 rounded-full bg-[#0C7BFF] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_30px_rgba(12,123,255,0.35)] transition-transform transition-shadow hover:translate-y-[-1px] hover:bg-[#0666D1] hover:shadow-[0_0_36px_rgba(12,123,255,0.45)] active:translate-y-[0px]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(15,23,42,0.16)]">
              <img
                src={dropboxLogoUrl}
                alt="Dropbox"
                className="h-4 w-4"
                loading="lazy"
              />
            </span>
            <span>Dropbox</span>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Analyze with ZORA */}
          <button
            type="button"
            onClick={handleAnalyzeSelected}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#3EE4FF] to-[#8B5CF6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--zora-night,3,7,17))] shadow-[0_0_30px_rgba(62,228,255,0.35)] transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Analyze with ZORA
            {selectedIds.length > 0 && (
              <span className="rounded-full bg-[rgba(3,7,17,0.15)] px-2 py-0.5 text-[0.65rem] font-semibold">
                {selectedIds.length}
              </span>
            )}
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
          <>
            {/* Bulk selection controls */}
            <div className="mt-6 flex items-center justify-between text-xs text-[rgba(var(--subtle),0.75)]">
              <div className="flex items-center gap-2">
                <input
                  id="select-all-documents"
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={() =>
                    allVisibleSelected ? clearSelection() : selectAllVisible()
                  }
                  className="h-4 w-4 cursor-pointer rounded border-[rgba(var(--border),0.55)] bg-[rgba(var(--surface),0.9)] text-[rgb(var(--brand))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--brand),0.55)]"
                />
                <label
                  htmlFor="select-all-documents"
                  className="cursor-pointer"
                >
                  Select all ({filtered.length})
                </label>
              </div>

              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-[rgba(var(--subtle),0.85)] hover:text-[rgb(var(--text))]"
                >
                  Clear selection
                </button>
              )}
            </div>

            {/* DOCUMENT LIST ------------------------------------------ */}
            <ul className="mt-3 space-y-3">
              {filtered.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[rgba(var(--border),0.25)] bg-[rgba(var(--surface),0.96)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Row checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected(doc.id)}
                        onChange={() => toggleSelection(doc.id)}
                        className="h-4 w-4 cursor-pointer rounded border-[rgba(var(--border),0.55)] bg-[rgba(var(--surface),0.9)] text-[rgb(var(--brand))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--brand),0.55)]"
                        aria-label={`Select ${doc.name} for analysis`}
                      />

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

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[rgba(var(--subtle),0.75)]">
                    <span>Updated {formatRelativeTime(doc.updatedAt)}</span>
                    <div className="flex items-center gap-2">
                      {/* Open */}
                      <button
                        type="button"
                        className="btn btn-ghost btn-quiet rounded-full border-[rgba(var(--border),0.3)] px-3 py-1.5 font-semibold text-[rgba(var(--subtle),0.85)] hover:border-[rgba(var(--brand),0.35)] hover:text-brand"
                        onClick={() =>
                          toast.info(`Opening ${doc.name} from storage soon`)
                        }
                      >
                        Open
                      </button>

                      {/* Share */}
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

                      {/* Delete */}
                      <button
                        type="button"
                        className="btn btn-ghost btn-quiet rounded-full border-[rgba(239,68,68,0.55)] px-3 py-1.5 font-semibold text-[#EF4444] hover:border-[rgba(239,68,68,0.85)] hover:bg-[rgba(239,68,68,0.06)]"
                        onClick={() => handleDeleteDocument(doc)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default Documents;
