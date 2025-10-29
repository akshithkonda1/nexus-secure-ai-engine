import * as SheetPrimitive from "@radix-ui/react-dialog";
import { forwardRef } from "react";
import { cn } from "../lib/cn";

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;

export const SheetContent = forwardRef<HTMLDivElement, SheetPrimitive.DialogContentProps>(
  ({ className, children, side = "right", ...props }, ref) => (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-40 bg-slate-950/40" />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 flex h-full w-full max-w-md flex-col border-l border-subtle bg-surface/95 p-6 shadow-2xl backdrop-blur",
          side === "right" ? "right-0 top-0" : "left-0 top-0",
          className,
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  ),
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

export const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4 flex items-center justify-between", className)} {...props} />
);
