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
      className="min-h-[320px] w-full rounded-3xl border border-tileBorder bg-tileStrong px-6 py-5 text-lg text-textMuted shadow-tile outline-none transition focus:border-tileBorderStrong focus:shadow-tileStrong typing-ripple"
    />
  );
};
