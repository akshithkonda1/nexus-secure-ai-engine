import { useEffect, useRef, useState } from "react";

interface PlusMenuProps {
  onOpenDriveModal: () => void;
  onOpenGithubModal: () => void;
  onPickPhoto: () => void;
  onPickFile: () => void;
}

export function PlusMenu({ onOpenDriveModal, onOpenGithubModal, onPickFile, onPickPhoto }: PlusMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Add attachment"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--panel-elevated)_72%,transparent)] text-[var(--text-primary)] shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-white/10"
        onClick={() => setOpen((prev) => !prev)}
      >
        <img src="/assets/icons/plus.svg" alt="Add" className="h-5 w-5" />
      </button>
      {open && (
        <div
          className="absolute bottom-14 left-0 z-30 w-56 max-h-60 overflow-y-auto rounded-2xl border border-white/10 bg-[color-mix(in_srgb,var(--panel-elevated)_94%,transparent)] p-2 shadow-2xl backdrop-blur-xl"
          style={{ scrollbarWidth: "thin" }}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-left text-[var(--text-primary)] transition hover:bg-white/10"
            onClick={() => {
              onPickPhoto();
              setOpen(false);
            }}
          >
            <img src="/assets/icons/photo.svg" alt="Photo" className="h-5 w-5" />
            Add photo
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-left text-[var(--text-primary)] transition hover:bg-white/10"
            onClick={() => {
              onPickFile();
              setOpen(false);
            }}
          >
            <img src="/assets/icons/paperclip.svg" alt="File" className="h-5 w-5" />
            Upload file
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-left text-[var(--text-primary)] transition hover:bg-white/10"
            onClick={onOpenDriveModal}
          >
            <img src="/assets/icons/google-drive.svg" alt="Google Drive" className="h-5 w-5" />
            Google Drive
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-left text-[var(--text-primary)] transition hover:bg-white/10"
            onClick={onOpenGithubModal}
          >
            <img src="/assets/icons/github.svg" alt="GitHub" className="h-5 w-5" />
            GitHub
          </button>
        </div>
      )}
    </div>
  );
}

export default PlusMenu;
