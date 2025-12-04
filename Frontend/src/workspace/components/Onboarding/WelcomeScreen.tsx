import React, { useState } from "react";

export type WelcomeScreenProps = {
  onStart: () => void;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [value, setValue] = useState("");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-neutral-950 via-black to-neutral-900 px-6 text-center text-neutral-200 leading-relaxed">
      <div className="relative max-w-xl rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 p-6 md:p-8 text-left shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-[1.01]">
        <div className="absolute inset-0 pointer-events-none rounded-3xl backdrop-blur-xl" />
        <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Welcome to Workspace.</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">Write anything to begin.</p>
        <textarea
          value={value}
          onChange={(event) => {
            if (!value) {
              onStart();
            }
            setValue(event.target.value);
          }}
          placeholder="Start typing..."
          className="mt-4 min-h-[140px] w-full rounded-2xl border border-neutral-300/50 dark:border-neutral-700/50 bg-white/85 dark:bg-neutral-900/85 p-6 md:p-8 text-left text-neutral-800 dark:text-neutral-200 leading-relaxed shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl outline-none transition focus:border-neutral-400/70 focus:shadow-[0_4px_24px_rgba(0,0,0,0.18)] dark:focus:border-neutral-500/70"
        />
      </div>
    </div>
  );
};
