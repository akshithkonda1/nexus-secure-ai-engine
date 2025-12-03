import React, { useMemo } from "react";
import { ClipboardList } from "lucide-react";
import { WorkspaceList } from "@/types/workspace";

interface ListsWidgetProps {
  data: WorkspaceList[];
  onChange: (lists: WorkspaceList[]) => void;
  onExpand: () => void;
}

const glassPanelClass =
  "bg-glass backdrop-blur-2xl border border-glassBorder shadow-glass rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong";

const ListsWidget: React.FC<ListsWidgetProps> = ({ data, onExpand }) => {
  const previewItems = useMemo(() => data.flatMap((list) => list.items.slice(0, 2)).slice(0, 4), [data]);

  return (
    <button
      type="button"
      onClick={onExpand}
      className={`group relative w-full text-left focus:outline-none ${glassPanelClass}`}
    >
      <div className="flex items-center justify-between border-b border-glassBorder pb-3 text-sm">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-textPrimary">
          <ClipboardList className="h-4 w-4" />
          Lists
        </div>
        <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-textPrimary">{data.length} boards</span>
      </div>
      <div className="space-y-3 pt-3">
        {data.map((list) => (
          <div key={list.id} className={`${glassPanelClass} p-4 shadow-none`}>
            <div className="flex items-center justify-between text-sm font-semibold text-textPrimary">
              <span>{list.title}</span>
              <span className="text-xs text-textSecondary">{list.items.length} items</span>
            </div>
            <div className="mt-2 grid gap-2 text-sm text-textPrimary">
              {list.items.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 rounded-xl border border-glassBorder bg-glass px-3 py-2 ${
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
                className="rounded-full border border-glassBorder bg-glass px-3 py-1 text-xs font-semibold text-textPrimary"
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
