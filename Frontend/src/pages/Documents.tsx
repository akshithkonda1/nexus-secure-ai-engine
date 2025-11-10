export default function Documents() {
  return (
    <div className="px-[var(--page-padding)] py-6">
      <div className="card card-hover p-5">
        <h2 className="text-lg font-semibold">Documents</h2>
        <p className="mt-2 text-sm opacity-75">Connect Google Drive, Dropbox, or upload files.</p>
        <div className="mt-4 flex gap-3">
          <button className="rounded-xl border px-3 py-1.5">Upload</button>
          <button className="rounded-xl border px-3 py-1.5">Connect Drive</button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="h-24 rounded-lg bg-[rgba(var(--surface),.7)]" />
              <div className="mt-3 text-sm">Sample document {i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
