/* eslint-disable react/prop-types */
import * as React from "react";

import { cn } from "@/shared/lib/cn";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-subtle bg-transparent px-3 py-2 text-sm text-primary shadow-sm transition file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mode-accent-solid)]",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
