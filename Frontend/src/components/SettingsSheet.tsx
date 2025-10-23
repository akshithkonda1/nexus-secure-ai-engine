import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { ReactNode } from "react";

type SettingsSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function SettingsSheet({ open, onClose, title = "Settings", children }: SettingsSheetProps) {
  if (!open) return null;

  return createPortal(
    <>
      <div className="settings-sheet__backdrop" aria-hidden="true" onClick={onClose} />
      <div role="dialog" aria-modal className="settings-sheet" tabIndex={-1}>
        <div className="settings-sheet__header">
          <div className="settings-sheet__title">{title}</div>
          <button type="button" aria-label="Close settings" className="settings-sheet__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="settings-sheet__body">{children}</div>
      </div>
    </>,
    document.body
  );
}
