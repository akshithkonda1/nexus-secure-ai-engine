import React, { useMemo } from "react";
import { ClipboardList } from "lucide-react";
import { WorkspaceList } from "@/types/workspace";
import { useTheme } from "@/theme/ThemeProvider";

interface ListsWidgetProps {
  data: WorkspaceList[];
  onChange: (lists: WorkspaceList[]) => void;
  onExpand: () => void;
}

const ListsWidget: React.FC<ListsWidgetProps> = ({ data, onExpand }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const previewItems = useMemo(() => data.flatMap((list) => list.items.slice(0, 2)).slice(0, 4), [data]);

  return (
    <button
      type="button"
      onClick={onExpand}
      className={`group relative w-full rounded-3xl border text-left shadow-sm transition hover:scale-[1.01] focus:outline-none ${
        isDark ? "border-borderLight/10 bg-bgElevated text-textPrimary" : "border-borderLight/5 bg-bgPrimary text-textPrimary"
      }`}
    >
      <div className="flex items-center justify-between border-b px-5 py-4 text-sm">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-textPrimary dark:text-textMuted">
          <ClipboardList className="h-4 w-4" />
          Lists
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isDark ? "bg-emerald-500 text-textPrimary" : "bg-emerald-300 text-textPrimary"
          }`}
        >
          {data.length} boards
        </span>
      </div>
      <div className="space-y-3 px-5 py-4">
        {data.map((list) => (
          <div
            key={list.id}
            className={`rounded-2xl border px-4 py-3 shadow-sm ${
              isDark ? "border-borderLight/10 bg-bgElevated" : "border-borderLight/5 bg-bgPrimary"
            }`}
          >
            <div className="flex items-center justify-between text-sm font-semibold text-textPrimary dark:text-textMuted">
              <span>{list.title}</span>
              <span className="text-xs text-textSecondary dark:text-textMuted">{list.items.length} items</span>
            </div>
            <div className="mt-2 grid gap-2 text-sm text-textPrimary dark:text-textMuted">
              {list.items.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                    isDark ? "bg-bgElevated text-textPrimary" : "bg-bgPrimary text-textPrimary"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className={item.done ? "line-through" : ""}>{item.text}</span>
                </div>
              ))}
              {!list.items.length && (
                <p className="text-xs text-textSecondary dark:text-textMuted">No entries yet. Tap to expand and add.</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div
        className={`rounded-b-3xl px-5 py-3 text-sm ${
          isDark ? "bg-bgElevated text-textMuted" : "bg-bgPrimary text-textSecondary"
        }`}
      >
        {previewItems.length ? (
          <div className="flex flex-wrap gap-2">
            {previewItems.map((item) => (
              <span
                key={item.id}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isDark ? "bg-bgElevated text-textPrimary" : "bg-bgPrimary text-textPrimary"
                }`}
              >
                {item.text}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-textSecondary dark:text-textMuted">Draft ideas are ready to organize.</p>
        )}
      </div>
    </button>
  );
};

export default ListsWidget;
