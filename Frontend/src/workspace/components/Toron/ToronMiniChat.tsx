import React, { useMemo } from "react";
import { useListsStore } from "../../state/listsStore";
import { useCalendarStore } from "../../state/calendarStore";
import { requireUserConsent } from "../../utils/consent";

export type ToronMiniChatProps = {
  onClose: () => void;
};

export const ToronMiniChat: React.FC<ToronMiniChatProps> = ({ onClose }) => {
  const { tasks, addTask } = useListsStore();
  const { entries, captureDetectedDates } = useCalendarStore();

  const prompts = useMemo(
    () => [
      { id: "task", label: "Add to tasks?", action: () => addTask("Captured from Toron") },
      {
        id: "calendar",
        label: "Add to calendar?",
        action: () => captureDetectedDates([{ title: "Toron suggestion", date: new Date().toISOString() }]),
      },
      { id: "board", label: "Move to board?", action: () => onClose() },
    ],
    [addTask, captureDetectedDates, onClose]
  );

  const handlePrompt = async (promptId: string, action: () => void) => {
    const consented = await requireUserConsent(`toron-${promptId}`);
    if (!consented) return;
    action();
    onClose();
  };

  return (
    <div className="space-y-2 text-sm text-neutral-800 dark:text-neutral-200">
      <p className="text-neutral-700 dark:text-neutral-300">
        Toron keeps it short. {tasks.length} tasks, {entries.length} dates captured.
      </p>
      {prompts.map((prompt) => (
        <button
          key={prompt.id}
          className="flex w-full items-center justify-between rounded-xl border border-neutral-300/50 dark:border-neutral-700/50 bg-white/85 dark:bg-neutral-900/85 px-4 py-3 text-left shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)]"
          onClick={() => void handlePrompt(prompt.id, prompt.action)}
        >
          <span>{prompt.label}</span>
          <span className="text-xs text-neutral-700 dark:text-neutral-300">Consent required</span>
        </button>
      ))}
      <button
        className="w-full rounded-xl border border-neutral-300/50 dark:border-neutral-700/50 px-4 py-3 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)]"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};
