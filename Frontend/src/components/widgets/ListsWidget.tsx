import React, { useMemo } from "react";
import { ClipboardList } from "lucide-react";
import { WorkspaceList } from "@/types/workspace";

interface ListsWidgetProps {
  data: WorkspaceList[];
  onChange: (lists: WorkspaceList[]) => void;
  onExpand: () => void;
}

const surfaceClass =
  "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl p-6 z-10";

const ListsWidget: React.FC<ListsWidgetProps> = ({ data, onExpand }) => {
  const previewItems = useMemo(() => data.flatMap((list) => list.items.slice(0, 2)).slice(0, 4), [data]);

  return (
    <button
      type="button"
      onClick={onExpand}
      className={`group relative w-full text-left focus:outline-none ${surfaceClass}`}
    >
      <div className="flex items-center justify-between border-b border-neutral-300/60 pb-3 text-sm dark:border-neutral-700/60">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-textPrimary">
          <ClipboardList className="h-4 w-4" />
          Lists
        </div>
        <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-textPrimary">{data.length} boards</span>
      </div>
      <div className="space-y-3 pt-3">
        {data.map((list) => (
          <div key={list.id} className={`${surfaceClass} p-4`}>
            <div className="flex items-center justify-between text-sm font-semibold text-textPrimary">
              <span>{list.title}</span>
              <span className="text-xs text-textSecondary">{list.items.length} items</span>
            </div>
            <div className="mt-2 grid gap-2 text-sm text-textPrimary">
              {list.items.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 rounded-xl border border-neutral-300/50 bg-white/85 px-3 py-2 backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85 ${
                    item.done ? "line-through decoration-textMuted" : ""
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{item.text}</span>
                </div>
              ))}
              {!list.items.length && (
                <p className="text-xs text-textMuted">No entries yet. Tap to expand and add.</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-b-2xl pt-3 text-sm text-textSecondary">
        {previewItems.length ? (
          <div className="flex flex-wrap gap-2">
            {previewItems.map((item) => (
              <span
                key={item.id}
                className="rounded-full border border-neutral-300/50 bg-white/85 px-3 py-1 text-xs font-semibold text-textPrimary backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85"
              >
                {item.text}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-textMuted">Draft ideas are ready to organize.</p>
        )}
      </div>
    </button>
  );
};

export default ListsWidget;
