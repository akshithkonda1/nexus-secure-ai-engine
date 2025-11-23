import clsx from "classnames";
import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({ className, rounded = "md", ...props }: SkeletonProps) {
  const radius =
    rounded === "full"
      ? "rounded-full"
      : rounded === "lg"
        ? "rounded-xl"
        : rounded === "sm"
          ? "rounded"
          : "rounded-lg";

  return (
    <div
      className={clsx(
        "animate-pulse bg-[color-mix(in_srgb,var(--text-secondary)_12%,transparent)]",
        radius,
        className,
      )}
      {...props}
    />
  );
}
