import { useRef, useState } from "react";
import { FileText, UploadCloud } from "lucide-react";

type Doc = { id: string; name: string; size: string; when: string };

export function Documents() {
  const [docs, setDocs] = useState<Doc[]>([
    { id: "1", name: "meeting-notes.txt", size: "12 KB", when: "today" },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  function pick() {
    inputRef.current?.click();
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setDocs((d) => [
      ...d,
      {
        id: crypto.randomUUID(),
        name: f.name,
        size: `${Math.max(1, Math.ceil(f.size / 1024))} KB`,
        when: "now",
      },
    ]);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Documents</h2>
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="file" className="hidden" onChange={onFiles} />
          <button
            onClick={pick}
            className="h-10 px-4 rounded-xl text-white flex items-center gap-2"
            style={{ backgroundColor: "var(--brand)" }}
          >
            <UploadCloud className="size-4" /> Upload
          </button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-border/60 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
        <div className="bg-[rgb(var(--panel))] grid grid-cols-[1fr_120px_140px_120px] px-4 py-3 text-sm text-subtle">
          <div>Name</div>
          <div>Size</div>
          <div>Uploaded</div>
          <div></div>
        </div>
        <div className="divide-y divide-border/60">
          {docs.map((d) => (
            <div
              key={d.id}
              className="bg-surface/40 grid grid-cols-[1fr_120px_140px_120px] px-4 py-3 items-center"
            >
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-subtle" /> {d.name}
              </div>
              <div className="text-sm text-subtle">{d.size}</div>
              <div className="text-sm text-subtle">{d.when}</div>
              <button className="h-8 px-3 rounded-lg border border-border/60 hover:bg-surface/50">Open</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Documents;
