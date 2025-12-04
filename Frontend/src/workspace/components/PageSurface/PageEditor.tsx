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
      className="min-h-[320px] w-full rounded-3xl border border-white/10 dark:border-neutral-700/20 bg-white/85 dark:bg-neutral-900/85 p-6 md:p-8 text-lg text-neutral-800 dark:text-neutral-200 leading-relaxed shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl outline-none transition focus:border-white/20 focus:shadow-[0_4px_24px_rgba(0,0,0,0.18)]"
    />
  );
};
