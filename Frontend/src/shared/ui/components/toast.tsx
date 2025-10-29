import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/shared/lib/cn";

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Viewport>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Viewport
      ref={ref}
      className={cn(
        "fixed top-4 right-4 z-[1000] flex max-h-screen w-full max-w-sm flex-col gap-2 p-4",
        className
      )}
      {...props}
    />
  )
);
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>>(
  ({ className, ...props }, ref) => {
    return (
      <ToastPrimitive.Root
        ref={ref}
        className={cn(
          "relative grid w-full gap-1 rounded-md border border-border bg-background p-4 text-foreground shadow-card data-[swipe=end]:animate-out data-[state=closed]:animate-out data-[state=delayed-open]:animate-in",
          className
        )}
        {...props}
      />
    );
  }
);
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastTitle = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Title>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
  )
);
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Description>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
ToastDescription.displayName = ToastPrimitive.Description.displayName;

const ToastClose = ToastPrimitive.Close;

export type ToastActionElement = React.ReactNode;

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

export type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastContextValue = {
  toast: (props: ToastProps & { title?: string; description?: string }) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

let toastId = 0;

export function ToastProviderWithToasts({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { key: number; title?: string; description?: string }>>([]);

  const toast = React.useCallback((props: ToastProps & { title?: string; description?: string }) => {
    toastId += 1;
    setToasts(current => [...current, { ...props, key: toastId }]);
  }, []);

  const handleOpenChange = (key: number, open: boolean) => {
    if (!open) {
      setToasts(current => current.filter(item => item.key !== key));
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastProvider>
        {children}
        {toasts.map(({ key, title, description, ...toastProps }) => (
          <Toast key={key} open onOpenChange={open => handleOpenChange(key, open)} {...toastProps}>
            {title ? <ToastTitle>{title}</ToastTitle> : null}
            {description ? <ToastDescription>{description}</ToastDescription> : null}
            <ToastClose className="absolute right-2 top-2 text-sm text-muted-foreground">×</ToastClose>
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProviderWithToasts");
  }
  return ctx;
}

export { ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose };
