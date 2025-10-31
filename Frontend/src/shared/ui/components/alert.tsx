import * as React from "react";
import { cn } from "@/shared/lib/cn";

type AlertVariant = "default" | "warning";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

const variantClasses: Record<AlertVariant, string> = {
  default: "border-app/40 bg-app/40 text-app",
  warning: "border-yellow-400/60 bg-yellow-200/20 text-yellow-900"
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className, variant = "default", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="status"
      className={cn("rounded-xl border p-4 text-sm", variantClasses[variant], className)}
      {...props}
    />
  );
});

export const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function AlertTitle({ className, ...props }, ref) {
    return <h2 ref={ref} className={cn("text-base font-semibold", className)} {...props} />;
  }
);

export const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function AlertDescription({ className, ...props }, ref) {
    return <p ref={ref} className={cn("mt-2 text-sm", className)} {...props} />;
  }
);
