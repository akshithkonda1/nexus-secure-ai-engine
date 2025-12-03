import React from "react";
import type { ChatMessage } from "@/features/chat/context/ChatContext";

type Props = {
  open: boolean;
  message: ChatMessage;
  url: string;
  onClose: () => void;
};

export const ToronShareModal: React.FC<Props> = ({
  open,
  message,
  url,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-bgElevated/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-borderStrong bg-bgElevated/95 p-4 text-sm text-textMuted shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-textMuted">
            Share this reply
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-textMuted hover:text-textMuted focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-full px-2 py-1"
          >
            Close
          </button>
        </div>
        <div className="mb-3 max-h-40 overflow-y-auto rounded-xl border border-borderStrong bg-bgElevated/80 px-3 py-2 text-[13px]">
          <p className="whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div className="space-y-2">
          <div className="rounded-lg border border-borderStrong bg-bgElevated/80 px-3 py-2 text-[12px]">
            <p className="truncate text-textMuted" title={url}>
              {url}
            </p>
          </div>
          <p className="text-[11px] text-textMuted">
            Link is ready and already copied. Drop it into wherever you want people to see what Toron said.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ToronShareModal;
