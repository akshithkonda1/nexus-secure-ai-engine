import * as ToastPrimitive from "@radix-ui/react-toast";
import { forwardRef } from "react";
import { cn } from "../lib/cn";

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = forwardRef<HTMLDivElement, ToastPrimitive.ToastViewportProps>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

export const Toast = forwardRef<HTMLDivElement, ToastPrimitive.ToastProps>(({ className, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full flex-col gap-2 rounded-lg border border-subtle bg-surface/95 p-4 text-sm shadow-lg backdrop-blur",
      className,
    )}
    {...props}
  />
));
Toast.displayName = ToastPrimitive.Root.displayName;

export const ToastTitle = forwardRef<HTMLDivElement, ToastPrimitive.ToastTitleProps>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

export const ToastDescription = forwardRef<HTMLDivElement, ToastPrimitive.ToastDescriptionProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Description ref={ref} className={cn("text-xs text-muted", className)} {...props} />
  ),
);
ToastDescription.displayName = ToastPrimitive.Description.displayName;

export const ToastAction = ToastPrimitive.Action;
export const ToastClose = ToastPrimitive.Close;
