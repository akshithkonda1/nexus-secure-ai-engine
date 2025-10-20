import React from "react";

type Props = {
  dirty: boolean;
  saving?: boolean;
  onSave: () => void;
  onDiscard?: () => void;
  label?: string;
};

export default function SaveBar({
  dirty,
  saving = false,
  onSave,
  onDiscard,
  label = "You have unsaved changes",
}: Props) {
  return (
    <div
      className={[
        "sticky bottom-0 left-0 right-0 z-40",
        "border-t border-white/10 bg-neutral-900/80 backdrop-blur",
        "px-4 py-3",
      ].join(" ")}
      role="region"
      aria-label="Save changes"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
        <div className="text-sm text-neutral-300">
          {dirty ? label : saving ? "Saving…" : "All changes saved"}
        </div>
        <div className="flex items-center gap-2">
          {onDiscard && (
            <button
              type="button"
              className="rounded-xl px-3 py-2 text-sm text-neutral-200 hover:bg-white/5 disabled:opacity-40"
              onClick={onDiscard}
              disabled={!dirty || saving}
            >
              Discard
            </button>
          )}
          <button
            type="button"
            className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-40"
            onClick={onSave}
            disabled={!dirty || saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
