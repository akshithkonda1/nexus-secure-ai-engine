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
    <div className="space-y-4 text-[var(--rz-text)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--rz-text)]">Lists</h2>
          <p className="text-[var(--rz-text)]">Organize workstreams with flexible lists.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full px-3 py-2 text-sm text-[var(--rz-text)]"
            style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface-glass)" }}
            onClick={() => reorderList(-1)}
          >
            Move list up
          </button>
          <button
            type="button"
            className="rounded-full px-3 py-2 text-sm text-[var(--rz-text)]"
            style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface-glass)" }}
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
            className="w-full rounded-2xl border text-left text-[var(--rz-text)]"
            style={{
              borderColor: selectedListId === list.id ? "var(--rz-accent)" : "var(--rz-border)",
              background: selectedListId === list.id ? "var(--rz-surface-glass)" : "var(--rz-surface)",
              boxShadow: `0 10px 24px var(--rz-shadow)`,
              padding: "16px",
              transition: `all var(--rz-duration)` ,
            }}
          >
            <input
              value={list.name}
              onChange={(event) => updateListName(list.id, event.target.value)}
              className="w-full border-none bg-transparent text-lg font-semibold text-[var(--rz-text)] focus:outline-none"
              aria-label={`Rename ${list.name}`}
            />
            <p className="text-sm text-[var(--rz-text)]">{list.items.length} items</p>
          </button>
        ))}
      </div>

      {activeList && (
        <div className="space-y-3 rounded-2xl border p-4" style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface)" }}>
          <div className="grid gap-3 md:grid-cols-4">
            <input
              value={newItem.title}
              onChange={(event) => setNewItem((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
              style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
              placeholder="New item"
            />
            <input
              value={newItem.time}
              onChange={(event) => setNewItem((prev) => ({ ...prev, time: event.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
              style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
              placeholder="When (Today 5pm)"
            />
            <input
              value={newItem.tags}
              onChange={(event) => setNewItem((prev) => ({ ...prev, tags: event.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
              style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
              placeholder="Tags (comma separated)"
            />
            <select
              value={newItem.syncStatus}
              onChange={(event) => setNewItem((prev) => ({ ...prev, syncStatus: event.target.value as ListItem["syncStatus"] }))}
              className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
              style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
            >
              <option value="Synced">Synced</option>
              <option value="Pending">Pending</option>
              <option value="Syncing">Syncing</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-full px-4 py-2 text-[var(--rz-text)]"
              style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface-glass)" }}
              onClick={addItem}
            >
              Add item
            </button>
          </div>

          <div className="space-y-2">
            {activeList.items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-2xl border p-4 text-[var(--rz-text)]"
                style={{
                  borderColor: "var(--rz-border)",
                  background: "var(--rz-surface-glass)",
                  boxShadow: `0 6px 18px var(--rz-shadow)`,
                }}
              >
                <div className="grid gap-3 md:grid-cols-4 md:items-center">
                  <input
                    value={item.title}
                    onChange={(event) => updateItem(item.id, { title: event.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
                    style={{ borderColor: "var(--rz-border)", background: "transparent" }}
                  />
                  <input
                    value={item.time}
                    onChange={(event) => updateItem(item.id, { time: event.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
                    style={{ borderColor: "var(--rz-border)", background: "transparent" }}
                  />
                  <input
                    value={item.tags.join(", ")}
                    onChange={(event) => updateItem(item.id, { tags: event.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
                    style={{ borderColor: "var(--rz-border)", background: "transparent" }}
                  />
                  <select
                    value={item.syncStatus}
                    onChange={(event) => updateItem(item.id, { syncStatus: event.target.value as ListItem["syncStatus"] })}
                    className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
                    style={{ borderColor: "var(--rz-border)", background: "transparent" }}
                  >
                    <option value="Synced">Synced</option>
                    <option value="Pending">Pending</option>
                    <option value="Syncing">Syncing</option>
                  </select>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[var(--rz-text)]">
                  <span className="rounded-full border px-3 py-1 text-xs text-[var(--rz-text)]" style={{ borderColor: "var(--rz-border)" }}>
                    {item.tags.length ? item.tags.join(", ") : "No tags"}
                  </span>
                  <span className="rounded-full border px-3 py-1 text-xs text-[var(--rz-text)]" style={{ borderColor: "var(--rz-border)" }}>
                    {item.syncStatus}
                  </span>
                  <span className="rounded-full border px-3 py-1 text-xs text-[var(--rz-text)]" style={{ borderColor: "var(--rz-border)" }}>
                    {item.time}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full px-3 py-1 text-sm text-[var(--rz-text)]"
                    style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface)" }}
                    onClick={() => reorderItem(item.id, -1)}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    className="rounded-full px-3 py-1 text-sm text-[var(--rz-text)]"
                    style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface)" }}
                    onClick={() => reorderItem(item.id, 1)}
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    className="rounded-full px-3 py-1 text-sm text-[var(--rz-text)]"
                    style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface)" }}
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </button>
                  <span className="ml-auto text-xs text-[var(--rz-text)]">Item {index + 1} of {activeList.items.length}</span>
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
