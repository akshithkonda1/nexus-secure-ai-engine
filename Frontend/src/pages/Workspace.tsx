import { useState } from "react";
import AppShell from "../layouts/AppShell";
import WorkspaceSurface from "../components/workspace/WorkspaceSurface";
import { CanvasMode } from "../components/workspace/types";

export default function WorkspacePage() {
  const [mode, setMode] = useState<CanvasMode>("pages");
  const [isCleared, setIsCleared] = useState(false);

  const handleModeChange = (next: CanvasMode) => {
    setMode(next);
    setIsCleared(false);
  };

  const handleHome = () => {
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
