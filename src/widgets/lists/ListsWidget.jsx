import React, { useEffect, useMemo, useState } from "react";
import ListsModal from "./ListsModal";
import { ListsStore, exportListsData, syncListsToCloud } from "./ListsStore";

const ListsWidget = () => {
  const [data, setData] = useState(ListsStore.getAll());
  const [modalState, setModalState] = useState({ type: null, categoryId: null, itemId: null });
  const [editText, setEditText] = useState("");

  useEffect(() => {
    setData(ListsStore.getAll());
  }, []);

  const selectedCategory = useMemo(() => {
    if (!modalState.categoryId) return null;
    return data.categories.find((cat) => cat.id === modalState.categoryId) || null;
  }, [modalState.categoryId, data.categories]);

  const handleAddCategory = (title) => {
    ListsStore.addCategory(title);
    setData(ListsStore.getAll());
    setModalState({ type: null });
  };

  const handleAddItem = (text) => {
    if (!modalState.categoryId) return;
    ListsStore.addItem(modalState.categoryId, text);
    setData(ListsStore.getAll());
    setModalState({ type: null });
  };

  const handleEditItem = (text) => {
    if (!modalState.categoryId || !modalState.itemId) return;
    ListsStore.editItem(modalState.categoryId, modalState.itemId, text);
    setData(ListsStore.getAll());
    setModalState({ type: null });
    setEditText("");
  };

  const handleToggleItem = (categoryId, itemId) => {
    ListsStore.toggleItem(categoryId, itemId);
    setData(ListsStore.getAll());
  };

  const handleDeleteItem = (categoryId, itemId) => {
    ListsStore.deleteItem(categoryId, itemId);
    setData(ListsStore.getAll());
  };

  const handleDeleteCategory = (categoryId) => {
    ListsStore.deleteCategory(categoryId);
    setData(ListsStore.getAll());
  };

  const handleExport = async () => {
    const payload = exportListsData();
    await syncListsToCloud(payload);
  };

  return (
    <div className="ryuzen-card flex h-full w-full flex-col rounded-3xl border border-[var(--border-card)] bg-[var(--bg-widget)] p-4 text-[var(--text-primary)] shadow-xl backdrop-blur-[var(--glass-blur)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Lists Widget</p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Quick checklists</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalState({ type: "category" })}
            className="rounded-xl bg-[var(--btn-bg)] px-3 py-2 text-sm font-semibold text-[var(--btn-text)] shadow hover:opacity-90"
          >
            Add Category
          </button>
          <button
            onClick={handleExport}
            className="rounded-xl border border-[var(--border-card)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/10"
          >
            Sync
          </button>
        </div>
      </div>

      <div className="scrollbar-thin scrollbar-thumb-white/20 mt-2 flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {data.categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-card)] bg-[var(--bg-card)] p-6 text-center text-[var(--text-secondary)]">
            Create your first category to start tracking quick lists.
          </div>
        ) : null}
        {data.categories.map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{category.title}</h3>
                <p className="text-xs text-[var(--text-secondary)]">{category.items.length} items</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalState({ type: "item", categoryId: category.id })}
                  className="rounded-lg bg-[var(--btn-bg)] px-3 py-2 text-xs font-semibold text-[var(--btn-text)]"
                >
                  Add Item
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="rounded-lg border border-[var(--border-card)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-white/10"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-widget)] p-3"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleToggleItem(category.id, item.id)}
                    className="h-4 w-4 rounded border-[var(--border-card)] accent-[var(--btn-bg)]"
                  />
                  <div className="flex-1">
                    <p className={`text-sm ${item.checked ? "line-through text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
                      {item.text}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setModalState({ type: "edit", categoryId: category.id, itemId: item.id });
                        setEditText(item.text);
                      }}
                      className="rounded-lg border border-[var(--border-card)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-white/10"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(category.id, item.id)}
                      className="rounded-lg border border-[var(--border-card)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-white/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ListsModal
        open={modalState.type === "category"}
        title="Create Category"
        placeholder="Category title"
        onClose={() => setModalState({ type: null })}
        onSave={handleAddCategory}
      />
      <ListsModal
        open={modalState.type === "item"}
        title={selectedCategory ? `Add Item to ${selectedCategory.title}` : "Add Item"}
        placeholder="Item text"
        onClose={() => setModalState({ type: null })}
        onSave={handleAddItem}
      />
      <ListsModal
        open={modalState.type === "edit"}
        title="Edit Item"
        placeholder="Item text"
        defaultValue={editText}
        onClose={() => setModalState({ type: null })}
        onSave={handleEditItem}
      />
    </div>
  );
};

export default ListsWidget;
