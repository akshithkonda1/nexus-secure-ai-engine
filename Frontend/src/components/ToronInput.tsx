import React, { useCallback } from "react";

type ToronInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export default function ToronInput({ value, onChange, onSubmit }: ToronInputProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        onSubmit();
      }
    },
    [onSubmit]
  );

  return (
    <div className="group relative">
      <textarea
        className="min-h-[220px] w-full resize-none rounded-2xl bg-white/5 px-5 py-4 text-base font-medium leading-relaxed text-slate-100 placeholder:text-slate-400/70 shadow-inner shadow-black/30 outline-none ring-0 focus:outline-none"
        placeholder="Ask anything…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!value.trim()}
        className="absolute bottom-4 right-4 inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-100/70 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Submit
      </button>
    </div>
  );
}
