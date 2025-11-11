import { useMemo, useState } from "react";
import { FilePlus, FolderPlus, Search, Upload } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { useDocuments, useUploadDocument } from "@/queries/documents";
import type { DocumentItem } from "@/types/models";
import { toast } from "sonner";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

const EMPTY_DOCUMENTS: DocumentItem[] = [];

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useDocuments();
  const uploadDoc = useUploadDocument();

  const items = data?.items ?? EMPTY_DOCUMENTS;
  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return items.filter((item) =>
      normalized
        ? item.name.toLowerCase().includes(normalized) || item.type.toLowerCase().includes(normalized)
        : true,
    );
  }, [items, search]);

  const handleUpload = async () => {
    const name = `Mock upload ${Math.floor(Math.random() * 999)}`;
    await uploadDoc
      .mutateAsync({ name, size: Math.floor(Math.random() * 500_000) + 50_000, type: "text/markdown" })
      .then(() => toast.success(`Uploaded ${name}`))
      .catch(() => toast.error("Upload failed"));
  };

  const handleNewFolder = () => {
    toast.info("Folders will sync with your storage backend soon.");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Documents"
        description="Manage transcripts, attachments, and guardrail evidence with in a way that is easy to use."
      />

      <section className="rounded-3xl border border-app bg-panel panel panel--glassy panel--hover p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-ink">Workspace library</h2>
            <p className="text-sm text-muted">Search transcripts, upload evidence, or create folders.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleUpload}
              className="btn btn-primary inline-flex items-center gap-2 rounded-full bg-trustBlue px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
            >
              <Upload className="h-4 w-4" aria-hidden="true" /> Upload
            </button>
            <button
              type="button"
              onClick={handleNewFolder}
              className="btn btn-ghost inline-flex items-center gap-2 rounded-full border border-app px-4 py-2 text-sm font-semibold text-muted transition hover:border-trustBlue/60 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
            >
              <FolderPlus className="h-4 w-4" aria-hidden="true" /> New folder
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search documents"
              className="input h-10 w-full rounded-full border border-app bg-app px-9 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
            />
          </div>
          <span className="text-xs text-muted">{filtered.length} items</span>
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-3" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16" />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-app/80 text-left text-sm text-muted">
              <thead className="uppercase tracking-[0.2em] text-xs text-muted">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app/50">
                {filtered.map((item) => (
                  <tr key={item.id} className="transition hover:bg-app/40">
                    <td className="px-4 py-3 text-ink">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-trustBlue/10 text-trustBlue">
                          <FilePlus className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-ink">{item.name}</p>
                          <p className="text-xs text-muted">{item.folder ? "Folder" : "Document"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.type}</td>
                    <td className="px-4 py-3">{formatSize(item.size)}</td>
                    <td className="px-4 py-3">{new Date(item.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => toast.info(`Rename ${item.name}`)}
                          className="rounded-full border border-app px-3 py-1 text-muted transition hover:border-trustBlue/60 hover:text-ink"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.info(`Move ${item.name}`)}
                          className="rounded-full border border-app px-3 py-1 text-muted transition hover:border-trustBlue/60 hover:text-ink"
                        >
                          Move
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.success(`Deleted ${item.name}`)}
                          className="rounded-full border border-app px-3 py-1 text-muted transition hover:border-red-500/60 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No documents"
              description="Upload transcripts or create folders to get started."
            />
          </div>
        )}
      </section>
    </div>
  );
}
