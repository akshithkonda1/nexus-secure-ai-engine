import * as React from "react";
import { Link, type LinkProps } from "react-router-dom";
import { Button, type ButtonProps } from "@/shared/ui/components/button";
import { cn } from "@/shared/lib/cn";

export type ChipProps = Omit<ButtonProps, "asChild" | "children"> & {
  to?: LinkProps["to"];
  label: string;
  children?: React.ReactNode;
};

const baseClasses =
  "group w-full rounded-2xl border bg-background px-4 py-3 flex items-center justify-between transition-colors hover:bg-muted";

export function Chip({
  to,
  label,
  className,
  children,
  variant = "ghost",
  type,
  ...btn
}: ChipProps) {
  const content = children ?? label;
  const merged = cn(baseClasses, className);

  if (to) {
    return (
      <Button {...btn} variant={variant} className={merged} asChild>
        <Link to={to} aria-label={label}>
          {content}
        </Link>
      </Button>
    );
  }

  const buttonType = type ?? "button";

  return (
    <Button
      {...btn}
      type={buttonType}
      variant={variant}
      className={merged}
      aria-label={label}
    >
      {content}
    </Button>
  );
}
