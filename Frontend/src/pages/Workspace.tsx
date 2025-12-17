import { useState } from "react";
import AppShell from "../layouts/AppShell";
import WorkspaceSurface from "../components/workspace/WorkspaceSurface";
import { CanvasMode } from "../components/workspace/types";

type CanvasMemory = {
  mode: CanvasMode;
  cleared: boolean;
};

let canvasMemory: CanvasMemory = {
  mode: "pages",
  cleared: false,
};

export default function WorkspacePage() {
  const [mode, setMode] = useState<CanvasMode>(canvasMemory.mode);
  const [isCleared, setIsCleared] = useState<boolean>(canvasMemory.cleared);

  const handleModeChange = (next: CanvasMode) => {
    canvasMemory = { mode: next, cleared: false };
    setMode(next);
    setIsCleared(false);
  };

  const handleHome = () => {
    canvasMemory = { mode, cleared: true };
    setIsCleared(true);
  };

  return (
    <AppShell
      fullBleed
      contentClassName="relative h-full min-h-screen w-full overflow-hidden bg-[var(--bg-app)]"
    >
      <WorkspaceSurface mode={mode} onModeChange={handleModeChange} isCleared={isCleared} onHome={handleHome} />
    </AppShell>
  );
}
