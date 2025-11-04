import * as SheetPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "@/shared/lib/cn";

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;
export const SheetPortal = SheetPrimitive.Portal;
export const SheetOverlay = React.forwardRef<HTMLDivElement, SheetPrimitive.DialogOverlayProps>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-40 bg-app-text/60 backdrop-blur-sm", className)}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

export const SheetContent = React.forwardRef<HTMLDivElement, SheetPrimitive.DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          "fixed bottom-0 right-0 top-0 z-50 w-96 border-l border-app bg-app p-6 shadow-ambient focus:outline-none",
          className
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
);
SheetContent.displayName = SheetPrimitive.Content.displayName;
