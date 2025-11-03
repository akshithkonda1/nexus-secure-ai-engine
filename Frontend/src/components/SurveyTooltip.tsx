import { useEffect, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";

export type SurveyTooltipProps = {
  open: boolean;
  onSubmit: (value: "up" | "down") => Promise<void> | void;
  onDismiss?: () => void;
};

export function SurveyTooltip({ open, onSubmit, onDismiss }: SurveyTooltipProps) {
  const [visible, setVisible] = useState(open);
  const [submitted, setSubmitted] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    setVisible(open);
  }, [open]);

  if (!visible) {
    return null;
  }

  const handleChoice = async (choice: "up" | "down") => {
    setSubmitted(choice);
    await onSubmit(choice);
    setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Share quick feedback"
      className="fixed bottom-6 right-4 z-40 w-64 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-slate-100 shadow-2xl backdrop-blur"
    >
      <p className="text-sm font-semibold">How’s the debate quality?</p>
      <p className="mt-1 text-xs text-slate-300">Tap an emoji to send anonymous feedback.</p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-transparent bg-slate-800 px-3 py-2 text-sm font-medium transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
          onClick={() => handleChoice("up")}
          disabled={submitted !== null}
          aria-label="Debate quality is good"
        >
          <ThumbsUp className="h-4 w-4" aria-hidden="true" />
          Good
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-transparent bg-slate-800 px-3 py-2 text-sm font-medium transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
          onClick={() => handleChoice("down")}
          disabled={submitted !== null}
          aria-label="Debate quality needs work"
        >
          <ThumbsDown className="h-4 w-4" aria-hidden="true" />
          Needs work
        </button>
      </div>
      {submitted ? (
        <p className="mt-3 text-center text-xs text-slate-300" role="status">
          Thanks for the {submitted === "up" ? "love" : "feedback"}! We’ll use it to improve Nexus.ai.
        </p>
      ) : null}
      <button
        type="button"
        className="mt-2 w-full text-center text-xs text-slate-400 underline-offset-2 hover:underline"
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
