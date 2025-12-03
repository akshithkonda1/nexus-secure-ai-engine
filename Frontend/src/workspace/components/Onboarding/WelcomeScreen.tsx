import React, { useState } from "react";

export type WelcomeScreenProps = {
  onStart: () => void;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [value, setValue] = useState("");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-neutral-950 via-black to-neutral-900 px-6 text-center text-textMuted">
      <div className="relative max-w-xl rounded-3xl bg-tile bg-tileGradient border border-tileBorder px-8 py-7 text-left shadow-tile before:absolute before:inset-0 before:rounded-3xl before:bg-tileInner before:content-[''] before:pointer-events-none transition-all duration-300 hover:shadow-tileStrong hover:border-tileBorderStrong">
        <h1 className="text-2xl font-semibold text-textPrimary">Welcome to Workspace.</h1>
        <p className="mt-2 text-textSecondary">Write anything to begin.</p>
        <textarea
          value={value}
          onChange={(event) => {
            if (!value) {
              onStart();
            }
            setValue(event.target.value);
          }}
          placeholder="Start typing..."
          className="mt-4 min-h-[140px] w-full rounded-2xl border border-tileBorder bg-tileStrong px-4 py-3 text-left text-textMuted shadow-tile outline-none transition focus:border-tileBorderStrong focus:shadow-tileStrong"
        />
      </div>
    </div>
  );
};
