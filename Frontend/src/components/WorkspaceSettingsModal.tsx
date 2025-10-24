// Temporary shim to avoid Vite import errors after the rename.
// Purpose: make old imports of "../components/WorkspaceSettingsModal" work.
// When all imports are updated to WorkPlaceSettingsModal, delete this file.

export {
  default,
  FEEDBACK_MAX_LENGTH,
  FEEDBACK_CATEGORIES,
  type FeedbackDraft,
  type FeedbackHistoryEntry,
  type SystemFeedbackDraft,
  type SystemFeedbackHistoryEntry,
} from "./WorkPlaceSettingsModal";
