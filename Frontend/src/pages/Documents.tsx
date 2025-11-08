import { useState } from "react";

export function Documents() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Documents</h1>
      <label className="block rounded-xl border border-dashed border-white/20 bg-black/10 p-8 text-center cursor-pointer hover:bg-black/20">
        <input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))}/>
        <div className="text-gray-300">Drop files here or click to upload</div>
      </label>
      {files.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[var(--nexus-card)] p-4">
          <div className="font-medium mb-2">Selected ({files.length})</div>
          <ul className="text-sm text-gray-300 list-disc pl-5">{files.map(f => <li key={f.name}>{f.name}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
