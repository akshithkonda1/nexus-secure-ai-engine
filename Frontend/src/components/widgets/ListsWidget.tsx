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
        isDark ? "border-white/10 bg-neutral-900 text-white" : "border-black/5 bg-white text-black"
      }`}
    >
      <div className="flex items-center justify-between border-b px-5 py-4 text-sm">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-100">
          <ClipboardList className="h-4 w-4" />
          Lists
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isDark ? "bg-emerald-500 text-white" : "bg-emerald-300 text-black"
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
              isDark ? "border-white/10 bg-neutral-800" : "border-black/5 bg-neutral-50"
            }`}
          >
            <div className="flex items-center justify-between text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              <span>{list.title}</span>
              <span className="text-xs text-neutral-700 dark:text-neutral-300">{list.items.length} items</span>
            </div>
            <div className="mt-2 grid gap-2 text-sm text-neutral-900 dark:text-neutral-100">
              {list.items.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                    isDark ? "bg-neutral-900 text-white" : "bg-white text-black"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className={item.done ? "line-through" : ""}>{item.text}</span>
                </div>
              ))}
              {!list.items.length && (
                <p className="text-xs text-neutral-700 dark:text-neutral-300">No entries yet. Tap to expand and add.</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div
        className={`rounded-b-3xl px-5 py-3 text-sm ${
          isDark ? "bg-neutral-900 text-neutral-200" : "bg-white text-neutral-700"
        }`}
      >
        {previewItems.length ? (
          <div className="flex flex-wrap gap-2">
            {previewItems.map((item) => (
              <span
                key={item.id}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isDark ? "bg-neutral-800 text-white" : "bg-neutral-100 text-black"
                }`}
              >
                {item.text}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-700 dark:text-neutral-300">Draft ideas are ready to organize.</p>
        )}
      </div>
    </button>
  );
};

export default ListsWidget;
