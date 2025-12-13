import { useEffect } from "react";

interface CommandPaletteProps {
  commands: string[];
  open: boolean;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  onSelect: (command: string) => void;
  onClose: () => void;
}

export function CommandPalette({
  commands,
  open,
  highlightedIndex,
  onSelect,
  onClose,
  setHighlightedIndex,
}: CommandPaletteProps) {
  useEffect(() => {
    if (!open) return;
    if (highlightedIndex >= commands.length) setHighlightedIndex(0);
  }, [commands.length, highlightedIndex, open, setHighlightedIndex]);

  if (!open) return null;

  return (
    <div className="absolute bottom-16 left-4 right-4 z-30 max-w-2xl rounded-2xl border border-white/10 bg-[color-mix(in_srgb,var(--panel-elevated)_94%,transparent)] shadow-2xl backdrop-blur-xl">
      <ul role="listbox" aria-label="Command palette" className="divide-y divide-white/5">
        {commands.map((command, index) => (
          <li
            key={command}
            role="option"
            aria-selected={index === highlightedIndex}
            onMouseEnter={() => setHighlightedIndex(index)}
            onClick={() => onSelect(command)}
            className={`cursor-pointer px-4 py-3 text-sm text-[var(--text-primary)] transition ${
              index === highlightedIndex ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            {command}
          </li>
        ))}
        {!commands.length && (
          <li className="px-4 py-3 text-sm text-[var(--text-secondary)]">No commands found</li>
        )}
      </ul>
      <div className="flex items-center justify-between px-4 py-2 text-[0.7rem] text-[var(--text-tertiary)]">
        <span>Enter to select · Esc to close</span>
        <button type="button" onClick={onClose} className="rounded-full px-2 py-1 hover:bg-white/10">
          Close
        </button>
      </div>
    </div>
  );
}

export default CommandPalette;
