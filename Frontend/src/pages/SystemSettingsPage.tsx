import React, { useCallback, useEffect, useState } from "react";
import WorkPlaceSettingsModal, {
  type FeedbackDraft,
  type FeedbackHistoryEntry,
  FEEDBACK_CATEGORIES,
} from "../components/WorkPlaceSettingsModal";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "nexus.system_feedback";
const HISTORY_LIMIT = 50;

type StoredEntry = FeedbackHistoryEntry;

export default function SystemSettingsPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<StoredEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredEntry[];
      if (Array.isArray(parsed)) {
        setHistory(
          parsed
            .filter((entry) => typeof entry?.id === "string" && typeof entry?.message === "string")
            .map((entry) => ({
              ...entry,
              category: FEEDBACK_CATEGORIES.includes(entry.category)
                ? entry.category
                : FEEDBACK_CATEGORIES[FEEDBACK_CATEGORIES.length - 1],
            }))
        );
      }
    } catch (error) {
      console.warn("Unable to hydrate feedback history", error);
    }
  }, []);

  const updateHistory = useCallback((updater: (previous: StoredEntry[]) => StoredEntry[]) => {
    setHistory((previous) => {
      const next = updater(previous);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        console.warn("Failed to persist feedback history", error);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (draft: FeedbackDraft) => {
      updateHistory((previous) => {
        const entry: StoredEntry = {
          id:
            typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
              ? crypto.randomUUID()
              : Math.random().toString(36).slice(2),
          submittedAt: new Date().toISOString(),
          message: draft.message,
          category: draft.category,
          contact: draft.contact,
        };
        return [entry, ...previous].slice(0, HISTORY_LIMIT);
      });
    },
    [updateHistory]
  );

  const handleDelete = useCallback(
    (id: string) => {
      updateHistory((previous) => previous.filter((entry) => entry.id !== id));
    },
    [updateHistory]
  );

  const handleClose = useCallback(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <WorkPlaceSettingsModal
      open
      history={history}
      onClose={handleClose}
      onSubmitFeedback={handleSubmit}
      onDeleteEntry={handleDelete}
    />
  );
}
