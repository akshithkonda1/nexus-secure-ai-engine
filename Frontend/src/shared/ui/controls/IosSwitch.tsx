import { useId, KeyboardEvent } from "react";
import { cn } from "@/shared/lib/cn";

export type IosSwitchProps = {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  label?: string;
  id?: string;
  className?: string;
};

export function IosSwitch({ checked, onCheckedChange, label, id, className }: IosSwitchProps) {
  const autoId = useId();
  const controlId = id ?? autoId;
  const labelId = label ? `${controlId}-label` : undefined;

  const handleToggle = () => {
    onCheckedChange(!checked);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      type="button"
      id={controlId}
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      aria-label={labelId ? undefined : label}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border border-transparent transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)]",
        checked
          ? "bg-[color:var(--accent)]"
          : "bg-[color:rgba(148,163,184,0.35)] dark:bg-[color:rgba(71,85,105,0.55)]",
        className
      )}
    >
      {label ? (
        <span id={labelId} className="sr-only">
          {label}
        </span>
      ) : null}
      <span
        aria-hidden="true"
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-150 ease-out",
          checked ? "translate-x-[1.375rem]" : "translate-x-1"
        )}
      />
    </button>
  );
}
