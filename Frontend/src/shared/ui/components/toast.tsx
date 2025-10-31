import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/shared/lib/cn";

type ToastVariant = "default" | "success" | "error";

type ToastPayload = {
  id: string;
  title?: string;
  description?: string;
  variant: ToastVariant;
};

type ToastSubscriber = (payload: ToastPayload) => void;

const subscribers = new Set<ToastSubscriber>();

function emitToast(payload: ToastPayload) {
  subscribers.forEach((subscriber) => subscriber(payload));
}

function subscribe(subscriber: ToastSubscriber) {
  subscribers.add(subscriber);
  return () => {
    subscribers.delete(subscriber);
  };
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const TOAST_DURATION = 4200;

export const toast = {
  success(message: string, description?: string) {
    emitToast({
      id: createId(),
      title: message,
      description,
      variant: "success"
    });
  },
  error(message: string, description?: string) {
    emitToast({
      id: createId(),
      title: message,
      description,
      variant: "error"
    });
  },
  show(message: string, description?: string) {
    emitToast({
      id: createId(),
      title: message,
      description,
      variant: "default"
    });
  }
};

export const Toaster: React.FC = () => {
  const [items, setItems] = React.useState<ToastPayload[]>([]);

  const remove = React.useCallback((id: string) => {
    setItems((current) => current.filter((toastItem) => toastItem.id !== id));
  }, []);

  React.useEffect(() => {
    return subscribe((payload) => {
      setItems((current) => [...current, payload]);
    });
  }, []);

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={TOAST_DURATION}>
      {items.map((item) => (
        <ToastPrimitive.Root
          key={item.id}
          className={cn(
            "pointer-events-auto grid gap-1 rounded-[16px] border px-4 py-3 shadow-ambient",
            "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]",
            item.variant === "success" && "border-green-500/30",
            item.variant === "error" && "border-red-500/30"
          )}
          duration={TOAST_DURATION}
          defaultOpen
          onOpenChange={(open) => {
            if (!open) {
              remove(item.id);
            }
          }}
        >
          {item.title ? (
            <ToastPrimitive.Title className="text-sm font-medium leading-none">
              {item.title}
            </ToastPrimitive.Title>
          ) : null}
          {item.description ? (
            <ToastPrimitive.Description className="text-sm text-[var(--text-muted)]">
              {item.description}
            </ToastPrimitive.Description>
          ) : null}
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport
        className={cn(
          "fixed top-6 right-6 z-[1100] flex max-h-screen w-80 flex-col gap-3 outline-none",
          "[--radix-toast-swipe-move-x:var(--radix-toast-swipe-end-x)]"
        )}
      />
    </ToastPrimitive.Provider>
  );
};
