import type { ToronAttachment } from "@/state/toron/toronSessionTypes";

interface AttachmentTrayProps {
  attachments: ToronAttachment[];
  onRemove: (id: string) => void;
}

export function AttachmentTray({ attachments, onRemove }: AttachmentTrayProps) {
  if (!attachments.length) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2" aria-live="polite">
      {attachments.map((file) => (
        <div
          key={file.id}
          className="group flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--panel-elevated)_78%,transparent)] px-3 py-1 text-xs text-[var(--text-primary)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur"
        >
          <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-secondary)_35%,transparent)] px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--accent-secondary)]">
            {file.type}
          </span>
          <span className="max-w-[160px] truncate font-medium">{file.name}</span>
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="rounded-full bg-white/10 px-2 py-1 text-[var(--text-secondary)] opacity-80 transition hover:bg-white/15 hover:text-[var(--text-primary)]"
            aria-label={`Remove ${file.name}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default AttachmentTray;
