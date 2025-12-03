import React from "react";
import { ThumbsUp, ThumbsDown, Copy, Share2 } from "lucide-react";

type Props = {
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
};

const baseButton =
  "inline-flex h-7 w-7 items-center justify-center rounded-full border border-borderStrong bg-bgElevated/95 text-textMuted shadow-sm transition hover:bg-bgElevated hover:text-textMuted focus:outline-none focus:ring-2 focus:ring-sky-500";

export const ToronMessageActions: React.FC<Props> = ({
  onThumbsUp,
  onThumbsDown,
  onCopy,
  onShare,
}) => {
  return (
    <div className="flex items-center gap-1 text-textMuted">
      {onThumbsUp && (
        <button
          type="button"
          className={baseButton}
          onClick={onThumbsUp}
          aria-label="Thumbs up"
          title="Helpful"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>
      )}
      {onThumbsDown && (
        <button
          type="button"
          className={baseButton}
          onClick={onThumbsDown}
          aria-label="Thumbs down"
          title="Not helpful"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>
      )}
      {onCopy && (
        <button
          type="button"
          className={baseButton}
          onClick={onCopy}
          aria-label="Copy message"
          title="Copy"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
      {onShare && (
        <button
          type="button"
          className={baseButton}
          onClick={onShare}
          aria-label="Share message"
          title="Share"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default ToronMessageActions;
