export default function Templates() {
  return (
    <div className="px-[var(--page-padding)] py-6">
      <div className="card card-hover p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Templates</h2>
          <button className="rounded-xl bg-[rgba(var(--brand),1)] px-3 py-1.5 text-white">New template</button>
        </div>
        <ul className="mt-4 divide-y divide-[rgba(var(--border))]">
          {["RAG summary", "Weekly brief", "Bug triage"].map((t) => (
            <li key={t} className="py-3 flex items-center justify-between">
              <span>{t}</span>
              <button className="text-sm opacity-70 hover:opacity-100">Open</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
