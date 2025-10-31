import * as React from "react";
import { cn } from "@/shared/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-input border border-app bg-app px-4 text-sm text-app shadow-press transition placeholder:text-muted focus-visible:border-accent-nexus",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
