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
    <div className="space-y-4">
      <textarea
        className="min-h-[200px] w-full resize-none rounded-xl bg-white/5 px-5 py-4 text-base font-medium leading-relaxed text-slate-100 placeholder:text-slate-400/70 shadow-inner shadow-black/30 focus:outline-none"
        placeholder="Ask anything…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          className="rounded-md border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-100/80 transition hover:border-white/20 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
