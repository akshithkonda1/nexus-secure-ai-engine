export default function TopBar() {
  return (
    <header className="flex h-12 items-center justify-between px-2 text-sm text-slate-100/80">
      <div className="font-semibold tracking-tight text-slate-50">Toron</div>
      <div className="flex items-center gap-3">
        <button type="button" className="rounded-md px-3 py-1.5 text-slate-100/70 transition hover:text-slate-100/90">
          Configuration
        </button>
        <button type="button" className="rounded-md px-3 py-1.5 text-slate-100/70 transition hover:text-slate-100/90">
          Export
        </button>
      </div>
    </header>
  );
}
