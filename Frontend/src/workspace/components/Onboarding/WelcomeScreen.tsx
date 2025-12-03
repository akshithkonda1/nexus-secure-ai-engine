import React, { useState } from "react";

export type WelcomeScreenProps = {
  onStart: () => void;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [value, setValue] = useState("");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bgElevated px-6 text-center text-textMuted">
      <div className="max-w-xl rounded-3xl bg-bgElevated/80 p-8 shadow-2xl ring-1 ring-neutral-800">
        <h1 className="text-2xl font-semibold">Welcome to Workspace.</h1>
        <p className="mt-2 text-textMuted">Write anything to begin.</p>
        <textarea
          value={value}
          onChange={(event) => {
            if (!value) {
              onStart();
            }
            setValue(event.target.value);
          }}
          placeholder="Start typing..."
          className="mt-4 min-h-[140px] w-full rounded-2xl bg-bgElevated/70 p-4 text-left text-textMuted outline-none ring-1 ring-neutral-800 transition focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};
