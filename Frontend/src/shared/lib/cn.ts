import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(
  ...inputs: (string | null | false | undefined | Record<string, boolean>)[]
): string {
  return twMerge(clsx(inputs));
}
