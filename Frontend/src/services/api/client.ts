import { QueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { LibraryItem, useUIStore } from "../../shared/state/ui";

export const queryClient = new QueryClient();

interface ApiResponse<T> {
  data: T;
}

export async function api<T>(path: string, _init?: RequestInit): Promise<ApiResponse<T>> {
  await new Promise((resolve) => setTimeout(resolve, 250));

  switch (path) {
    case "library/create-dummy-study-pack": {
      const item: LibraryItem = {
        id: nanoid(),
        title: "Dummy Study Pack",
        description: "Generated sample pack with curated flashcards.",
        createdAt: new Date().toISOString(),
      };
      useUIStore.getState().addLibraryItem(item);
      return { data: item as T };
    }
    default:
      return { data: undefined as T };
  }
}
