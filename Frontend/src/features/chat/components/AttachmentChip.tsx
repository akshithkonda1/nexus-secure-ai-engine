import { X, Paperclip } from "lucide-react";
import type { Attachment } from "../../chat/types";
const isImage = (t: string) => /^image\//.test(t);

export function AttachmentChip({ attachment, onRemove }: { attachment: Attachment; onRemove: (id: string) => void }) {
  return (
    <div className="group inline-flex items-center gap-2 rounded-full border border-app bg-panel panel panel--glassy panel--hover px-3 py-1.5 text-xs text-muted">
      {isImage(attachment.type) && attachment.previewUrl ? (
        <img src={attachment.previewUrl} alt="" className="h-5 w-5 rounded-full object-cover ring-1 ring-[rgba(var(--surface),0.3)]" />
      ) : <Paperclip className="h-3.5 w-3.5" />}
      <span className="max-w-[200px] truncate text-ink">{attachment.name}</span>
      <button onClick={() => onRemove(attachment.id)} aria-label={`Remove ${attachment.name}`} className="btn btn-ghost rounded-full p-1 text-muted transition hover:bg-app hover:text-ink">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
