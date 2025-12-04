import React, { useMemo, useState } from "react";

type ListItem = {
  id: string;
  title: string;
  time: string;
  tags: string[];
  syncStatus: "Synced" | "Pending" | "Syncing";
};

type WorkspaceList = {
  id: string;
  name: string;
  items: ListItem[];
};

const defaultLists: WorkspaceList[] = [
  {
    id: "inbox",
    name: "Inbox",
    items: [
      {
        id: "inbox-1",
        title: "Capture research threads",
        time: "Today 5:00 PM",
        tags: ["research"],
        syncStatus: "Synced",
      },
      {
        id: "inbox-2",
        title: "Assign next sprint work",
        time: "Tomorrow 9:00 AM",
        tags: ["planning", "sprint"],
        syncStatus: "Pending",
      },
    ],
  },
  {
    id: "projects",
    name: "Active Projects",
    items: [
      {
        id: "projects-1",
        title: "Revise connectors brief",
        time: "Fri 1:00 PM",
        tags: ["connectors", "sync"],
        syncStatus: "Syncing",
      },
    ],
  },
  {
    id: "ideas",
    name: "Ideas",
    items: [
      {
        id: "ideas-1",
        title: "Prototype calendar heatmap",
        time: "No due date",
        tags: ["calendar", "explore"],
        syncStatus: "Pending",
      },
    ],
  },
];

const ListsPanel: React.FC = () => {
  const [lists, setLists] = useState<WorkspaceList[]>(defaultLists);
  const [selectedListId, setSelectedListId] = useState<string>(defaultLists[0].id);
  const [newItem, setNewItem] = useState({ title: "", time: "", tags: "", syncStatus: "Pending" as const });

  const controlClass =
    "w-full rounded-xl border px-3 py-2 leading-relaxed text-neutral-800 dark:text-neutral-200 bg-white/85 dark:bg-neutral-900/85 border-white/10 dark:border-neutral-700/20";
  const actionButtonClass =
    "rounded-full px-3 py-2 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 border border-white/10 dark:border-neutral-700/20 bg-white/85 dark:bg-neutral-900/85";
  const compactActionButtonClass =
    "rounded-full px-3 py-1 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 border border-white/10 dark:border-neutral-700/20 bg-white/85 dark:bg-neutral-900/85";
  const pillClass = "rounded-full border px-3 py-1 text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 border-white/10 dark:border-neutral-700/20";

  const activeList = useMemo(() => lists.find((list) => list.id === selectedListId) ?? lists[0], [lists, selectedListId]);

  const updateListName = (id: string, name: string) => {
    setLists((current) => current.map((list) => (list.id === id ? { ...list, name } : list)));
  };

  const reorderList = (direction: -1 | 1) => {
    setLists((current) => {
      const index = current.findIndex((list) => list.id === selectedListId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  const updateItem = (id: string, payload: Partial<ListItem> & { tags?: string }) => {
    setLists((current) =>
      current.map((list) =>
        list.id === selectedListId
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      ...payload,
                      tags: payload.tags !== undefined ? payload.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : item.tags,
                    }
                  : item
              ),
            }
          : list
      )
    );
  };

  const reorderItem = (id: string, direction: -1 | 1) => {
    setLists((current) =>
      current.map((list) => {
        if (list.id !== selectedListId) return list;
        const index = list.items.findIndex((item) => item.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= list.items.length) return list;
        const items = [...list.items];
        [items[index], items[target]] = [items[target], items[index]];
        return { ...list, items };
      })
    );
  };

  const deleteItem = (id: string) => {
    setLists((current) =>
      current.map((list) =>
        list.id === selectedListId ? { ...list, items: list.items.filter((item) => item.id !== id) } : list
      )
    );
  };

  const addItem = () => {
    if (!newItem.title.trim()) return;
    setLists((current) =>
      current.map((list) =>
        list.id === selectedListId
          ? {
              ...list,
              items: [
                ...list.items,
                {
                  id: `${list.id}-${Date.now()}`,
                  title: newItem.title.trim(),
                  time: newItem.time.trim() || "No due date",
                  tags: newItem.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                  syncStatus: newItem.syncStatus,
                },
              ],
            }
          : list
      )
    );
    setNewItem({ title: "", time: "", tags: "", syncStatus: "Pending" });
  };

  return (
    <div className="space-y-4 leading-relaxed text-neutral-800 dark:text-neutral-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Lists</h2>
          <p>Organize workstreams with flexible lists.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={actionButtonClass}
            onClick={() => reorderList(-1)}
          >
            Move list up
          </button>
          <button
            type="button"
            className={actionButtonClass}
            onClick={() => reorderList(1)}
          >
            Move list down
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {lists.map((list) => (
          <button
            type="button"
            key={list.id}
            onClick={() => setSelectedListId(list.id)}
            className={`relative w-full rounded-3xl border text-left leading-relaxed text-neutral-800 dark:text-neutral-200 bg-white/85 dark:bg-neutral-900/85 border-white/10 dark:border-neutral-700/20 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-[10] hover:scale-[1.01] transition-transform duration-300 ${
              selectedListId === list.id ? "ring-2 ring-black/10 dark:ring-white/10" : ""
            }`}
          >
            <div className="absolute inset-0 rounded-3xl pointer-events-none backdrop-blur-xl" />
            <input
              value={list.name}
              onChange={(event) => updateListName(list.id, event.target.value)}
              className={`${controlClass} text-lg font-semibold focus:outline-none`}
              aria-label={`Rename ${list.name}`}
            />
            <p className="text-sm">{list.items.length} items</p>
          </button>
        ))}
      </div>

      {activeList && (
        <div className="relative space-y-3 rounded-3xl border border-white/10 dark:border-neutral-700/20 bg-white/85 dark:bg-neutral-900/85 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-[10]">
          <div className="absolute inset-0 rounded-3xl pointer-events-none backdrop-blur-xl" />
          <div className="grid gap-3 md:grid-cols-4">
            <input
              value={newItem.title}
              onChange={(event) => setNewItem((prev) => ({ ...prev, title: event.target.value }))}
              className={controlClass}
              placeholder="New item"
            />
            <input
              value={newItem.time}
              onChange={(event) => setNewItem((prev) => ({ ...prev, time: event.target.value }))}
              className={controlClass}
              placeholder="When (Today 5pm)"
            />
            <input
              value={newItem.tags}
              onChange={(event) => setNewItem((prev) => ({ ...prev, tags: event.target.value }))}
              className={controlClass}
              placeholder="Tags (comma separated)"
            />
            <select
              value={newItem.syncStatus}
              onChange={(event) => setNewItem((prev) => ({ ...prev, syncStatus: event.target.value as ListItem["syncStatus"] }))}
              className={controlClass}
            >
              <option value="Synced">Synced</option>
              <option value="Pending">Pending</option>
              <option value="Syncing">Syncing</option>
            </select>
          </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-full px-4 py-2 leading-relaxed text-neutral-800 dark:text-neutral-200 border border-white/10 dark:border-neutral-700/20 bg-white/85 dark:bg-neutral-900/85"
            onClick={addItem}
          >
            Add item
            </button>
          </div>

          <div className="space-y-2">
            {activeList.items.map((item, index) => (
              <div
                key={item.id}
                className="relative rounded-3xl border border-white/10 dark:border-neutral-700/20 p-6 md:p-8 leading-relaxed text-neutral-800 dark:text-neutral-200 bg-white/85 dark:bg-neutral-900/85 shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-[10]"
              >
                <div className="absolute inset-0 rounded-3xl pointer-events-none backdrop-blur-xl" />
                <div className="grid gap-3 md:grid-cols-4 md:items-center">
                  <input
                    value={item.title}
                    onChange={(event) => updateItem(item.id, { title: event.target.value })}
                    className={controlClass}
                  />
                  <input
                    value={item.time}
                    onChange={(event) => updateItem(item.id, { time: event.target.value })}
                    className={controlClass}
                  />
                  <input
                    value={item.tags.join(", ")}
                    onChange={(event) => updateItem(item.id, { tags: event.target.value })}
                    className={controlClass}
                  />
                  <select
                    value={item.syncStatus}
                    onChange={(event) => updateItem(item.id, { syncStatus: event.target.value as ListItem["syncStatus"] })}
                    className={controlClass}
                  >
                    <option value="Synced">Synced</option>
                    <option value="Pending">Pending</option>
                    <option value="Syncing">Syncing</option>
                  </select>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={pillClass}>
                    {item.tags.length ? item.tags.join(", ") : "No tags"}
                  </span>
                  <span className={pillClass}>
                    {item.syncStatus}
                  </span>
                  <span className={pillClass}>
                    {item.time}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={compactActionButtonClass}
                    onClick={() => reorderItem(item.id, -1)}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    className={compactActionButtonClass}
                    onClick={() => reorderItem(item.id, 1)}
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    className={compactActionButtonClass}
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </button>
                  <span className="ml-auto text-xs">Item {index + 1} of {activeList.items.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListsPanel;
