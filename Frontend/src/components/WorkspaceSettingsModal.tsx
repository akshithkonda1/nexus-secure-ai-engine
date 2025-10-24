// Temporary shim to avoid Vite import errors after the rename.
// Purpose: make old imports of "../components/WorkspaceSettingsModal" work.
// When all imports are updated to WorkPlaceSettingsModal, delete this file.

export {
  default,
  WORKSPACE_SETTINGS_DEFAULTS,
  type WorkspaceSettings,
} from "./WorkPlaceSettingsModal";
