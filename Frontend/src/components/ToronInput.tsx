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
    <div className="flex flex-col gap-4">
      <textarea
        className="min-h-[160px] w-full resize-none rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-base font-normal text-slate-100 outline-none shadow-inner shadow-black/20 transition focus:border-white/20"
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
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#4c57d4] to-[#5b63ff] px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
