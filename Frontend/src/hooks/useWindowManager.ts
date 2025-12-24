/**
 * Window Manager Hook
 * Manages floating window state with Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Window, WindowType, Position, Size, Layout } from '../types/workspace';

// Helper functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getMaxZIndex(windows: Window[]): number {
  if (windows.length === 0) return 0;
  return Math.max(...windows.map(w => w.zIndex));
}

function getDefaultSize(type: WindowType): Size {
  const sizes: Record<WindowType, Size> = {
    lists: { width: 320, height: 400 },
    tasks: { width: 320, height: 450 },
    calendar: { width: 360, height: 500 },
    connectors: { width: 320, height: 350 },
    custom: { width: 400, height: 400 },
  };
  return sizes[type] || { width: 320, height: 400 };
}

function getSmartPosition(existingWindows: Window[]): Position {
  const startX = 20;
  const startY = 20;
  const offset = 40;

  let x = startX;
  let y = startY;
  let attempts = 0;

  while (attempts < 10) {
    const overlaps = existingWindows.some(
      w =>
        Math.abs(w.position.x - x) < 50 &&
        Math.abs(w.position.y - y) < 50
    );

    if (!overlaps) {
      return { x, y };
    }

    x += offset;
    y += offset;

    // Wrap around if too far right/bottom
    if (typeof window !== 'undefined' && x > window.innerWidth - 400) {
      x = startX;
      y += offset * 2;
    }

    attempts++;
  }

  return { x: startX, y: startY };
}

// Window Manager State
interface WindowState {
  windows: Window[];
  activeWindowId: string | null;
  layouts: Record<string, Layout>;
  currentLayout: string | null;

  // Window operations
  openWindow: (type: WindowType, initialPosition?: Position) => string;
  closeWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  toggleMinimize: (id: string) => void;

  // Layout operations
  saveLayout: (name: string) => void;
  loadLayout: (name: string) => void;
  autoArrange: () => void;

  // Utility
  getWindow: (id: string) => Window | undefined;
  getWindowsByType: (type: WindowType) => Window[];
  closeAllWindows: () => void;
}

export const useWindowManager = create<WindowState>()(
  persist(
    (set, get) => ({
      windows: [],
      activeWindowId: null,
      layouts: {},
      currentLayout: null,

      openWindow: (type: WindowType, initialPosition?: Position) => {
        const id = `${type}-${generateId()}`;
        const windows = get().windows;

        const newWindow: Window = {
          id,
          type,
          position: initialPosition || getSmartPosition(windows),
          size: getDefaultSize(type),
          zIndex: getMaxZIndex(windows) + 1,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          isPinned: false,
          persistAcrossModes: true,
          canDrag: true,
          canResize: true,
          canClose: true,
          state: {},
          history: [],
          aiAssisted: true,
          suggestionLevel: 'medium',
        };

        set(state => ({
          windows: [...state.windows, newWindow],
          activeWindowId: id,
        }));

        return id;
      },

      closeWindow: (id: string) => {
        set(state => ({
          windows: state.windows.filter(w => w.id !== id),
          activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
        }));
      },

      updateWindow: (id: string, updates: Partial<Window>) => {
        set(state => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }));
      },

      focusWindow: (id: string) => {
        const maxZ = getMaxZIndex(get().windows);
        set(state => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, zIndex: maxZ + 1 } : w
          ),
          activeWindowId: id,
        }));
      },

      minimizeWindow: (id: string) => {
        set(state => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, isMinimized: true, isMaximized: false } : w
          ),
        }));
      },

      maximizeWindow: (id: string) => {
        const win = get().windows.find(w => w.id === id);
        if (!win) return;

        const isMaximized = !win.isMaximized;

        set(state => ({
          windows: state.windows.map(w =>
            w.id === id
              ? {
                  ...w,
                  isMaximized,
                  isMinimized: false,
                  ...(isMaximized && typeof window !== 'undefined'
                    ? {
                        position: { x: 10, y: 10 },
                        size: {
                          width: window.innerWidth - 20,
                          height: window.innerHeight - 100,
                        },
                      }
                    : {}),
                }
              : w
          ),
        }));
      },

      toggleMinimize: (id: string) => {
        set(state => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
          ),
        }));
      },

      saveLayout: (name: string) => {
        const windows = get().windows;
        const layout: Layout = {
          name,
          windows: windows.map(w => ({
            id: w.type, // Save by type to restore on new session
            position: w.position,
            size: w.size,
          })),
        };

        set(state => ({
          layouts: { ...state.layouts, [name]: layout },
          currentLayout: name,
        }));
      },

      loadLayout: (name: string) => {
        const layout = get().layouts[name];
        if (!layout) return;

        // Close existing windows
        set({ windows: [] });

        // Open windows from layout
        layout.windows.forEach(w => {
          get().openWindow(w.id as WindowType, w.position);
          // Update size
          const lastWindow = get().windows[get().windows.length - 1];
          if (lastWindow) {
            get().updateWindow(lastWindow.id, { size: w.size });
          }
        });

        set({ currentLayout: name });
      },

      autoArrange: () => {
        const windows = get().windows;
        if (windows.length === 0) return;

        const padding = 20;
        const offsetX = 40;
        const offsetY = 40;

        set(state => ({
          windows: state.windows.map((w, index) => ({
            ...w,
            position: {
              x: padding + index * offsetX,
              y: padding + index * offsetY,
            },
            zIndex: index + 1,
          })),
        }));
      },

      getWindow: (id: string) => {
        return get().windows.find(w => w.id === id);
      },

      getWindowsByType: (type: WindowType) => {
        return get().windows.filter(w => w.type === type);
      },

      closeAllWindows: () => {
        set({ windows: [], activeWindowId: null });
      },
    }),
    {
      name: 'window-manager-storage',
      partialize: (state) => ({
        layouts: state.layouts,
        currentLayout: state.currentLayout,
        // Don't persist actual windows, only layouts
      }),
    }
  )
);
