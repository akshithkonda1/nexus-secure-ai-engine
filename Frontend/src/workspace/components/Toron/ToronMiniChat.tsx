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
    <div className="space-y-2 text-sm text-textMuted">
      <p className="text-textSecondary">
        Toron keeps it short. {tasks.length} tasks, {entries.length} dates captured.
      </p>
      {prompts.map((prompt) => (
        <button
          key={prompt.id}
          className="flex w-full items-center justify-between rounded-xl border border-tileBorder bg-tileStrong px-4 py-3 text-left shadow-tile transition hover:border-tileBorderStrong"
          onClick={() => void handlePrompt(prompt.id, prompt.action)}
        >
          <span>{prompt.label}</span>
          <span className="text-xs text-textMuted">Consent required</span>
        </button>
      ))}
      <button
        className="w-full rounded-xl border border-tileBorder px-4 py-3 text-textMuted shadow-tile transition hover:border-tileBorderStrong"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};
