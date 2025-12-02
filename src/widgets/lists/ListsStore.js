import { load, save } from "../../utils/localDB";

const STORAGE_KEY = "ryuzen_lists_store";

const defaultState = {
  categories: [],
};

let state = load(STORAGE_KEY, defaultState);

function persist() {
  save(STORAGE_KEY, state);
}

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const ListsStore = {
  getAll() {
    return state;
  },
  addCategory(title) {
    const category = { id: uid(), title: title || "Untitled", items: [] };
    state = { ...state, categories: [...state.categories, category] };
    persist();
    return category;
  },
  deleteCategory(categoryId) {
    state = {
      ...state,
      categories: state.categories.filter((cat) => cat.id !== categoryId),
    };
    persist();
  },
  addItem(categoryId, text) {
    state = {
      ...state,
      categories: state.categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: [...cat.items, { id: uid(), text: text || "New item", checked: false }],
            }
          : cat
      ),
    };
    persist();
  },
  editItem(categoryId, itemId, nextText) {
    state = {
      ...state,
      categories: state.categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, text: nextText } : item
              ),
            }
          : cat
      ),
    };
    persist();
  },
  toggleItem(categoryId, itemId) {
    state = {
      ...state,
      categories: state.categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : cat
      ),
    };
    persist();
  },
  deleteItem(categoryId, itemId) {
    state = {
      ...state,
      categories: state.categories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
          : cat
      ),
    };
    persist();
  },
  replaceState(next) {
    state = next;
    persist();
  },
};

export function exportListsData() {
  return ListsStore.getAll();
}

export async function syncListsToCloud() {
  return Promise.resolve({ ok: true, payload: state });
}

export default ListsStore;
