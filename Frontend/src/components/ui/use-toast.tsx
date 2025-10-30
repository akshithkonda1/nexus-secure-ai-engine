import * as React from "react";
import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "./toast";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  push: (message: Omit<ToastMessage, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastSystem({ children }: { children: React.ReactNode }): JSX.Element {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const push = React.useCallback((message: Omit<ToastMessage, "id">) => {
    const hasCrypto = typeof crypto !== "undefined" && "randomUUID" in crypto;
    const fallbackId = `toast-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
    const id = hasCrypto ? crypto.randomUUID() : fallbackId;
    setToasts((current) => [...current, { ...message, id }]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = React.useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      <ToastProvider swipeDirection="right">
        {children}
        <ToastViewport />
        {toasts.map((toast) => (
          <Toast key={toast.id} open onOpenChange={(open) => !open && dismiss(toast.id)}>
            <div className="flex flex-1 flex-col gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.description ? <ToastDescription>{toast.description}</ToastDescription> : null}
            </div>
            <ToastClose />
          </Toast>
        ))}
      </ToastProvider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastSystem");
  }
  return ctx;
}

export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport };
