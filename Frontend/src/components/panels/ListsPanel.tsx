import React, { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { WorkspaceList } from "@/types/workspace";
import { useTheme } from "@/theme/ThemeProvider";

interface ListsPanelProps {
  lists: WorkspaceList[];
  onChange: (next: WorkspaceList[]) => void;
  close?: () => void;
}

const ListsPanel: React.FC<ListsPanelProps> = ({ lists, onChange, close }) => {
  const [newTitle, setNewTitle] = useState("");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const addList = () => {
    const title = newTitle.trim();
    if (!title) return;
    const updated = [...lists, { id: crypto.randomUUID(), title, items: [] }];
    onChange(updated);
    setNewTitle("");
  };

  const containerBorder = isDark ? "border-white/10" : "border-black/5";
  const cardSurface = isDark ? "bg-neutral-900" : "bg-white";
  const cardBorder = isDark ? "border-white/10" : "border-black/5";
  const textSecondary = isDark ? "text-neutral-300" : "text-neutral-700";

  return (
    <div className={`flex h-full flex-col gap-4 rounded-3xl border ${containerBorder} bg-white dark:bg-neutral-900 p-6 shadow-xl`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-100">
          <ClipboardList className="h-4 w-4" /> Lists Control Center
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addList()}
            placeholder="New list"
            className={`rounded-full border px-4 py-2 text-sm ${
              isDark
                ? "border-white/10 bg-neutral-800 text-white placeholder:text-neutral-400"
                : "border-black/5 bg-neutral-50 text-black placeholder:text-neutral-500"
            } focus:outline-none`}
          />
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isDark
                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                : "bg-emerald-300 text-black hover:bg-emerald-400"
            }`}
            onClick={addList}
          >
            <Plus className="h-4 w-4" />
          </button>
          {close && (
            <button
              onClick={close}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                isDark ? "bg-neutral-800 text-white hover:bg-neutral-700" : "bg-neutral-100 text-black hover:bg-neutral-200"
              }`}
            >
              Close
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {lists.map((list) => (
          <div key={list.id} className={`rounded-2xl border ${cardBorder} ${cardSurface} p-4 shadow-sm`}>
            <div className="flex items-center justify-between text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {list.title}
              <span className={`text-xs ${textSecondary}`}>{list.items.length} items</span>
            </div>
            <div className="mt-2 space-y-2 text-sm">
              {list.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                    isDark ? "border-white/10 bg-neutral-800 text-white" : "border-black/5 bg-neutral-50 text-black"
                  }`}
                >
                  <span className={item.done ? "line-through" : ""}>{item.text}</span>
                  {item.done && <span className="text-[11px] uppercase text-emerald-500">Done</span>}
                </div>
              ))}
              {!list.items.length && <p className={`text-xs ${textSecondary}`}>No items yet. Add from the list toolbar.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListsPanel;
