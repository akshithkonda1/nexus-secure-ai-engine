import { ComponentProps } from "react";

type Props = ComponentProps<"button"> & { label: string };

export default function IconButton({ label, className = "", children, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      className={[
        "inline-flex items-center justify-center h-11 w-11 rounded-2xl",
        "border border-slate-300/80 bg-white/80 dark:bg-slate-900/80",
        "backdrop-blur-sm shadow-sm hover:shadow transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
