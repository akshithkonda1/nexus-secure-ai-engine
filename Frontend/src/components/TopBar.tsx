export default function TopBar() {
  return (
    <header className="flex h-12 items-center justify-between text-sm text-slate-100/80">
      <div className="px-2 font-semibold tracking-tight text-slate-50">Toron</div>
      <div className="flex items-center gap-3">
        <button type="button" className="rounded px-2 text-slate-100/70 transition-colors hover:bg-white/5 hover:text-slate-100">
          Configuration
        </button>
        <button type="button" className="rounded px-2 text-slate-100/70 transition-colors hover:bg-white/5 hover:text-slate-100">
          Export
        </button>
      </div>
    </header>
  );
}
