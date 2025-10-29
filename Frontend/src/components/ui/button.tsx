import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-transparent",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--mode-accent-solid)] text-white shadow-sm hover:opacity-90 focus-visible:ring-[var(--mode-accent-solid)]",
        secondary: "bg-[var(--app-surface)] text-primary border border-subtle hover:bg-[var(--app-muted)]",
        ghost: "hover:bg-[var(--app-muted)] text-primary",
        outline:
          "border border-subtle text-primary bg-transparent hover:bg-[var(--app-muted)] focus-visible:ring-[var(--mode-accent-solid)]",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
        link: "text-[var(--mode-accent-solid)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
