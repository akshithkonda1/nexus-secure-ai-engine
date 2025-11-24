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
      className="fixed bottom-6 right-4 z-40 w-64 rounded-2xl border border-border p-4 text-foreground shadow-2xl backdrop-blur"
      style={{ background: "rgb(var(--panel) / 0.9)" }}
    >
      <p className="text-sm font-semibold">How’s the debate quality?</p>
      <p className="mt-1 text-xs text-subtle">Tap an emoji to send anonymous feedback.</p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--ring))]"
          style={{ background: "rgb(var(--panel))" }}
          onClick={() => handleChoice("up")}
          disabled={submitted !== null}
          aria-label="Debate quality is good"
        >
          <ThumbsUp className="h-4 w-4" aria-hidden="true" />
          Good
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--ring))]"
          style={{ background: "rgb(var(--panel))" }}
          onClick={() => handleChoice("down")}
          disabled={submitted !== null}
          aria-label="Debate quality needs work"
        >
          <ThumbsDown className="h-4 w-4" aria-hidden="true" />
          Needs work
        </button>
      </div>
      {submitted ? (
        <p className="mt-3 text-center text-xs text-subtle" role="status">
          Thanks for the {submitted === "up" ? "love" : "feedback"}! We’ll use it to improve Ryuzen.ai.
        </p>
      ) : null}
      <button
        type="button"
        className="mt-2 w-full text-center text-xs text-subtle underline-offset-2 hover:underline"
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
