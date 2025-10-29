import { useUIStore } from "../../shared/state/ui";

export function LibraryPane() {
  const items = useUIStore((state) => state.libraryItems);
  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 ? (
        <p className="text-sm text-muted">No saved packs yet. Create one from quick actions.</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="rounded-lg border border-subtle bg-surface/70 p-4">
            <div className="text-sm font-semibold">{item.title}</div>
            <div className="text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</div>
            <p className="mt-2 text-xs text-muted/80">{item.description}</p>
          </div>
        ))
      )}
    </div>
  );
}
