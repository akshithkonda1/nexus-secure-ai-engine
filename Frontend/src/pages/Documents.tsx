import { useMemo, useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { useLocalStore } from "@/hooks/useLocalStore";
import { formatBytes } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, Trash2 } from "lucide-react";

type DocumentCategory = "media" | "documents" | "photos";

type DocumentEntry = {
  id: string;
  name: string;
  size: number;
  type: string;
  category: DocumentCategory;
  uploadedAt: number;
  expiresAt: number;
};

const categoryMeta: Record<DocumentCategory, { title: string; description: string }> = {
  media: {
    title: "Media",
    description: "Audio + video assets used for prompt grounding."
  },
  documents: {
    title: "Documents",
    description: "PDFs, briefs, specs kept in the secure vault."
  },
  photos: {
    title: "Photos",
    description: "Screenshots, whiteboards, visual context."
  }
};

const documentKey = "nexus.vault";

export function Documents() {
  const [entries, setEntries] = useLocalStore<DocumentEntry[]>(documentKey, () => []);
  const [openSections, setOpenSections] = useState<Record<DocumentCategory, boolean>>({
    media: true,
    documents: true,
    photos: false
  });
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const grouped = useMemo(() => {
    return entries.reduce<Record<DocumentCategory, DocumentEntry[]>>(
      (acc, entry) => {
        acc[entry.category] = acc[entry.category] || [];
        acc[entry.category].push(entry);
        acc[entry.category].sort((a, b) => b.uploadedAt - a.uploadedAt);
        return acc;
      },
      { media: [], documents: [], photos: [] }
    );
  }, [entries]);

  function handleUpload(category: DocumentCategory, files: File[]) {
    const now = Date.now();
    const additions = files.map<DocumentEntry>((file) => {
      const id = crypto.randomUUID();
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviews((prev) => ({ ...prev, [id]: url }));
      }
      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        uploadedAt: now,
        expiresAt: now + 30 * 24 * 60 * 60 * 1000
      };
    });
    setEntries((prev) => [...additions, ...prev]);
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    setPreviews((prev) => {
      const next = { ...prev };
      if (next[id]) URL.revokeObjectURL(next[id]);
      delete next[id];
      return next;
    });
  }

  function daysRemaining(entry: DocumentEntry) {
    const remaining = entry.expiresAt - Date.now();
    return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
  }

  return (
    <div className="space-y-10 pt-6">
      {(Object.keys(categoryMeta) as DocumentCategory[]).map((category) => {
        const meta = categoryMeta[category];
        const files = grouped[category];
        const open = openSections[category];
        return (
          <div
            key={category}
            className="rounded-3xl border border-[rgba(255,255,255,0.5)] bg-white/70 shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/5"
          >
            <button
              onClick={() => setOpenSections((prev) => ({ ...prev, [category]: !prev[category] }))}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--text))]">{meta.title}</h2>
                <p className="text-sm text-[rgb(var(--text)/0.6)]">{meta.description}</p>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[color:var(--brand)] shadow-inner dark:bg-white/10">
                {files.length} file{files.length === 1 ? "" : "s"}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="section"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-[rgba(255,255,255,0.4)] px-6 pb-6 pt-4 dark:border-white/10"
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <div className="space-y-4">
                      {files.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-[rgba(0,133,255,0.18)] bg-white/50 px-6 py-12 text-center text-sm text-[rgb(var(--text)/0.55)] shadow-inner dark:border-white/10 dark:bg-white/5">
                          Nothing here yet. Drop files on the right.
                        </div>
                      ) : (
                        <div className="grid gap-3 md:grid-cols-2">
                          {files.map((file) => {
                            const days = daysRemaining(file);
                            const preview = previews[file.id];
                            return (
                              <div
                                key={file.id}
                                className="group relative overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.5)] bg-white/80 p-4 shadow-soft transition hover:shadow-glow dark:border-white/10 dark:bg-white/10"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[rgb(var(--text))]">{file.name}</p>
                                    <p className="text-xs text-[rgb(var(--text)/0.55)]">{formatBytes(file.size)} · {file.type || "Unknown"}</p>
                                  </div>
                                  <button
                                    onClick={() => handleDelete(file.id)}
                                    className="rounded-full border border-transparent bg-white/70 p-2 text-[rgb(var(--text)/0.5)] transition hover:border-red-400 hover:text-red-500 dark:bg-white/10"
                                    aria-label="Delete file"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="mt-3 overflow-hidden rounded-2xl border border-[rgba(0,133,255,0.18)] bg-white/70 shadow-inner dark:border-white/10 dark:bg-white/5">
                                  {preview ? (
                                    <img src={preview} alt={file.name} className="h-32 w-full object-cover" />
                                  ) : (
                                    <div className="grid h-32 place-items-center text-xs text-[rgb(var(--text)/0.45)]">
                                      Preview unavailable
                                    </div>
                                  )}
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-xs text-[rgb(var(--text)/0.55)]">
                                  <CalendarClock className="h-4 w-4 text-[color:var(--brand)]" />
                                  Auto-deletes in {days} day{days === 1 ? "" : "s"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="rounded-3xl border border-[rgba(0,133,255,0.18)] bg-white/70 p-4 shadow-soft dark:border-white/10 dark:bg-white/10">
                      <h3 className="text-sm font-semibold text-[rgb(var(--text))]">Add files</h3>
                      <p className="mt-1 text-xs text-[rgb(var(--text)/0.55)]">Drag and drop or click to upload directly into {meta.title.toLowerCase()}.</p>
                      <div className="mt-4">
                        <FileUpload
                          description={`Upload to ${meta.title}`}
                          onFiles={(files) => handleUpload(category, files)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
