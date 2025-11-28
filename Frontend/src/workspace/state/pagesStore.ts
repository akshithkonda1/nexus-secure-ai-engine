import { create } from "zustand";

export type Page = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

type PagesState = {
  pages: Page[];
  currentPageId: string;
  getCurrentPage: () => Page | undefined;
  upsertPage: (payload: { title: string; content: string }) => void;
};

export const usePagesStore = create<PagesState>((set, get) => ({
  pages: [
    {
      id: "page-1",
      title: "Welcome to Workspace",
      content: "",
      updatedAt: new Date().toISOString(),
    },
  ],
  currentPageId: "page-1",
  getCurrentPage: () => get().pages.find((page) => page.id === get().currentPageId),
  upsertPage: ({ title, content }) => {
    const state = get();
    const existingIndex = state.pages.findIndex((page) => page.id === state.currentPageId);
    const updatedPage: Page = {
      id: state.currentPageId,
      title,
      content,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const pages = [...state.pages];
      pages[existingIndex] = updatedPage;
      set({ pages });
    } else {
      set({ pages: [...state.pages, updatedPage] });
    }
  },
}));
