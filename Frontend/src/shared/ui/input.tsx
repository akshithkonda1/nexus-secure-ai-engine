import { forwardRef } from "react";
import { cn } from "../lib/cn";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-subtle bg-transparent px-3 text-sm text-inherit shadow-sm transition focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
