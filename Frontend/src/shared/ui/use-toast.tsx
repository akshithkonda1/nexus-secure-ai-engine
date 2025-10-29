import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import {
  Toast,
  ToastDescription,
  ToastProvider as RadixToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast-primitives";

interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  publish: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const publish = useCallback((toast: Omit<ToastItem, "id">) => {
    const item: ToastItem = { id: nanoid(), duration: 4000, ...toast };
    setToasts((items) => [...items, item]);
    if (item.duration) {
      window.setTimeout(() => {
        setToasts((items) => items.filter((existing) => existing.id !== item.id));
      }, item.duration);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(() => ({ toasts, publish, dismiss }), [toasts, publish, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return {
    toast: context.publish,
    dismiss: context.dismiss,
  };
}

export function Toaster() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("Toaster must be rendered within ToastProvider");
  }

  return (
    <RadixToastProvider swipeDirection="right">
      {context.toasts.map((toast) => (
        <Toast key={toast.id} onOpenChange={(open) => !open && context.dismiss(toast.id)}>
          {toast.title ? <ToastTitle>{toast.title}</ToastTitle> : null}
          {toast.description ? <ToastDescription>{toast.description}</ToastDescription> : null}
        </Toast>
      ))}
      <ToastViewport />
    </RadixToastProvider>
  );
}
