import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { forwardRef } from "react";
import { cn } from "../lib/cn";

export const Avatar = forwardRef<HTMLSpanElement, AvatarPrimitive.AvatarProps>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-subtle bg-accent-soft text-sm font-medium text-accent",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

export const AvatarImage = AvatarPrimitive.Image;

export const AvatarFallback = forwardRef<HTMLSpanElement, AvatarPrimitive.AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback ref={ref} className={cn("flex h-full w-full items-center justify-center", className)} {...props} />
  ),
);
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
