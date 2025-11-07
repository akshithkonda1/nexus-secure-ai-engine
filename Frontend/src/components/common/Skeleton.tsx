import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-white/10", className)}
      {...props}
    />
  );
}
