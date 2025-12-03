import React from "react";

export type PageEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export const PageEditor: React.FC<PageEditorProps> = ({ value, onChange, onBlur }) => {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      placeholder="Start typing to ripple across your workspace..."
      className="min-h-[320px] w-full rounded-3xl bg-neutral-900/70 p-6 text-lg text-neutral-50 shadow-lg outline-none ring-1 ring-neutral-800 transition focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-950 typing-ripple"
    />
  );
};
