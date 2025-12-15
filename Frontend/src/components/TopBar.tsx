export default function TopBar() {
  return (
    <header className="flex h-12 items-center justify-between px-2 text-sm text-slate-100/80">
      <div className="font-semibold tracking-tight text-slate-50">Toron</div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="px-2 text-slate-100/70 transition hover:text-slate-100"
        >
          Configuration
        </button>
        <button
          type="button"
          className="px-2 text-slate-100/70 transition hover:text-slate-100"
        >
          Export
        </button>
      </div>
    </header>
  );
}
