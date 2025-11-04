import { cn } from "@/shared/lib/cn";
import { PropsWithChildren } from "react";

export function Panel({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-app bg-panel shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function InputShell({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-app bg-panel text-ink placeholder:text-muted focus-within:border-trustBlue/40 focus-within:ring-2 focus-within:ring-trustBlue/50",
        className
      )}
    >
      {children}
    </div>
  );
}
