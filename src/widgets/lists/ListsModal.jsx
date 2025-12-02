import React, { useState, useEffect } from "react";

const ListsModal = ({ open, title, placeholder, defaultValue, onClose, onSave }) => {
  const [value, setValue] = useState(defaultValue || "");

  useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[var(--glass-blur)]">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full border border-[var(--border-card)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:bg-white/10"
          >
            Close
          </button>
        </div>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[var(--border-card)] bg-[var(--bg-widget)] px-3 py-2 text-[var(--text-primary)] focus:outline-none"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--border-card)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(value)}
            className="rounded-xl bg-[var(--btn-bg)] px-4 py-2 text-sm font-semibold text-[var(--btn-text)] shadow hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListsModal;
