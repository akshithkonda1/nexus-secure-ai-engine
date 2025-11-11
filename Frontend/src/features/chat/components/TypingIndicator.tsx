export function TypingIndicator() {
  return (
    <div aria-live="polite" className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-app bg-panel panel panel--glassy panel--hover px-3 py-1.5 text-xs text-muted">
      <span className="inline-flex h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
      <span className="inline-flex h-2 w-2 animate-bounce rounded-full bg-current" />
      <span className="inline-flex h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0.2s]" />
      <span className="ml-2">Nexus is typing…</span>
    </div>
  );
}
